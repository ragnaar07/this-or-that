import { useState, useEffect, useRef, useCallback } from 'react';
import type { PlayerSession, RoomState } from '../types/game';
import { api } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { GameHeader } from '../components/GameHeader';
import { Countdown } from '../components/Countdown';
import { RevealScreen } from '../components/RevealScreen';
import { SplitAnswerLayout } from '../components/SplitAnswerLayout';
import { MindReadSplash } from '../components/MindReadSplash';
import { DeepPsychologySplash } from '../components/DeepPsychologySplash';

interface GameProps {
  session: PlayerSession;
  initialRoom: RoomState;
  onGameFinish: (room: RoomState) => void;
  onLeave: () => void;
}

export function Game({ session, initialRoom, onGameFinish }: GameProps) {
  const [room, setRoom] = useState<RoomState>(initialRoom);
  const [myChoice, setMyChoice] = useState<string | null>(null);
  const [myPrediction, setMyPrediction] = useState<string | null>(null);
  const [lastRoundNumber, setLastRoundNumber] = useState(initialRoom.roundNumber);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showRevealOverlay, setShowRevealOverlay] = useState(initialRoom.status === 'REVEALING');
  const [showMindReadSplash, setShowMindReadSplash] = useState(false);
  const [mindReadSplashSeenForRound, setMindReadSplashSeenForRound] = useState<number | null>(null);
  const [showDeepPsychologySplash, setShowDeepPsychologySplash] = useState(false);
  const [deepPsychologySplashSeenForRound, setDeepPsychologySplashSeenForRound] = useState<number | null>(null);

  // Track if we already requested next-round (host-only, prevent duplicate calls)
  const nextRoundRequested = useRef(false);

  const opponentName = session.role === 'host'
    ? (room.guestPlayerName || 'Opponent')
    : room.hostPlayerName;

  const isPredictionRound = room.currentRoundType === 'PREDICTION';
  const isChaosRound = room.currentRoundType === 'CHAOS';
  const isDoublePointsRound = room.currentRoundType === 'DOUBLE_POINTS';
  const isDeepPsychologyRound = room.currentRoundType === 'DEEP_PSYCHOLOGY' || room.currentQuestion?.type === 'DEEP_PSYCHOLOGY';

  // Intercept browser / Android back button to show leave confirmation modal
  useEffect(() => {
    window.history.pushState({ inGame: true }, '');
    function handlePopState() {
      window.history.pushState({ inGame: true }, '');
      setShowLeaveModal(true);
    }
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Fast disconnect beacon on tab close / reload
  useEffect(() => {
    function handlePageHide() {
      if (room.status === 'PLAYING' || room.status === 'REVEALING' || room.status === 'PLAYER_DISCONNECTED') {
        api.sendDisconnectBeacon(session.roomCode, session.playerId, session.sessionId);
      }
    }

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, [session.roomCode, session.playerId, session.sessionId, room.status]);

  // Periodic Heartbeat every 6 seconds
  useEffect(() => {
    if (
      room.status === 'FINISHED' ||
      room.status === 'COMPLETED' ||
      room.status === 'INTERRUPTED' ||
      room.status === 'ABANDONED'
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        await api.heartbeat(session.roomCode, session.playerId, session.sessionId);
      } catch {}
    }, 6000);

    return () => clearInterval(interval);
  }, [session.roomCode, session.playerId, session.sessionId, room.status]);

  // Check for game completion / interruption -> Route directly to Result screen
  useEffect(() => {
    if (
      room.status === 'FINISHED' ||
      room.status === 'COMPLETED' ||
      room.status === 'INTERRUPTED' ||
      room.status === 'ABANDONED'
    ) {
      console.log(`[GAME] Status is ${room.status}. Transitioning to Result screen...`);
      onGameFinish(room);
    }
  }, [room.status, room, onGameFinish]);

  // Synchronize initialRoom changes (e.g. rematch / play again in same room)
  useEffect(() => {
    setRoom(initialRoom);
    setMyChoice(null);
    setMyPrediction(null);
    setLastRoundNumber(initialRoom.roundNumber);
    nextRoundRequested.current = false;
  }, [initialRoom.code, initialRoom.stateVersion]);

  // Reset choices when round changes
  useEffect(() => {
    if (room.roundNumber !== lastRoundNumber) {
      console.log(`[GAME] Round changed from ${lastRoundNumber} to ${room.roundNumber} (${room.currentRoundType})`);
      setMyChoice(null);
      setMyPrediction(null);
      setShowRevealOverlay(false);
      setLastRoundNumber(room.roundNumber);
      nextRoundRequested.current = false;
    }
  }, [room.roundNumber, room.currentRoundType, lastRoundNumber]);

  useEffect(() => {
    if (room.status !== 'REVEALING' || !room.lastResult) {
      setShowRevealOverlay(false);
      return;
    }

    if (room.lastResult === 'MATCH') {
      setShowRevealOverlay(true);
      return;
    }

    setShowRevealOverlay(false);
    const delay = 420;
    const timer = window.setTimeout(() => {
      setShowRevealOverlay(true);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [room.status, room.lastResult, room.roundNumber]);

  // Trigger Mind Read Splash on entering a PREDICTION round
  useEffect(() => {
    if (
      isPredictionRound &&
      room.status === 'PLAYING' &&
      room.roundNumber > 0 &&
      mindReadSplashSeenForRound !== room.roundNumber
    ) {
      setShowMindReadSplash(true);
    }
  }, [isPredictionRound, room.status, room.roundNumber, mindReadSplashSeenForRound]);

  // Trigger Deep Psychology Splash on entering a DEEP_PSYCHOLOGY round
  useEffect(() => {
    if (
      isDeepPsychologyRound &&
      room.status === 'PLAYING' &&
      room.roundNumber > 0 &&
      deepPsychologySplashSeenForRound !== room.roundNumber
    ) {
      setShowDeepPsychologySplash(true);
    }
  }, [isDeepPsychologyRound, room.status, room.roundNumber, deepPsychologySplashSeenForRound]);

  // Polling — 700ms sequential polling for near-realtime feel with monotonic version checking
  const pollRoom = useCallback(async () => {
    if (isLeaving) return;
    try {
      const res = await api.pollRoom(session.roomCode, session.playerId, session.sessionId);
      if (res.room) {
        setRoom((prev) => {
          if (!prev) return res.room!;
          const prevVer = prev.stateVersion || 0;
          const newVer = res.room!.stateVersion || 0;
          // Apply only if newer version or timestamp, preventing older out-of-order responses
          if (newVer > prevVer || (newVer === prevVer && res.room!.updatedAt >= prev.updatedAt)) {
            return res.room!;
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn('[GAME] Poll error:', err);
    }
  }, [session.roomCode, session.playerId, session.sessionId, isLeaving]);

  usePolling(
    pollRoom,
    700,
    !isLeaving &&
      room.status !== 'FINISHED' &&
      room.status !== 'COMPLETED' &&
      room.status !== 'INTERRUPTED' &&
      room.status !== 'ABANDONED'
  );

  // Host auto-advances after reveal period (2.5s for prediction reading)
  useEffect(() => {
    if (
      room.status === 'REVEALING' &&
      session.role === 'host' &&
      !nextRoundRequested.current &&
      !isLeaving
    ) {
      nextRoundRequested.current = true;
      console.log(`[GAME:HOST] Round ${room.roundNumber}/${room.totalRounds} reveal active. Advancing in 2.6s...`);

      const delay = isPredictionRound ? 3000 : 2500;
      const timer = setTimeout(async () => {
        try {
          const res = await api.nextRound(session.roomCode, session.playerId);
          if (res.room) {
            setRoom(res.room);
          }
        } catch (err) {
          console.error('[GAME:HOST] Failed to advance round:', err);
          nextRoundRequested.current = false;
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [room.status, room.roundNumber, room.totalRounds, isPredictionRound, session.role, session.roomCode, session.playerId, isLeaving]);

  async function handleOptionClick(choice: string) {
    if (room.status !== 'PLAYING' || !room.currentQuestion || isLeaving) return;

    // In Prediction rounds: Step 1 = Predict opponent choice
    if (isPredictionRound && myPrediction === null) {
      setMyPrediction(choice);
      console.log(`[GAME] Predicted for ${opponentName}: "${choice}"`);
      return;
    }

    // Step 2 (or normal rounds): Select own choice
    if (myChoice !== null) return;
    setMyChoice(choice);
    console.log(`[GAME] Selected own: "${choice}" (Prediction: "${myPrediction || 'none'}")`);

    try {
      const res = await api.submitAnswer(
        session.roomCode,
        session.playerId,
        session.role,
        room.roundNumber,
        choice,
        myPrediction ?? undefined
      );

      if (res.error) {
        console.warn(`[GAME] Submit answer notice:`, res.error);
      }

      if (res.room) {
        setRoom((prev) => {
          if (!prev) return res.room!;
          const prevVer = prev.stateVersion || 0;
          const newVer = res.room!.stateVersion || 0;
          if (newVer > prevVer || (newVer === prevVer && res.room!.updatedAt >= prev.updatedAt)) {
            return res.room!;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('[GAME] Network error on answer submit:', err);
    }
  }

  function handlePromptLeave() {
    setShowLeaveModal(true);
  }

  async function handleConfirmLeave() {
    setShowLeaveModal(false);
    setIsLeaving(true);
    try {
      console.log(`[GAME] Player confirmed leave for room ${session.roomCode}. Requesting authoritative leave from server...`);
      const res = await api.leaveRoom(session.roomCode, session.playerId);
      if (res.room) {
        onGameFinish(res.room);
        return;
      }
    } catch (err) {
      console.error('[GAME] Leave error:', err);
    }

    // Fallback: If network drops during leave, construct partial room and route to result
    const partialRoom: RoomState = {
      ...room,
      status: 'INTERRUPTED',
      interruptedReason: `${session.playerName} left the game.`,
      leftBy: session.role,
      leftAt: Date.now(),
      updatedAt: Date.now(),
    };
    onGameFinish(partialRoom);
  }

  const q = room.currentQuestion;
  const hasAnswered = myChoice !== null;
  const isRevealing = room.status === 'REVEALING';
  const isMismatchPreReveal = isRevealing && room.lastResult === 'NO_MATCH' && !showRevealOverlay;

  // Dynamic Prompt based on prediction step
  let promptText = 'PICK ONE — FAST!';
  if (hasAnswered) {
    promptText = 'YOUR PICK IS LOCKED!';
  } else if (isPredictionRound) {
    if (myPrediction === null) {
      promptText = `STEP 1: WHAT WILL ${opponentName.toUpperCase()} PICK? 🤔`;
    } else {
      promptText = 'STEP 2: NOW PICK YOUR OWN ANSWER! 🎯';
    }
  }

  const isQuickRound = q
    ? q.format === 'QUICK' || (!q.scenario && (room.currentTimeLimit === 10 || q.timeLimit === 10))
    : false;

  const roundBadge = q
    ? isChaosRound
      ? { label: '⚠️ CHAOS ROUND (16s)', variant: 'chaos' }
      : isPredictionRound
      ? { label: '🧠 MIND READER PREDICTION ROUND (16s)', variant: 'prediction' }
      : isDoublePointsRound
      ? { label: '🔥 DOUBLE POINTS ROUND (2X)', variant: 'double' }
      : q.type === 'EDGE'
      ? { label: '⚡ RAW HUMAN TRUTH (16s)', variant: 'edge' }
      : q.type === 'FUNNY'
      ? { label: '😂 RELATABLE QUIRK (16s)', variant: 'funny' }
      : q.type === 'CURRENT' || q.isCurrent
      ? { label: '📰 CURRENT INDIA DEBATE (16s)', variant: 'current' }
      : isQuickRound
      ? { label: '⚡ QUICK PICK (10s)', variant: 'quick' }
      : { label: '🧠 THINK FAST (16s)', variant: 'situational' }
    : null;
  const myRevealChoice = session.role === 'host' ? room.lastHostChoice : room.lastGuestChoice;
  const opponentRevealChoice = session.role === 'host' ? room.lastGuestChoice : room.lastHostChoice;
  const mismatchRevealChoices = isMismatchPreReveal
    ? [room.lastHostChoice, room.lastGuestChoice].filter((choice): choice is string => Boolean(choice))
    : [];

  return (
    <>
      {/* Fixed header with score + leave */}
      <GameHeader
        matches={room.matches}
        total={room.total}
        hostName={room.hostPlayerName}
        guestName={room.guestPlayerName}
        onLeave={handlePromptLeave}
        showScore={false}
      />

      {/* Leave Confirmation Modal */}
      {showLeaveModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="leave-dialog-title">
          <div className="modal-card">
            <div className="modal-title" id="leave-dialog-title">Leave this game? 👋</div>
            <div className="modal-body">
              Your current progress will be saved and both players will receive the final result.
            </div>
            <div className="modal-actions">
              <button
                className="btn btn--secondary"
                onClick={() => setShowLeaveModal(false)}
                id="cancel-leave-btn"
              >
                STAY
              </button>
              <button
                className="btn btn--nomatch"
                onClick={handleConfirmLeave}
                id="confirm-leave-btn"
              >
                LEAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Mind Read Round Splash Overlay */}
      {showMindReadSplash && (
        <MindReadSplash
          opponentName={opponentName}
          roundNumber={room.roundNumber}
          onComplete={() => {
            setShowMindReadSplash(false);
            setMindReadSplashSeenForRound(room.roundNumber);
          }}
        />
      )}

      {/* Full-screen Deep Psychology Round Splash Overlay */}
      {showDeepPsychologySplash && (
        <DeepPsychologySplash
          roundNumber={room.roundNumber}
          onComplete={() => {
            setShowDeepPsychologySplash(false);
            setDeepPsychologySplashSeenForRound(room.roundNumber);
          }}
        />
      )}

      {/* Full-screen reveal overlay */}
      {isRevealing && showRevealOverlay && room.lastResult && (
        <RevealScreen
          result={room.lastResult}
          hostChoice={room.lastHostChoice}
          guestChoice={room.lastGuestChoice}
          hostName={room.hostPlayerName}
          guestName={room.guestPlayerName}
          roundType={room.currentRoundType}
          liveReaction={room.lastLiveReaction}
          hostPrediction={room.lastHostPrediction}
          guestPrediction={room.lastGuestPrediction}
          hostPredictionResult={room.lastHostPredictionResult}
          guestPredictionResult={room.lastGuestPredictionResult}
        />
      )}

      {/* Disconnect Grace Period Warning Overlay Banner */}
      {room.status === 'PLAYER_DISCONNECTED' && (
        <div className="synq-disconnect-grace-banner" role="alert">
          <div className="synq-disconnect-grace-content">
            <span className="synq-disconnect-pulse-dot" />
            <div className="synq-disconnect-info">
              <strong>⚠️ {room.disconnectedPlayerName || 'Opponent'} DISCONNECTED</strong>
              <p>Waiting for player reconnection. Match will auto-resolve if connection is not restored.</p>
            </div>
            <div className="synq-disconnect-timer-badge">
              <span className="synq-disconnect-timer-count">{room.disconnectGraceRemaining ?? 30}</span>
              <span className="synq-disconnect-timer-unit">SEC</span>
            </div>
          </div>
        </div>
      )}

      {/* Main game area */}
      <main className="game-screen game-screen--split">
        {q ? (
          <SplitAnswerLayout
            optionA={q.optionA}
            optionB={q.optionB}
            roundLabel={`ROUND ${room.roundNumber} OF ${room.totalRounds}`}
            category={q.category}
            prompt={hasAnswered ? 'LOCKED 🔒' : promptText}
            scoreLabel={`${room.matches}/${room.total}`}
            roundBadgeLabel={roundBadge?.label}
            roundBadgeVariant={roundBadge?.variant}
            scenario={q.scenario}
            selectedChoice={myChoice}
            disabled={hasAnswered || isRevealing}
            dimUnselected={hasAnswered}
            revealChoices={mismatchRevealChoices}
            myRevealChoice={isMismatchPreReveal ? myRevealChoice : null}
            opponentRevealChoice={isMismatchPreReveal ? opponentRevealChoice : null}
            isPredictionRound={isPredictionRound}
            predictionStep={isPredictionRound ? (myPrediction === null ? 1 : 2) : undefined}
            opponentName={opponentName}
            onSelect={(choice) => handleOptionClick(choice)}
            predictionNotice={isPredictionRound && !hasAnswered && myPrediction !== null ? (
              <div className="prediction-locked-pill">
                ✓ Predicted for {opponentName}: <strong>{myPrediction}</strong>
              </div>
            ) : undefined}
            countdown={!isRevealing ? (
              <Countdown
                deadline={room.roundDeadline}
                hasAnswered={hasAnswered}
                timeLimit={room.currentTimeLimit || q.timeLimit || (q.format === 'QUICK' ? 10 : 16)}
                format={isQuickRound ? 'QUICK' : 'SITUATIONAL'}
              />
            ) : undefined}
          />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" />
            <p style={{ marginTop: 16, fontSize: '0.8rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Loading next question…
            </p>
          </div>
        )}
      </main>
    </>
  );
}
