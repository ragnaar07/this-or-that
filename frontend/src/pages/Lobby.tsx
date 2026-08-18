import type { PlayerSession, RoomState } from '../types/game';
import { api } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { TigerMascot } from '../components/TigerMascot';

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
        {/* Mascot in Lobby */}
        <div className="lobby-mascot-container">
          <TigerMascot
            mood="waiting"
            position="lobby"
            size="md"
            showSpeech={true}
          />
        </div>

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

        {/* Share Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 360, margin: '8px 0' }}>
          <button
            className="btn btn--pink"
            onClick={() => {
              const url = `${window.location.origin}?code=${session.roomCode}`;
              navigator.clipboard.writeText(url);
              alert(`Invite link copied to clipboard! Room code: ${session.roomCode}`);
            }}
            id="copy-invite-link-btn"
          >
            📋 COPY INVITE LINK
          </button>
          <a
            className="btn btn--whatsapp"
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Play THIS ⚡ THAT with me! Room Code: ${session.roomCode} 👉 ${window.location.origin}?code=${session.roomCode}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            id="whatsapp-invite-btn"
          >
            💬 INVITE ON WHATSAPP
          </a>
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
