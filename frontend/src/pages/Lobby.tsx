import type { PlayerSession, RoomState } from '../types/game';
import { api } from '../services/api';
import { usePolling } from '../hooks/usePolling';

interface LobbyProps {
  session: PlayerSession;
  onGameStart: (room: RoomState) => void;
  onCancel: () => void;
}

export function Lobby({ session, onGameStart, onCancel }: LobbyProps) {
  // Poll for guest joining — when status changes to PLAYING, enter game
  usePolling(
    async () => {
      const res = await api.pollRoom(session.roomCode, session.playerId);
      if (res.room && res.room.status === 'PLAYING') {
        onGameStart(res.room);
      }
    },
    700,
    true
  );

  async function handleCancel() {
    await api.leaveRoom(session.roomCode, session.playerId);
    onCancel();
  }

  return (
    <div className="app-wrapper">
      <div className="screen">
        {/* Lobby ticket */}
        <div className="lobby-ticket">
          <div className="ticket-label">YOUR ROOM</div>
          <div className="ticket-code" aria-label={`Room code: ${session.roomCode.split('').join(' ')}`}>
            {session.roomCode}
          </div>
          <div className="ticket-waiting">
            <div className="ticket-dot" aria-hidden="true" />
            WAITING FOR PLAYER 2…
          </div>
        </div>

        {/* Share instructions */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
        }}>
          Share this code with your friend.<br />
          They'll enter it on their phone to join.
        </div>

        {/* Cancel */}
        <button
          className="btn btn--ghost"
          onClick={handleCancel}
          id="cancel-lobby-btn"
          aria-label="Cancel and return home"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
