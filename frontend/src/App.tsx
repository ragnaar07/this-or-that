import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';
import { Result } from './pages/Result';
import { About } from './pages/About';
import { HowToPlay } from './pages/HowToPlay';
import { NavBar } from './components/NavBar';
import type { AppScreen, PlayerSession, RoomState } from './types/game';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('HOME');
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);

  // Result persistence: recover result on refresh if room was FINISHED or INTERRUPTED
  useEffect(() => {
    try {
      const savedRoom = sessionStorage.getItem('tt_last_result_room');
      const savedSession = sessionStorage.getItem('tt_last_result_session');
      if (savedRoom && savedSession) {
        const parsedRoom: RoomState = JSON.parse(savedRoom);
        const parsedSession: PlayerSession = JSON.parse(savedSession);
        if (
          parsedRoom &&
          parsedSession &&
          (parsedRoom.status === 'FINISHED' || parsedRoom.status === 'INTERRUPTED')
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
  }, []);

  // Save active result session to sessionStorage
  useEffect(() => {
    if (screen === 'RESULT' && roomState && session) {
      try {
        sessionStorage.setItem('tt_last_result_room', JSON.stringify(roomState));
        sessionStorage.setItem('tt_last_result_session', JSON.stringify(session));
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
          onPlayAgain={goHome}
        />
      )}
    </>
  );
}
