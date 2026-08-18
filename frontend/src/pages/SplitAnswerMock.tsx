import { GameHeader } from '../components/GameHeader';
import { Countdown } from '../components/Countdown';
import { SplitAnswerLayout } from '../components/SplitAnswerLayout';

export function SplitAnswerMock() {
  return (
    <>
      <GameHeader
        matches={7}
        total={12}
        hostName="Aarya"
        guestName="Kabir"
        onLeave={() => undefined}
        showScore={false}
      />
      <main className="game-screen game-screen--split">
        <SplitAnswerLayout
          optionA="Masala chai in the rain"
          optionB="Late-night dhaba run"
          roundLabel="ROUND 1 OF 20"
          category="INDIAN EVERYDAY LIFE"
          prompt="PICK ONE — FAST!"
          scoreLabel="7/12"
          roundBadgeLabel="⚡ QUICK PICK (10s)"
          roundBadgeVariant="quick"
          selectedChoice={null}
          disabled={false}
          onSelect={() => undefined}
          countdown={
            <Countdown
              deadline={Date.now() + 8000}
              hasAnswered={false}
              timeLimit={10}
              format="QUICK"
            />
          }
        />
      </main>
    </>
  );
}
