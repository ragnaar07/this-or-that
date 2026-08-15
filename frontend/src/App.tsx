import { useState } from 'react';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';
import { Result } from './pages/Result';
import { About } from './pages/About';
import { HowToPlay } from './pages/HowToPlay';
import { TopBrandBadge } from './components/TopBrandBadge';
import type { AppScreen, PlayerSession, RoomState } from './types/game';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('HOME');
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);

  function goHome() {
    setScreen('HOME');
    setSession(null);
    setRoomState(null);
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
    setRoomState(room);
    setScreen('RESULT');
  }

  return (
    <>
      {screen !== 'GAME' && screen !== 'ABOUT' && screen !== 'HOW_TO_PLAY' && (
        <TopBrandBadge onClick={screen !== 'HOME' ? goHome : undefined} />
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
