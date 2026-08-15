import { useState, useEffect, useRef, useCallback } from 'react';
import type { PlayerSession, RoomState } from '../types/game';
import { api } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { GameHeader } from '../components/GameHeader';
import { Countdown } from '../components/Countdown';
import { OptionButton } from '../components/OptionButton';
import { RevealScreen } from '../components/RevealScreen';

interface GameProps {
  session: PlayerSession;
  initialRoom: RoomState;
  onGameFinish: (room: RoomState) => void;
  onLeave: () => void;
}

export function Game({ session, initialRoom, onGameFinish, onLeave }: GameProps) {
  const [room, setRoom] = useState<RoomState>(initialRoom);
  const [myChoice, setMyChoice] = useState<string | null>(null);
  const [lastRoundNumber, setLastRoundNumber] = useState(initialRoom.roundNumber);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Track if we already requested next-round (host-only, prevent duplicate calls)
  const nextRoundRequested = useRef(false);

  // Check for game completion / interruption
  useEffect(() => {
    if (room.status === 'FINISHED' || room.status === 'INTERRUPTED') {
      console.log(`[GAME] Status is ${room.status}. Transitioning to Result screen...`);
      onGameFinish(room);
    }
  }, [room.status, room, onGameFinish]);

  // Reset choice when round changes
  useEffect(() => {
    if (room.roundNumber !== lastRoundNumber) {
      console.log(`[GAME] Round changed from ${lastRoundNumber} to ${room.roundNumber}`);
      setMyChoice(null);
      setLastRoundNumber(room.roundNumber);
      nextRoundRequested.current = false;
    }
  }, [room.roundNumber, lastRoundNumber]);

  // Polling — 700ms sequential polling for near-realtime feel
  const pollRoom = useCallback(async () => {
    if (isLeaving) return;
    try {
      const res = await api.pollRoom(session.roomCode, session.playerId);
      if (res.room) {
        setRoom((prev) => {
          if (!prev || res.room!.updatedAt >= prev.updatedAt) {
            return res.room!;
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn('[GAME] Poll error:', err);
    }
  }, [session.roomCode, session.playerId, isLeaving]);

  usePolling(pollRoom, 700, !isLeaving && room.status !== 'FINISHED' && room.status !== 'INTERRUPTED');

  // Host auto-advances after reveal period (2.2s)
  useEffect(() => {
    if (
      room.status === 'REVEALING' &&
      session.role === 'host' &&
      !nextRoundRequested.current &&
      !isLeaving
    ) {
      nextRoundRequested.current = true;
      console.log(`[GAME:HOST] Round ${room.roundNumber}/${room.totalRounds} reveal active. Advancing in 2.3s...`);

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
      }, 2300);

      return () => clearTimeout(timer);
    }
  }, [room.status, room.roundNumber, room.totalRounds, session.role, session.roomCode, session.playerId, isLeaving]);

  async function handleChoice(choice: string) {
    if (myChoice !== null || room.status !== 'PLAYING' || !room.currentQuestion) return;

    // Optimistic local update
    setMyChoice(choice);
    console.log(`[GAME] Selected: "${choice}" for round ${room.roundNumber}`);

    try {
      const res = await api.submitAnswer(
        session.roomCode,
        session.playerId,
        session.role,
        room.roundNumber,
        choice
      );

      if (res.error) {
        console.warn(`[GAME] Submit answer response notice:`, res.error);
      }

      if (res.room) {
        setRoom((prev) => {
          if (!prev || res.room!.updatedAt >= prev.updatedAt) {
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
      const res = await api.leaveRoom(session.roomCode, session.playerId);
      if (res.room && (res.room.status === 'INTERRUPTED' || res.room.status === 'FINISHED')) {
        onGameFinish(res.room);
        return;
      }
    } catch (err) {
      console.error('[GAME] Leave error:', err);
    } finally {
      onLeave();
    }
  }

  const q = room.currentQuestion;
  const hasAnswered = myChoice !== null;
  const isRevealing = room.status === 'REVEALING';

  return (
    <>
      {/* Fixed header with score + leave */}
      <GameHeader
        matches={room.matches}
        total={room.total}
        hostName={room.hostPlayerName}
        guestName={room.guestPlayerName}
        onLeave={handlePromptLeave}
      />

      {/* Leave Confirmation Modal */}
      {showLeaveModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="leave-dialog-title">
          <div className="modal-card">
            <div className="modal-title" id="leave-dialog-title">LEAVE GAME? 👋</div>
            <div className="modal-body">
              If you leave now, the game will stop and a partial result will be generated from the questions answered so far.
            </div>
            <div className="modal-actions">
              <button
                className="btn btn--secondary"
                onClick={() => setShowLeaveModal(false)}
                id="cancel-leave-btn"
              >
                STAY & PLAY
              </button>
              <button
                className="btn btn--nomatch"
                onClick={handleConfirmLeave}
                id="confirm-leave-btn"
              >
                YES, LEAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen reveal overlay */}
      {isRevealing && room.lastResult && (
        <RevealScreen
          result={room.lastResult}
          hostChoice={room.lastHostChoice}
          guestChoice={room.lastGuestChoice}
          hostName={room.hostPlayerName}
          guestName={room.guestPlayerName}
        />
      )}

      {/* Main game area */}
      <main className="game-screen">
        {q ? (
          <>
            {/* Round & Category header */}
            <div className="question-header">
              <div className="round-progress-pill">
                ROUND {room.roundNumber} OF {room.totalRounds}
              </div>
              {q.category && (
                <div className="question-category">{q.category}</div>
              )}
              <div className="question-prompt">
                {hasAnswered ? 'YOUR PICK IS IN!' : 'PICK ONE — FAST!'}
              </div>
            </div>

            {/* Option buttons */}
            <div className="options-container">
              <OptionButton
                label={q.optionA}
                variant="a"
                onClick={() => handleChoice(q.optionA)}
                disabled={hasAnswered || isRevealing}
                selected={myChoice === q.optionA}
                dimmed={hasAnswered && myChoice !== q.optionA}
              />

              <div className="options-or" aria-hidden="true">OR</div>

              <OptionButton
                label={q.optionB}
                variant="b"
                onClick={() => handleChoice(q.optionB)}
                disabled={hasAnswered || isRevealing}
                selected={myChoice === q.optionB}
                dimmed={hasAnswered && myChoice !== q.optionB}
              />
            </div>

            {/* Countdown timer */}
            {!isRevealing && (
              <Countdown
                deadline={room.roundDeadline}
                hasAnswered={hasAnswered}
              />
            )}
          </>
        ) : (
          // Loading next question
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
