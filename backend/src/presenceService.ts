// ============================================================
// Presence & Anti-Abuse Service — Sync Mind (THIS ⚡ THAT)
// Server-authoritative presence, IP hashing, 30s grace reconnection & auto results
// ============================================================

import crypto from 'crypto';
import type { Request } from 'express';
import {
  Room,
  PlayerPresence,
  GameResultRecord,
  CompletionReason,
  ResultType,
  FinalReport,
} from './types';
import {
  getRoom,
  getAllRooms,
  setRoom,
  tryAcquireFinalizeLock,
  releaseFinalizeLock,
  saveGameResult,
  getGameResult,
} from './store';
import { generateFinalReport } from './questionService';

// Configurations
export const HEARTBEAT_INTERVAL_MS = 6_000;
export const INACTIVITY_TIMEOUT_MS = 12_000; // Time without heartbeat before marking DISCONNECTED
export const GRACE_PERIOD_MS = 30_000;       // 30-second reconnection grace period
export const PRESENCE_RETENTION_MS = 60 * 60_000;

// In-memory presence map keyed by "roomCode::playerId"
const presences = new Map<string, PlayerPresence>();

// Rate limit tracker: key -> { count, resetAt }
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function presenceKey(roomCode: string, playerId: string): string {
  return `${roomCode.toUpperCase()}::${playerId}`;
}

// ---- Secure IP Hashing & Extraction ----

export function getClientIp(req: Request): string {
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (typeof cfConnectingIp === 'string' && cfConnectingIp.trim().length > 0) {
    return cfConnectingIp.trim();
  }

  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    const first = forwarded.split(',')[0].trim();
    if (first.length > 0) return first;
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim().length > 0) {
    return realIp.trim();
  }

  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
}

export function hashIp(rawIp: string): string {
  // Normalize IPv6 localhost & prefixes
  let normalized = rawIp.trim().toLowerCase();
  if (normalized === '::1' || normalized === '::ffff:127.0.0.1') {
    normalized = '127.0.0.1';
  } else if (normalized.startsWith('::ffff:')) {
    normalized = normalized.slice(7);
  }

  const secret = process.env.IP_HASH_SECRET || 'synq_anti_abuse_salt_2026_secure';
  return crypto.createHmac('sha256', secret).update(normalized).digest('hex');
}

export function getIpHash(req: Request): string {
  return hashIp(getClientIp(req));
}

// ---- Rate Limiter ----

export function checkRateLimit(key: string, maxLimit: number = 30, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const current = rateLimits.get(key);

  if (!current || now > current.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= maxLimit) {
    return false; // Limit exceeded
  }

  current.count++;
  return true;
}

export function cleanupTransientPresenceState(now = Date.now()): {
  removedPresences: number;
  removedRateLimits: number;
} {
  const activeRoomCodes = new Set(Array.from(getAllRooms().keys()).map(code => code.toUpperCase()));
  let removedPresences = 0;
  let removedRateLimits = 0;

  for (const [key, presence] of presences.entries()) {
    const roomIsGone = !activeRoomCodes.has(presence.roomCode.toUpperCase());
    const isStale = now - presence.lastHeartbeat > PRESENCE_RETENTION_MS;

    if (roomIsGone || isStale) {
      presences.delete(key);
      removedPresences++;
    }
  }

  for (const [key, limit] of rateLimits.entries()) {
    if (now > limit.resetAt) {
      rateLimits.delete(key);
      removedRateLimits++;
    }
  }

  return { removedPresences, removedRateLimits };
}

// ---- Anti-Abuse: One Player Per IP Per Room ----

export function checkSameRoomIpCollision(roomCode: string, ipHash: string): { allowed: boolean; error?: string } {
  const room = getRoom(roomCode);
  if (!room) return { allowed: true };

  // Check if host in this exact room has the same IP hash
  if (room.hostIpHash && room.hostIpHash === ipHash) {
    return {
      allowed: false,
      error: 'Ek device/network se already ek player game mein hai.',
    };
  }

  return { allowed: true };
}

// ---- Presence Registration & Updates ----

export function registerPlayerPresence(
  roomCode: string,
  playerId: string,
  sessionId: string,
  playerName: string,
  role: 'host' | 'guest',
  ipHash: string
): PlayerPresence {
  const now = Date.now();
  const key = presenceKey(roomCode, playerId);
  const existing = presences.get(key);

  const presence: PlayerPresence = {
    roomCode: roomCode.toUpperCase(),
    playerId,
    sessionId: sessionId || (existing?.sessionId ?? crypto.randomUUID()),
    ipHash,
    playerName,
    role,
    status: 'CONNECTED',
    joinedAt: existing ? existing.joinedAt : now,
    lastHeartbeat: now,
    disconnectStartedAt: null,
  };

  presences.set(key, presence);
  return presence;
}

export function getPlayerPresence(roomCode: string, playerId: string): PlayerPresence | undefined {
  return presences.get(presenceKey(roomCode, playerId));
}

// ---- Heartbeat Handler ----

export function handleHeartbeat(
  roomCode: string,
  playerId: string,
  sessionId: string,
  minUpdateIntervalMs = 0
): { success: boolean; room?: Room; error?: string } {
  const room = getRoom(roomCode);
  if (!room) {
    return { success: false, error: 'ROOM NOT FOUND.' };
  }

  const isHost = room.hostPlayerId === playerId;
  const isGuest = room.guestPlayerId === playerId;
  if (!isHost && !isGuest) {
    return { success: false, error: 'Player identity mismatch.' };
  }

  const key = presenceKey(roomCode, playerId);
  const presence = presences.get(key);
  const now = Date.now();
  const expectedSessionId = isHost ? room.hostSessionId : room.guestSessionId;
  if (!sessionId || !expectedSessionId || expectedSessionId !== sessionId) {
    const isOtherActive = presence ? now - presence.lastHeartbeat < INACTIVITY_TIMEOUT_MS : false;
    return {
      success: false,
      error: isOtherActive ? 'Game already open in another tab.' : 'Player session mismatch.',
      room,
    };
  }

  if (presence) {
    // Validate session identity to prevent duplicate tab hijacking
    if (sessionId && presence.sessionId && presence.sessionId !== sessionId) {
      // Check if the other session is actively sending heartbeats
      const isOtherActive = now - presence.lastHeartbeat < INACTIVITY_TIMEOUT_MS;
      if (isOtherActive) {
        return {
          success: false,
          error: 'Game already open in another tab.',
          room,
        };
      } else {
        // Assume player switched tabs/refreshed
        presence.sessionId = sessionId;
      }
    }

    const shouldRecordHeartbeat =
      minUpdateIntervalMs <= 0 ||
      now - presence.lastHeartbeat >= minUpdateIntervalMs ||
      presence.status !== 'CONNECTED' ||
      room.status === 'PLAYER_DISCONNECTED';

    if (!shouldRecordHeartbeat) {
      return { success: true, room };
    }

    presence.lastHeartbeat = now;
    presence.status = 'CONNECTED';
    presence.disconnectStartedAt = null;
  }

  if (playerId === room.hostPlayerId) {
    room.hostLastSeenAt = now;
  } else if (playerId === room.guestPlayerId) {
    room.guestLastSeenAt = now;
  }

  // If room was in PLAYER_DISCONNECTED and this player is back (or both back)
  if (room.status === 'PLAYER_DISCONNECTED') {
    const hostPres = getPlayerPresence(roomCode, room.hostPlayerId);
    const guestPres = room.guestPlayerId ? getPlayerPresence(roomCode, room.guestPlayerId) : undefined;

    const hostOk = hostPres ? hostPres.status === 'CONNECTED' && now - hostPres.lastHeartbeat <= INACTIVITY_TIMEOUT_MS : true;
    const guestOk = guestPres ? guestPres.status === 'CONNECTED' && now - guestPres.lastHeartbeat <= INACTIVITY_TIMEOUT_MS : true;

    if (hostOk && guestOk) {
      console.log(`[PRESENCE] Room ${roomCode}: Reconnected! Restoring active gameplay.`);
      room.status = 'PLAYING';
      room.disconnectedPlayerName = null;
      room.disconnectedRole = null;
      room.disconnectStartedAt = null;
      room.disconnectGraceRemaining = null;
      room.stateVersion = (room.stateVersion || 1) + 1;
      setRoom(room);
    }
  }

  return { success: true, room };
}

// ---- Reconnection Handler ----

export function handlePlayerReconnect(
  roomCode: string,
  playerId: string,
  sessionId: string
): { success: boolean; room?: Room; error?: string } {
  const room = getRoom(roomCode);
  if (!room) {
    // Check if result is saved
    const saved = getGameResult(roomCode);
    if (saved) {
      return { success: true, error: 'Game has already completed.' };
    }
    return { success: false, error: 'ROOM NOT FOUND.' };
  }

  const key = presenceKey(roomCode, playerId);
  let presence = presences.get(key);

  const now = Date.now();
  if (!presence) {
    const isHost = room.hostPlayerId === playerId;
    const isGuest = room.guestPlayerId === playerId;
    if (!isHost && !isGuest) {
      return { success: false, error: 'Invalid player ID for this room.' };
    }
    const name = isHost ? room.hostPlayerName : (room.guestPlayerName || 'Guest');
    const role: 'host' | 'guest' = isHost ? 'host' : 'guest';
    const ipHash = isHost ? (room.hostIpHash || '') : (room.guestIpHash || '');

    presence = registerPlayerPresence(roomCode, playerId, sessionId, name, role, ipHash);
  } else {
    // Session match or take over stale session
    presence.sessionId = sessionId;
    presence.status = 'CONNECTED';
    presence.lastHeartbeat = now;
    presence.disconnectStartedAt = null;
  }

  if (playerId === room.hostPlayerId) {
    room.hostLastSeenAt = now;
    room.hostSessionId = sessionId;
  } else if (playerId === room.guestPlayerId) {
    room.guestLastSeenAt = now;
    room.guestSessionId = sessionId;
  }

  // Restore room state if disconnected
  if (room.status === 'PLAYER_DISCONNECTED') {
    room.status = 'PLAYING';
    room.disconnectedPlayerName = null;
    room.disconnectedRole = null;
    room.disconnectStartedAt = null;
    room.disconnectGraceRemaining = null;
    room.stateVersion = (room.stateVersion || 1) + 1;
    setRoom(room);
  }

  console.log(`[RECONNECT] Room ${roomCode}: Player ${playerId} successfully reconnected.`);
  return { success: true, room };
}

// ---- Explicit Disconnect Beacon / Fast Tab Close Handler ----

export function handleExplicitDisconnect(
  roomCode: string,
  playerId: string,
  sessionId?: string
): { success: boolean; room?: Room } {
  const room = getRoom(roomCode);
  if (!room) return { success: false };

  const isHost = room.hostPlayerId === playerId;
  const isGuest = room.guestPlayerId === playerId;
  if (!isHost && !isGuest) {
    return { success: false };
  }

  const expectedSessionId = isHost ? room.hostSessionId : room.guestSessionId;
  if (!sessionId || !expectedSessionId || expectedSessionId !== sessionId) {
    return { success: false };
  }

  const key = presenceKey(roomCode, playerId);
  const presence = presences.get(key);

  if (presence) {
    if (presence.sessionId && presence.sessionId !== sessionId) {
      return { success: false }; // Different tab
    }
    presence.status = 'DISCONNECTED';
    presence.disconnectStartedAt = Date.now();
  }

  const now = Date.now();

  if (isHost) {
    room.hostLastSeenAt = 0; // mark immediately stale
  } else if (isGuest) {
    room.guestLastSeenAt = 0;
  }

  // Trigger grace period if active game
  if ((room.status === 'PLAYING' || room.status === 'REVEALING') && room.guestPlayerId) {
    room.status = 'PLAYER_DISCONNECTED';
    room.disconnectedPlayerName = isHost ? room.hostPlayerName : (room.guestPlayerName || 'Opponent');
    room.disconnectedRole = isHost ? 'host' : 'guest';
    room.disconnectStartedAt = now;
    room.disconnectGraceRemaining = 30;
    room.stateVersion = (room.stateVersion || 1) + 1;
    setRoom(room);
    console.log(`[DISCONNECT BEACON] Room ${roomCode}: ${room.disconnectedPlayerName} closed tab. 30s grace window started.`);
  }

  return { success: true, room };
}

// ---- Voluntary Leave Game (Immediate Default Win) ----

export async function handleVoluntaryLeave(
  roomCode: string,
  playerId: string
): Promise<{ success: boolean; room?: Room; error?: string }> {
  const room = getRoom(roomCode);
  if (!room) {
    return { success: false, error: 'ROOM NOT FOUND.' };
  }

  const isHost = room.hostPlayerId === playerId;
  const isGuest = room.guestPlayerId === playerId;
  if (!isHost && !isGuest) {
    return { success: false, error: 'Player identity mismatch.' };
  }

  if (room.status === 'FINISHED' || room.status === 'COMPLETED' || room.status === 'INTERRUPTED' || room.status === 'ABANDONED') {
    return { success: true, room };
  }

  // Acquire atomic lock
  if (!tryAcquireFinalizeLock(roomCode)) {
    return { success: true, room: getRoom(roomCode) || room };
  }

  try {
    const leavingRole: 'host' | 'guest' = isHost ? 'host' : 'guest';
    const winningRole: 'host' | 'guest' = isHost ? 'guest' : 'host';

    const leavingPlayerName = isHost ? room.hostPlayerName : (room.guestPlayerName || 'Guest');
    const winningPlayerName = isHost ? (room.guestPlayerName || 'Guest') : room.hostPlayerName;
    const winningPlayerId = isHost ? room.guestPlayerId : room.hostPlayerId;
    const leavingPlayerId = playerId;

    console.log(`[VOLUNTARY LEAVE] Room ${roomCode}: ${leavingPlayerName} left. Awarding instant default win to ${winningPlayerName}.`);

    return await finalizeGameResult(
      room,
      winningRole,
      'PLAYER_LEFT',
      'WIN_BY_DEFAULT',
      `${leavingPlayerName} left the game.`,
      winningPlayerId,
      leavingPlayerId,
      winningPlayerName,
      leavingPlayerName
    );
  } finally {
    releaseFinalizeLock(roomCode);
  }
}

// ---- Atomic Game Finalization Engine ----

export async function finalizeGameResult(
  room: Room,
  winnerRole: 'host' | 'guest' | 'none',
  completionReason: CompletionReason,
  resultType: ResultType,
  interruptedReason: string,
  winnerPlayerId: string | null = null,
  loserPlayerId: string | null = null,
  winnerName: string | null = null,
  loserName: string | null = null
): Promise<{ success: boolean; room: Room }> {
  const now = Date.now();
  const isPartial = room.roundNumber < room.totalRounds;

  // Generate complete final report
  let report: FinalReport;
  try {
    report = await generateFinalReport(
      room.history,
      room.hostPlayerName,
      room.guestPlayerName || 'Guest',
      room.matches,
      room.total,
      room.totalRounds,
      isPartial,
      interruptedReason,
      room.gameMode,
      room.aiTone,
      winnerRole === 'host' ? 'guest' : winnerRole === 'guest' ? 'host' : 'both',
      now,
      room.hostGender || 'other',
      room.guestGender || 'other'
    );
  } catch (err) {
    console.error(`[FINALIZE REPORT ERROR] Room ${room.code}:`, err);
    report = {
      headline: resultType === 'WIN_BY_DEFAULT' ? '⚡ DEFAULT WIN UNLOCKED' : '⚡ MATCH CONCLUDED',
      overallVibe: 'Sync Interrupted',
      matchPercentage: room.total > 0 ? Math.round((room.matches / room.total) * 100) : 0,
      completedQuestions: room.total,
      totalQuestions: room.totalRounds,
      strongestMatches: [],
      biggestDifferences: [],
      funniestDifference: '',
      mostUnexpectedMatch: '',
      sharedTendencies: [],
      conversationStarters: [],
      finalVerdict: interruptedReason,
      isPartial: true,
      interruptedReason,
      generatedAt: now,
    };
  }

  report.winnerPlayerId = winnerPlayerId;
  report.loserPlayerId = loserPlayerId;
  report.winnerName = winnerName;
  report.loserName = loserName;
  report.resultType = resultType;
  report.completionReason = completionReason;

  const finalStatus = (resultType === 'ABANDONED' || completionReason === 'BOTH_DISCONNECTED')
    ? 'ABANDONED'
    : 'COMPLETED';

  const updatedRoom: Room = {
    ...room,
    status: finalStatus,
    finalReport: report,
    interruptedReason,
    winnerPlayerId,
    loserPlayerId,
    winnerName,
    loserName,
    resultType,
    completionReason,
    disconnectedPlayerName: null,
    disconnectedRole: null,
    disconnectGraceRemaining: null,
    disconnectStartedAt: null,
    stateVersion: (room.stateVersion || 1) + 1,
    updatedAt: now,
  };

  setRoom(updatedRoom);

  // Persist game result record
  const resultRecord: GameResultRecord = {
    gameId: `${room.code}_${room.createdAt}`,
    roomCode: room.code,
    player1Id: room.hostPlayerId,
    player2Id: room.guestPlayerId || '',
    winnerId: winnerPlayerId,
    loserId: loserPlayerId,
    winnerName,
    loserName,
    resultType,
    completionReason,
    completedAt: now,
    finalReport: report,
  };

  saveGameResult(resultRecord);
  console.log(`[GAME FINALIZED] Room ${room.code}: Status=${finalStatus}, Winner=${winnerName || 'NONE'}, Reason=${completionReason}`);

  return { success: true, room: updatedRoom };
}

// ---- Periodic Inactivity & Disconnect Watcher (Runs every 3 seconds) ----

export async function checkInactivityAndFinalize(): Promise<void> {
  const now = Date.now();
  const allRooms = Array.from((await import('./store')).getAllRooms().values());

  for (const room of allRooms) {
    // Only check active games
    if (room.status !== 'PLAYING' && room.status !== 'REVEALING' && room.status !== 'PLAYER_DISCONNECTED') {
      continue;
    }
    if (!room.guestPlayerId) {
      continue; // WAITING rooms handled by separate lobby cleanup
    }

    const hostPres = getPlayerPresence(room.code, room.hostPlayerId);
    const guestPres = getPlayerPresence(room.code, room.guestPlayerId);

    const hostLastSeen = hostPres?.lastHeartbeat || room.hostLastSeenAt || 0;
    const guestLastSeen = guestPres?.lastHeartbeat || room.guestLastSeenAt || 0;

    const isHostInactive = now - hostLastSeen > INACTIVITY_TIMEOUT_MS;
    const isGuestInactive = now - guestLastSeen > INACTIVITY_TIMEOUT_MS;

    // Case 1: Inactivity detected during normal gameplay -> Enter PLAYER_DISCONNECTED grace period
    if (room.status === 'PLAYING' || room.status === 'REVEALING') {
      if (isHostInactive || isGuestInactive) {
        const disconnectedRole: 'host' | 'guest' = isHostInactive ? 'host' : 'guest';
        const disconnectedName = isHostInactive ? room.hostPlayerName : (room.guestPlayerName || 'Opponent');

        room.status = 'PLAYER_DISCONNECTED';
        room.disconnectedPlayerName = disconnectedName;
        room.disconnectedRole = disconnectedRole;
        room.disconnectStartedAt = now;
        room.disconnectGraceRemaining = Math.ceil(GRACE_PERIOD_MS / 1000);
        room.stateVersion = (room.stateVersion || 1) + 1;
        setRoom(room);

        if (hostPres && isHostInactive) hostPres.status = 'DISCONNECTED';
        if (guestPres && isGuestInactive) guestPres.status = 'DISCONNECTED';

        console.warn(`[INACTIVITY DETECTED] Room ${room.code}: ${disconnectedName} missed heartbeats. 30s grace window started.`);
        continue;
      }
    }

    // Case 2: Room is currently in PLAYER_DISCONNECTED -> Check 30s grace expiry
    if (room.status === 'PLAYER_DISCONNECTED') {
      const disconnectStart = room.disconnectStartedAt || now;
      const elapsed = now - disconnectStart;
      const remainingSeconds = Math.max(0, Math.ceil((GRACE_PERIOD_MS - elapsed) / 1000));

      room.disconnectGraceRemaining = remainingSeconds;

      if (remainingSeconds > 0) {
        // Still in grace period, update countdown
        setRoom(room);
        continue;
      }

      // Grace period has EXPIRED! Finalize game automatically.
      if (!tryAcquireFinalizeLock(room.code)) {
        continue; // already finalizing
      }

      try {
        const bothDisconnected = isHostInactive && isGuestInactive;

        if (bothDisconnected) {
          console.warn(`[GRACE EXPIRED] Room ${room.code}: Both players disconnected. Marking as ABANDONED / DRAW.`);
          await finalizeGameResult(
            room,
            'none',
            'BOTH_DISCONNECTED',
            'ABANDONED',
            'Both players disconnected before completing the match.',
            null,
            null,
            null,
            null
          );
        } else if (isHostInactive) {
          // Guest wins by default
          const winnerId = room.guestPlayerId;
          const loserId = room.hostPlayerId;
          const winnerName = room.guestPlayerName || 'Player 2';
          const loserName = room.hostPlayerName;

          console.log(`[GRACE EXPIRED] Room ${room.code}: Host ${loserName} did not reconnect. Guest ${winnerName} wins by default.`);
          await finalizeGameResult(
            room,
            'guest',
            'PLAYER_DISCONNECTED',
            'WIN_BY_DEFAULT',
            `${loserName} disconnected before the game ended.`,
            winnerId,
            loserId,
            winnerName,
            loserName
          );
        } else if (isGuestInactive) {
          // Host wins by default
          const winnerId = room.hostPlayerId;
          const loserId = room.guestPlayerId;
          const winnerName = room.hostPlayerName;
          const loserName = room.guestPlayerName || 'Guest';

          console.log(`[GRACE EXPIRED] Room ${room.code}: Guest ${loserName} did not reconnect. Host ${winnerName} wins by default.`);
          await finalizeGameResult(
            room,
            'host',
            'PLAYER_DISCONNECTED',
            'WIN_BY_DEFAULT',
            `${loserName} disconnected before the game ended.`,
            winnerId,
            loserId,
            winnerName,
            loserName
          );
        }
      } finally {
        releaseFinalizeLock(room.code);
      }
    }
  }
}
