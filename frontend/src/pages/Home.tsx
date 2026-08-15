import { useState, useId } from 'react';
import { Brand } from '../components/Brand';
import { ErrorMessage } from '../components/ErrorMessage';
import { api } from '../services/api';
import type { PlayerSession, RoomState } from '../types/game';

interface HomeProps {
  onEnterGame: (session: PlayerSession, room: RoomState) => void;
  onEnterLobby: (session: PlayerSession) => void;
}

export function Home({ onEnterGame, onEnterLobby }: HomeProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);

  const nameId = useId();
  const codeId = useId();

  async function handleCreate() {
    setError('');
    setLoading('create');
    try {
      const name = playerName.trim() || 'Player 1';
      const res = await api.createRoom(name);
      if (res.error || !res.room || !res.playerId) {
        setError(res.error ?? 'Could not create room. Try again.');
        return;
      }
      onEnterLobby({
        playerId: res.playerId,
        role: 'host',
        roomCode: res.room.code,
        playerName: name,
      });
    } finally {
      setLoading(null);
    }
  }

  async function handleJoin() {
    setError('');
    const code = roomCode.trim().toUpperCase();

    if (!code) {
      setError('ENTER A 4-CHARACTER ROOM CODE.');
      return;
    }
    if (code.length !== 4) {
      setError('ENTER A 4-CHARACTER ROOM CODE.');
      return;
    }

    setLoading('join');
    try {
      const name = playerName.trim() || 'Player 2';
      const res = await api.joinRoom(code, name);
      if (res.error || !res.room || !res.playerId) {
        setError(res.error ?? 'Could not join room. Try again.');
        return;
      }
      onEnterGame({
        playerId: res.playerId,
        role: 'guest',
        roomCode: res.room.code,
        playerName: name,
      }, res.room);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="app-wrapper">
      <div className="screen">
        <Brand />

        <div className="card">
          {/* Name input */}
          <div className="input-group">
            <label className="input-label" htmlFor={nameId}>
              Your Name
            </label>
            <input
              id={nameId}
              className="input-field"
              type="text"
              placeholder="Enter your name"
              maxLength={20}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoComplete="off"
              aria-label="Your player name"
            />
          </div>

          {/* Create room */}
          <button
            className="btn btn--pink"
            onClick={handleCreate}
            disabled={loading !== null}
            id="create-room-btn"
            aria-label="Create a new game room"
          >
            {loading === 'create' ? (
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : (
              '⚡ CREATE A ROOM'
            )}
          </button>

          {/* Divider */}
          <div className="divider">— OR JOIN ONE —</div>

          {/* Room code input */}
          <div className="input-group">
            <label className="input-label" htmlFor={codeId}>
              Room Code
            </label>
            <input
              id={codeId}
              className="input-field code-input"
              type="text"
              placeholder="XXXX"
              maxLength={4}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              autoComplete="off"
              aria-label="4-character room code"
              spellCheck={false}
            />
          </div>

          {/* Join room */}
          <button
            className="btn btn--violet"
            onClick={handleJoin}
            disabled={loading !== null}
            id="join-room-btn"
            aria-label="Join existing game room"
          >
            {loading === 'join' ? (
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : (
              'JOIN ROOM'
            )}
          </button>

          {/* Inline error */}
          {error && <ErrorMessage message={error} />}
        </div>
      </div>
    </div>
  );
}
