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
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerSubmitError, setAnswerSubmitError] = useState<string | null>(null);
  const [pollingConflictError, setPollingConflictError] = useState<string | null>(null);
  const [lastRoundNumber, setLastRoundNumber] = useState(initialRoom.roundNumber);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [autoAdvanceAttempt, setAutoAdvanceAttempt] = useState(0);
  const [autoAdvanceNotice, setAutoAdvanceNotice] = useState<string | null>(null);
  const [showRevealOverlay, setShowRevealOverlay] = useState(initialRoom.status === 'REVEALING');
  const [showMindReadSplash, setShowMindReadSplash] = useState(false);
  const [mindReadSplashSeenForRound, setMindReadSplashSeenForRound] = useState<number | null>(null);
  const [showDeepPsychologySplash, setShowDeepPsychologySplash] = useState(false);
  const [deepPsychologySplashSeenForRound, setDeepPsychologySplashSeenForRound] = useState<number | null>(null);

  // Track if we already requested next-round (host-only, prevent duplicate calls)
  const nextRoundRequested = useRef(false);
  const answerSubmitInFlight = useRef(false);

  const opponentName = session.role === 'host'
    ? (room.guestPlayerName || 'Opponent')
    : room.hostPlayerName;

  const isPredictionRound = room.currentRoundType === 'PREDICTION';
  const isChaosRound = room.currentRoundType === 'CHAOS';
  const isDoublePointsRound = room.currentRoundType === 'DOUBLE_POINTS';
  const isDeepPsychologyRound = room.currentRoundType === 'DEEP_PSYCHOLOGY' || room.currentQuestion?.type === 'DEEP_PSYCHOLOGY';

  const applyRoomUpdate = useCallback((nextRoom: RoomState) => {
    setRoom((prev) => {
      if (!prev) return nextRoom;
      const prevVer = prev.stateVersion || 0;
      const newVer = nextRoom.stateVersion || 0;
      // Apply only if newer version or timestamp, preventing older out-of-order responses.
      if (newVer > prevVer || (newVer === prevVer && nextRoom.updatedAt >= prev.updatedAt)) {
        return nextRoom;
      }
      return prev;
    });
  }, []);

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
      if (
        room.status === 'PLAYING' ||
        room.status === 'REVEALING' ||
        room.status === 'GENERATING_REPORT' ||
        room.status === 'PLAYER_DISCONNECTED'
      ) {
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
    setIsSubmittingAnswer(false);
    setAnswerSubmitError(null);
    setPollingConflictError(null);
    setLastRoundNumber(initialRoom.roundNumber);
    nextRoundRequested.current = false;
    answerSubmitInFlight.current = false;
    setAutoAdvanceAttempt(0);
    setAutoAdvanceNotice(null);
  }, [initialRoom.code, initialRoom.stateVersion]);

  // Reset choices when round changes
  useEffect(() => {
    if (room.roundNumber !== lastRoundNumber) {
      console.log(`[GAME] Round changed from ${lastRoundNumber} to ${room.roundNumber} (${room.currentRoundType})`);
      setMyChoice(null);
      setMyPrediction(null);
      setIsSubmittingAnswer(false);
      setAnswerSubmitError(null);
      setShowRevealOverlay(false);
      setLastRoundNumber(room.roundNumber);
      nextRoundRequested.current = false;
      answerSubmitInFlight.current = false;
      setAutoAdvanceAttempt(0);
      setAutoAdvanceNotice(null);
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
      if (res.error) {
        if (res.status === 409) {
          setPollingConflictError(res.error);
        }
        if (res.room) {
          applyRoomUpdate(res.room);
        }
        return;
      }

      setPollingConflictError(null);
      if (res.room) {
        applyRoomUpdate(res.room);
      }
    } catch (err) {
      console.warn('[GAME] Poll error:', err);
    }
  }, [session.roomCode, session.playerId, session.sessionId, isLeaving, applyRoomUpdate]);

  usePolling(
    pollRoom,
    700,
    !isLeaving &&
      !pollingConflictError &&
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
      console.log(`[GAME:HOST] Round ${room.roundNumber}/${room.totalRounds} reveal active. Advancing...`);

      const revealDelay = isPredictionRound ? 3000 : 2500;
      const retryDelay = Math.min(1000 * Math.pow(2, Math.max(0, autoAdvanceAttempt - 1)), 5000);
      const delay = autoAdvanceAttempt === 0 ? revealDelay : retryDelay;
      let cancelled = false;

      const timer = window.setTimeout(async () => {
        try {
          const res = await api.nextRound(session.roomCode, session.playerId, session.sessionId);
          if (cancelled) return;

          if (!res.error && res.room) {
            setAutoAdvanceAttempt(0);
            setAutoAdvanceNotice(null);
            setRoom(res.room);
            return;
          }

          if (res.room) {
            setRoom(res.room);
          }

          const retryable = res.status === 0 || res.status === 408 || res.status === 429 || (res.status !== undefined && res.status >= 500);
          console.warn(`[GAME:HOST] Failed to advance round: ${res.error || 'Unknown error'}`);

          if (retryable) {
            nextRoundRequested.current = false;
            setAutoAdvanceNotice('Syncing next round...');
            setAutoAdvanceAttempt((attempt) => attempt + 1);
            return;
          }

          setAutoAdvanceNotice(res.error || 'Could not advance round.');
        } catch (err) {
          if (cancelled) return;
          console.error('[GAME:HOST] Failed to advance round:', err);
          nextRoundRequested.current = false;
          setAutoAdvanceNotice('Syncing next round...');
          setAutoAdvanceAttempt((attempt) => attempt + 1);
        }
      }, delay);

      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }
  }, [
    room.status,
    room.roundNumber,
    room.totalRounds,
    isPredictionRound,
    session.role,
    session.roomCode,
    session.playerId,
    session.sessionId,
    isLeaving,
    autoAdvanceAttempt,
  ]);

  async function handleOptionClick(choice: string) {
    if (room.status !== 'PLAYING' || !room.currentQuestion || isLeaving || answerSubmitInFlight.current) return;

    // In Prediction rounds: Step 1 = Predict opponent choice
    if (isPredictionRound && myPrediction === null) {
      setAnswerSubmitError(null);
      setMyPrediction(choice);
      console.log(`[GAME] Predicted for ${opponentName}: "${choice}"`);
      return;
    }

    // Step 2 (or normal rounds): Select own choice
    if (myChoice !== null) return;
    const submittedRound = room.roundNumber;
    answerSubmitInFlight.current = true;
    setMyChoice(choice);
    setIsSubmittingAnswer(true);
    setAnswerSubmitError(null);
    console.log(`[GAME] Selected own: "${choice}" (Prediction: "${myPrediction || 'none'}")`);

    try {
      const res = await api.submitAnswer(
        session.roomCode,
        session.playerId,
        session.role,
        room.roundNumber,
        choice,
        myPrediction ?? undefined,
        session.sessionId
      );

      if (res.room) {
        applyRoomUpdate(res.room);
      }

      if (res.error) {
        console.warn(`[GAME] Submit answer notice:`, res.error);
        setAnswerSubmitError(res.error);
        const canRetryCurrentRound =
          !res.room || (res.room.status === 'PLAYING' && res.room.roundNumber === submittedRound);
        if (canRetryCurrentRound) {
          setMyChoice((current) => (current === choice ? null : current));
        }
        return;
      }

      if (!res.room) {
        console.warn('[GAME] Submit answer response did not include room state.');
        setAnswerSubmitError('Answer was not confirmed. Please try again.');
        setMyChoice((current) => (current === choice ? null : current));
        return;
      }

      setAnswerSubmitError(null);
    } catch (err) {
      console.error('[GAME] Network error on answer submit:', err);
      setAnswerSubmitError('Cannot submit your answer. Check your connection and try again.');
      setMyChoice((current) => (current === choice ? null : current));
    } finally {
      answerSubmitInFlight.current = false;
      setIsSubmittingAnswer(false);
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
      const res = await api.leaveRoom(session.roomCode, session.playerId, session.sessionId);
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
  const isGeneratingReport = room.status === 'GENERATING_REPORT';
  const isMismatchPreReveal = isRevealing && room.lastResult === 'NO_MATCH' && !showRevealOverlay;

  // Dynamic Prompt based on prediction step
  let promptText = 'PICK ONE — FAST!';
  if (isSubmittingAnswer) {
    promptText = 'SENDING YOUR PICK...';
  } else if (hasAnswered) {
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
        showMatchup={false}
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

      {room.status === 'REVEALING' && session.role === 'host' && autoAdvanceNotice && (
        <div className="synq-auto-advance-banner" role="status" aria-live="polite">
          {autoAdvanceNotice}
        </div>
      )}

      {room.status === 'PLAYING' && answerSubmitError && (
        <div className="synq-answer-submit-banner" role="alert">
          {answerSubmitError}
        </div>
      )}

      {pollingConflictError && (
        <div className="synq-session-conflict-overlay" role="alertdialog" aria-modal="true" aria-labelledby="session-conflict-title">
          <div className="synq-session-conflict-card">
            <div className="synq-session-conflict-title" id="session-conflict-title">
              Game open in another tab
            </div>
            <p>{pollingConflictError}</p>
            <div className="synq-session-conflict-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setPollingConflictError(null)}
              >
                RETRY THIS TAB
              </button>
            </div>
          </div>
        </div>
      )}

      {isGeneratingReport && (
        <div className="synq-generating-report-screen" role="status" aria-live="polite">
          <div className="synq-generating-report-card">
            <div className="spinner" aria-hidden="true" />
            <div className="synq-generating-report-title">Building your match report</div>
            <p>Analyzing your answers, streaks, and biggest sync moments...</p>
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
            prompt={promptText}
            scoreLabel={`${room.matches}/${room.total}`}
            roundBadgeLabel={roundBadge?.label}
            roundBadgeVariant={roundBadge?.variant}
            scenario={q.scenario}
            selectedChoice={myChoice}
            disabled={hasAnswered || isRevealing || isSubmittingAnswer || isGeneratingReport}
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
