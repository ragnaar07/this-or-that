import { useState } from 'react';
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
  const [pollingConflictError, setPollingConflictError] = useState<string | null>(null);

  // Poll for guest joining — when status changes to PLAYING, enter game
  usePolling(
    async () => {
      const res = await api.pollRoom(session.roomCode, session.playerId, session.sessionId);
      if (res.error) {
        if (res.status === 409) {
          setPollingConflictError(res.error);
        }
        return;
      }

      setPollingConflictError(null);
      if (res.room && res.room.status === 'PLAYING') {
        onGameStart(res.room);
      }
    },
    700,
    !pollingConflictError
  );

  async function handleCancel() {
    await api.leaveRoom(session.roomCode, session.playerId, session.sessionId);
    onCancel();
  }

  return (
    <div className="app-wrapper">
      {pollingConflictError && (
        <div className="synq-session-conflict-overlay" role="alertdialog" aria-modal="true" aria-labelledby="lobby-session-conflict-title">
          <div className="synq-session-conflict-card">
            <div className="synq-session-conflict-title" id="lobby-session-conflict-title">
              Room open in another tab
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

      <div className="screen lobby-screen">
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
        <div className="lobby-actions">
          <button
            className="btn btn--pink lobby-action-btn"
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
            className="btn btn--whatsapp lobby-action-btn"
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
          className="btn btn--ghost lobby-cancel-btn"
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
