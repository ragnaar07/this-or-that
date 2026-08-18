import { useState, useId, useEffect } from 'react';
import { TigerMascot } from '../components/TigerMascot';
import { ErrorMessage } from '../components/ErrorMessage';
import { Footer } from '../components/Footer';
import { api } from '../services/api';
import type { PlayerSession, RoomState, Gender } from '../types/game';

interface HomeProps {
  onEnterGame: (session: PlayerSession, room: RoomState) => void;
  onEnterLobby: (session: PlayerSession) => void;
  onOpenAbout: () => void;
  onOpenHowToPlay: () => void;
}

export function Home({ onEnterGame, onEnterLobby, onOpenAbout, onOpenHowToPlay }: HomeProps) {
  // Check URL params for invite link (e.g. ?code=ABCD)
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('code') || params.get('room')) {
        return 'join';
      }
    } catch {}
    return 'create';
  });

  const [roomCode, setRoomCode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return (params.get('code') || params.get('room') || '').toUpperCase().slice(0, 4);
    } catch {
      return '';
    }
  });

  const [playerName, setPlayerName] = useState(() => {
    try {
      return localStorage.getItem('tt_player_name') || '';
    } catch {
      return '';
    }
  });

  const [gender, setGender] = useState<Gender>(() => {
    try {
      const g = localStorage.getItem('tt_player_gender');
      return (g === 'male' || g === 'female' || g === 'other') ? g : 'male';
    } catch {
      return 'male';
    }
  });

  const deepPsychology = true;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);

  const createNameId = useId();
  const joinNameId = useId();
  const codeId = useId();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const c = params.get('code') || params.get('room');
      if (c) {
        setRoomCode(c.toUpperCase().slice(0, 4));
        setActiveTab('join');
      }
    } catch {}
  }, []);

  function savePreferences(name: string, gen: Gender) {
    try {
      localStorage.setItem('tt_player_name', name);
      localStorage.setItem('tt_player_gender', gen);
    } catch {}
  }

  async function handleCreate() {
    setError('');
    const name = playerName.trim();
    if (!name) {
      setError('PLEASE ENTER YOUR NAME FIRST.');
      return;
    }
    if (name.length > 20) {
      setError('NAME CANNOT EXCEED 20 CHARACTERS.');
      return;
    }

    savePreferences(name, gender);
    setLoading('create');
    try {
      const res = await api.createRoom(name, gender, deepPsychology, 20, 'INDIA', 'fun');
      if (res.error || !res.room || !res.playerId) {
        setError(res.error ?? 'Could not create room. Try again.');
        return;
      }
      onEnterLobby({
        playerId: res.playerId,
        sessionId: res.sessionId || api.getClientSessionId(),
        role: 'host',
        roomCode: res.room.code,
        playerName: name,
        gender,
      });
    } finally {
      setLoading(null);
    }
  }

  async function handleJoin() {
    setError('');
    const code = roomCode.trim().toUpperCase();
    if (!code || code.length !== 4) {
      setError('ENTER A 4-LETTER ROOM CODE.');
      return;
    }

    const name = playerName.trim();
    if (!name) {
      setError('PLEASE ENTER YOUR NAME FIRST.');
      return;
    }
    if (name.length > 20) {
      setError('NAME CANNOT EXCEED 20 CHARACTERS.');
      return;
    }

    savePreferences(name, gender);
    setLoading('join');
    try {
      const res = await api.joinRoom(code, name, gender);
      if (res.error || !res.room || !res.playerId) {
        setError(res.error ?? 'Could not join room. Check code & try again.');
        return;
      }
      onEnterGame({
        playerId: res.playerId,
        sessionId: res.sessionId || api.getClientSessionId(),
        role: 'guest',
        roomCode: res.room.code,
        playerName: name,
        gender,
      }, res.room);
    } finally {
      setLoading(null);
    }
  }

  async function handleShareApp() {
    const url = window.location.origin;
    const payload = {
      title: 'THIS ⚡ THAT',
      text: 'Play THIS ⚡ THAT with me.',
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }

    await navigator.clipboard.writeText(url);
  }

  return (
    <div className="app-wrapper">
      <div className="screen">
        {/* 3D Tiger Mascot — Living Homepage Character */}
        <TigerMascot
          mode="homepage"
          interactive={true}
          showSpeech={true}
        />

        <div className="card home-room-card">
          {/* Top Segmented Mode Switcher */}
          <div className="home-mode-tabs" role="tablist">
            <button
              type="button"
              className={`home-mode-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => { setActiveTab('create'); setError(''); }}
              role="tab"
              aria-selected={activeTab === 'create'}
              id="tab-create-room"
            >
              ⚡ Create
            </button>
            <button
              type="button"
              className={`home-mode-tab ${activeTab === 'join' ? 'active' : ''}`}
              onClick={() => { setActiveTab('join'); setError(''); }}
              role="tab"
              aria-selected={activeTab === 'join'}
              id="tab-join-room"
            >
              🎮 Join
            </button>
          </div>

          {/* ============================================================
             TAB 1: CREATE ROOM
             ============================================================ */}
          {activeTab === 'create' && (
            <div className="home-tab-pane">
              {/* Name input */}
              <div className="input-group">
                <div className="input-label-row">
                  <label className="input-label" htmlFor={createNameId}>
                    Your Name
                  </label>
                  <span className="input-hint">Nickname / Real Name</span>
                </div>
                <input
                  id={createNameId}
                  className="input-field"
                  type="text"
                  placeholder="e.g. Rahul / Priya"
                  maxLength={20}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoComplete="off"
                  aria-label="Your player name"
                />
              </div>

              {/* Gender Selector Chips */}
              <div className="gender-selector-group">
                <div className="gender-label">Select Your Gender:</div>
                <div className="gender-chips">
                  <button
                    type="button"
                    className={`gender-chip ${gender === 'male' ? 'active' : ''}`}
                    onClick={() => setGender('male')}
                    id="gender-male-btn"
                  >
                    👨 Male
                  </button>
                  <button
                    type="button"
                    className={`gender-chip ${gender === 'female' ? 'active' : ''}`}
                    onClick={() => setGender('female')}
                    id="gender-female-btn"
                  >
                    👩 Female
                  </button>
                  <button
                    type="button"
                    className={`gender-chip ${gender === 'other' ? 'active' : ''}`}
                    onClick={() => setGender('other')}
                    id="gender-other-btn"
                  >
                    ⚡ Other
                  </button>
                </div>
              </div>

              {/* Create room button */}
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
                  '⚡ START PRIVATE ROOM'
                )}
              </button>
            </div>
          )}

          {/* ============================================================
             TAB 2: JOIN ROOM
             ============================================================ */}
          {activeTab === 'join' && (
            <div className="home-tab-pane">
              {/* Room code input */}
              <div className="input-group">
                <div className="input-label-row">
                  <label className="input-label" htmlFor={codeId}>
                    Room Code
                  </label>
                  <span className="input-hint">4-Letter Code</span>
                </div>
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
                  autoFocus={Boolean(roomCode.length === 0)}
                />
              </div>

              {/* Name input */}
              <div className="input-group">
                <div className="input-label-row">
                  <label className="input-label" htmlFor={joinNameId}>
                    Your Name
                  </label>
                  <span className="input-hint">Nickname / Real Name</span>
                </div>
                <input
                  id={joinNameId}
                  className="input-field"
                  type="text"
                  placeholder="e.g. Rahul / Priya"
                  maxLength={20}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  autoComplete="off"
                  aria-label="Your player name"
                />
              </div>

              {/* Gender Selector Chips */}
              <div className="gender-selector-group">
                <div className="gender-label">Select Your Gender:</div>
                <div className="gender-chips">
                  <button
                    type="button"
                    className={`gender-chip ${gender === 'male' ? 'active' : ''}`}
                    onClick={() => setGender('male')}
                    id="join-gender-male-btn"
                  >
                    👨 Male
                  </button>
                  <button
                    type="button"
                    className={`gender-chip ${gender === 'female' ? 'active' : ''}`}
                    onClick={() => setGender('female')}
                    id="join-gender-female-btn"
                  >
                    👩 Female
                  </button>
                  <button
                    type="button"
                    className={`gender-chip ${gender === 'other' ? 'active' : ''}`}
                    onClick={() => setGender('other')}
                    id="join-gender-other-btn"
                  >
                    ⚡ Other
                  </button>
                </div>
              </div>

              {/* Join room button */}
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
                  '🎮 ENTER ROOM'
                )}
              </button>
            </div>
          )}

          {/* Inline error */}
          {error && <ErrorMessage message={error} />}
        </div>

        {/* Global Credible Footer with Live 10,000+ Visitor Counter */}
        <Footer
          onOpenHowToPlay={onOpenHowToPlay}
          onOpenAbout={onOpenAbout}
          onShareApp={handleShareApp}
        />
      </div>
    </div>
  );
}
