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
  onLeave: () => void;
}

export function Game({ session, initialRoom, onLeave }: GameProps) {
  const [room, setRoom] = useState<RoomState>(initialRoom);
  const [myChoice, setMyChoice] = useState<string | null>(null);
  const [lastRoundNumber, setLastRoundNumber] = useState(initialRoom.roundNumber);
  const [isLeaving, setIsLeaving] = useState(false);

  // Track if we already requested next-round (host-only, prevent duplicate calls)
  const nextRoundRequested = useRef(false);

  // Reset choice when round changes
  useEffect(() => {
    if (room.roundNumber !== lastRoundNumber) {
      setMyChoice(null);
      setLastRoundNumber(room.roundNumber);
      nextRoundRequested.current = false;
    }
  }, [room.roundNumber, lastRoundNumber]);

  // Polling — 700ms for near-realtime feel
  const pollRoom = useCallback(async () => {
    if (isLeaving) return;
    const res = await api.pollRoom(session.roomCode, session.playerId);
    if (res.room) {
      setRoom(res.room);
    }
  }, [session.roomCode, session.playerId, isLeaving]);

  usePolling(pollRoom, 700, !isLeaving);

  // Host auto-advances after reveal period (2.2s)
  useEffect(() => {
    if (
      room.status === 'REVEALING' &&
      session.role === 'host' &&
      !nextRoundRequested.current &&
      !isLeaving
    ) {
      nextRoundRequested.current = true;

      const timer = setTimeout(async () => {
        const res = await api.nextRound(session.roomCode, session.playerId);
        if (res.room) setRoom(res.room);
      }, 2300); // Slightly over 2.2s to ensure reveal fully displays

      return () => clearTimeout(timer);
    }
  }, [room.status, room.roundNumber, session.role, session.roomCode, session.playerId, isLeaving]);

  async function handleChoice(choice: string) {
    if (myChoice !== null || room.status !== 'PLAYING' || !room.currentQuestion) return;

    // Optimistic local update
    setMyChoice(choice);

    await api.submitAnswer(
      session.roomCode,
      session.playerId,
      session.role,
      room.roundNumber,
      choice
    );
  }

  async function handleLeave() {
    setIsLeaving(true);
    await api.leaveRoom(session.roomCode, session.playerId);
    onLeave();
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
        onLeave={handleLeave}
      />

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
            {/* Category + prompt */}
            <div className="question-header">
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
              Loading question…
            </p>
          </div>
        )}
      </main>
    </>
  );
}
