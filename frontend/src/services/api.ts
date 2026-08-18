// ============================================================
// API Service — All server communication (V5 Anti-Abuse + Presence)
// ============================================================

import type { RoomState, PlayerRole } from '../types/game';
import { API_BASE_URL } from '../config/api';

const BASE_URL = API_BASE_URL;

export function getClientSessionId(): string {
  try {
    let sid = sessionStorage.getItem('synq_session_id');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('synq_session_id', sid);
    }
    return sid;
  } catch {
    return 'sid_fallback_' + Date.now();
  }
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  room?: RoomState;
  playerId?: string;
  sessionId?: string;
  role?: PlayerRole;
  data?: T;
  completedResult?: unknown;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error ?? 'Something went wrong. Try again.', room: data.room };
    }
    return data;
  } catch {
    return { error: 'Cannot connect to server. Check your connection.' };
  }
}

export const api = {
  getClientSessionId,

  async createRoom(
    playerName: string,
    gender: 'male' | 'female' | 'other' = 'other',
    deepPsychology = true,
    totalRounds = 20,
    gameMode = 'INDIA',
    aiTone = 'fun'
  ) {
    const sessionId = getClientSessionId();
    return request('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ playerName, gender, deepPsychology, totalRounds, gameMode, aiTone, sessionId }),
    });
  },

  async joinRoom(code: string, playerName: string, gender: 'male' | 'female' | 'other' = 'other') {
    const sessionId = getClientSessionId();
    return request(`/api/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ playerName, gender, sessionId }),
    });
  },

  async pollRoom(code: string, playerId: string, sessionId?: string) {
    const sid = sessionId || getClientSessionId();
    return request(`/api/rooms/${code}?playerId=${encodeURIComponent(playerId)}&sessionId=${encodeURIComponent(sid)}`);
  },

  async heartbeat(roomCode: string, playerId: string, sessionId?: string) {
    const sid = sessionId || getClientSessionId();
    return request('/api/game/heartbeat', {
      method: 'POST',
      body: JSON.stringify({ roomCode, playerId, sessionId: sid }),
    });
  },

  async reconnect(roomCode: string, playerId: string, sessionId?: string) {
    const sid = sessionId || getClientSessionId();
    return request('/api/game/reconnect', {
      method: 'POST',
      body: JSON.stringify({ roomCode, playerId, sessionId: sid }),
    });
  },

  sendDisconnectBeacon(roomCode: string, playerId: string, sessionId?: string) {
    const sid = sessionId || getClientSessionId();
    const payload = JSON.stringify({ roomCode, playerId, sessionId: sid });
    const url = `${BASE_URL}/api/game/disconnect`;

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      try {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      } catch {}
    }
  },

  async submitAnswer(
    code: string,
    playerId: string,
    role: PlayerRole,
    roundNumber: number,
    choice: string,
    prediction?: string
  ) {
    return request(`/api/rooms/${code}/answer`, {
      method: 'POST',
      body: JSON.stringify({ playerId, role, roundNumber, choice, prediction }),
    });
  },

  async nextRound(code: string, playerId: string) {
    return request(`/api/rooms/${code}/next-round`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  },

  async restartRoom(code: string, playerId: string) {
    return request(`/api/rooms/${code}/restart`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  },

  async leaveRoom(code: string, playerId: string) {
    return request(`/api/rooms/${code}/leave`, {
      method: 'DELETE',
      body: JSON.stringify({ playerId }),
    });
  },

  async getStats() {
    return request<{ visitorCount: number; totalMatchesSynced: number; activeRooms: number }>('/api/stats');
  },

  async incrementVisitorCount() {
    return request<{ success: boolean; visitorCount: number }>('/api/visitors/increment', {
      method: 'POST',
    });
  },
};


