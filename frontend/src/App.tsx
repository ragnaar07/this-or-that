import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';
import { Result } from './pages/Result';
import { About } from './pages/About';
import { HowToPlay } from './pages/HowToPlay';
import { SplitAnswerMock } from './pages/SplitAnswerMock';
import { NavBar } from './components/NavBar';
import type { AppScreen, PlayerSession, RoomState } from './types/game';
import { api } from './services/api';

export default function App() {
  const isSplitAnswerMock = new URLSearchParams(window.location.search).get('mock') === 'split-answer';
  const [screen, setScreen] = useState<AppScreen>('HOME');
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);

  // Active game session & result persistence: recover active match or result on refresh
  useEffect(() => {
    async function recoverSession() {
      try {
        // 1. Check for active gameplay session first
        const activeRaw = sessionStorage.getItem('synq_active_session');
        if (activeRaw) {
          const parsedSession: PlayerSession = JSON.parse(activeRaw);
          if (parsedSession && parsedSession.roomCode && parsedSession.playerId) {
            console.log('[APP] Attempting to reconnect active session for room:', parsedSession.roomCode);
            const res = await api.reconnect(parsedSession.roomCode, parsedSession.playerId, parsedSession.sessionId);
            if (res.room) {
              setSession(parsedSession);
              setRoomState(res.room);
              if (res.room.status === 'WAITING') {
                setScreen('LOBBY');
              } else if (
                res.room.status === 'PLAYING' ||
                res.room.status === 'REVEALING' ||
                res.room.status === 'GENERATING_REPORT' ||
                res.room.status === 'PLAYER_DISCONNECTED'
              ) {
                setScreen('GAME');
              } else if (res.room.status === 'FINISHED' || res.room.status === 'COMPLETED' || res.room.status === 'INTERRUPTED' || res.room.status === 'ABANDONED') {
                setScreen('RESULT');
              }
              return;
            }
          }
        }

        // 2. Check for persisted result
        const savedRoom = sessionStorage.getItem('tt_last_result_room');
        const savedSession = sessionStorage.getItem('tt_last_result_session');
        if (savedRoom && savedSession) {
          const parsedRoom: RoomState = JSON.parse(savedRoom);
          const parsedSession: PlayerSession = JSON.parse(savedSession);
          if (
            parsedRoom &&
            parsedSession &&
            (parsedRoom.status === 'FINISHED' || parsedRoom.status === 'COMPLETED' || parsedRoom.status === 'INTERRUPTED' || parsedRoom.status === 'ABANDONED')
          ) {
            console.log('[APP] Recovering persisted result after refresh for room:', parsedRoom.code);
            setRoomState(parsedRoom);
            setSession(parsedSession);
            setScreen('RESULT');
          }
        }
      } catch (err) {
        console.warn('[APP] Could not recover saved session:', err);
      }
    }

    recoverSession();
  }, []);

  // Save active gameplay session to sessionStorage
  useEffect(() => {
    if ((screen === 'GAME' || screen === 'LOBBY') && session) {
      try {
        sessionStorage.setItem('synq_active_session', JSON.stringify(session));
      } catch {}
    }
  }, [screen, session]);

  // Save active result session to sessionStorage
  useEffect(() => {
    if (screen === 'RESULT' && roomState && session) {
      try {
        sessionStorage.setItem('tt_last_result_room', JSON.stringify(roomState));
        sessionStorage.setItem('tt_last_result_session', JSON.stringify(session));
        sessionStorage.removeItem('synq_active_session');
      } catch (err) {
        console.warn('[APP] Could not save result session:', err);
      }
    }
  }, [screen, roomState, session]);

  function goHome() {
    setScreen('HOME');
    setSession(null);
    setRoomState(null);
    try {
      sessionStorage.removeItem('synq_active_session');
      sessionStorage.removeItem('tt_last_result_room');
      sessionStorage.removeItem('tt_last_result_session');
    } catch {}
  }

  function handleEnterLobby(s: PlayerSession) {
    setSession(s);
    setScreen('LOBBY');
  }

  function handleGameStart(room: RoomState) {
    // Called from Lobby when guest joins and game starts
    setRoomState(room);
    setScreen('GAME');
  }

  function handleGameFinish(room: RoomState) {
    // Called when game completes all rounds or is interrupted
    console.log('[APP] Game reached terminal state. Routing to RESULT screen:', room.status);
    setRoomState(room);
    setScreen('RESULT');
  }

  if (isSplitAnswerMock) {
    return <SplitAnswerMock />;
  }

  return (
    <>
      {screen !== 'GAME' && (
        <NavBar
          currentScreen={screen}
          onGoHome={screen !== 'HOME' ? goHome : undefined}
          onOpenAbout={() => setScreen('ABOUT')}
          onOpenHowToPlay={() => setScreen('HOW_TO_PLAY')}
        />
      )}

      {screen === 'ABOUT' && (
        <About
          onBack={goHome}
          onOpenHowToPlay={() => setScreen('HOW_TO_PLAY')}
        />
      )}

      {screen === 'HOW_TO_PLAY' && (
        <HowToPlay onBack={goHome} />
      )}

      {screen === 'HOME' && (
        <Home
          onEnterLobby={handleEnterLobby}
          onEnterGame={(s, room) => {
            // Guest goes directly to game (no lobby)
            setSession(s);
            setRoomState(room);
            setScreen('GAME');
          }}
          onOpenAbout={() => setScreen('ABOUT')}
          onOpenHowToPlay={() => setScreen('HOW_TO_PLAY')}
        />
      )}

      {screen === 'LOBBY' && session && (
        <Lobby
          session={session}
          onGameStart={handleGameStart}
          onCancel={goHome}
        />
      )}

      {screen === 'GAME' && session && roomState && (
        <Game
          session={session}
          initialRoom={roomState}
          onGameFinish={handleGameFinish}
          onLeave={goHome}
        />
      )}

      {screen === 'RESULT' && session && roomState && (
        <Result
          session={session}
          room={roomState}
          onPlayAgain={(newRoom) => {
            if (newRoom) {
              console.log('[APP] Rematch started for room:', newRoom.code);
              setRoomState(newRoom);
              setScreen('GAME');
            } else {
              goHome();
            }
          }}
          onGoHome={goHome}
        />
      )}
    </>
  );
}
