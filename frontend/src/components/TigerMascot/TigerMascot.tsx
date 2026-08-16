/* ============================================================
   TigerMascot — Main Orchestrator Component
   
   Two modes:
   1. Homepage mode (mode="homepage"): Full state machine with
      wandering, food hunting, hover/tap reactions.
   2. Game mode (default): Simple mood-based pose rendering
      used on Game, Reveal, Result, Lobby pages.
   ============================================================ */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TigerSVG } from './TigerSVG';
import type { TigerMood } from './tigerDialogue';
import { getTigerDialogue } from './tigerDialogue';
import {
  type TigerBehaviourState,
  type TigerStateData,
  createInitialState,
  getNextState,
  getStateDuration,
  getExpressionForState,
  getSpeedForState,
} from './TigerStateMachine';
import { createFood, randomSpawnInterval, type FoodItem } from './TigerFoodSystem';
import {
  type InteractionState,
  type ReactionType,
  createInteractionState,
  canReact,
  pickReaction,
  recordReaction,
  getReactionExpression,
  getReactionDuration,
} from './TigerInteractions';
import './tigerMascot.css';

export type { TigerMood };

export interface TigerMascotProps {
  /** 'homepage' activates full FSM + food + interactions */
  mode?: 'homepage' | 'game';
  mood?: TigerMood;
  customSpeech?: string | null;
  showSpeech?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  position?: 'home' | 'game' | 'reveal' | 'result' | 'lobby';
  countdownValue?: number | null;
  roundFormat?: string;
  variantSeed?: number | string;
  className?: string;
  interactive?: boolean;
}

// ── Behaviour State → Dialogue Mood mapping ──
function behaviourToMood(state: TigerBehaviourState): TigerMood {
  const map: Record<TigerBehaviourState, TigerMood> = {
    IDLE: 'idle',
    WANDER: 'wandering',
    SNIFF: 'sniffing',
    LOOK_AROUND: 'curious',
    HUNGRY: 'hungry',
    FOOD_DETECTED: 'foodDetected',
    CHASE_FOOD: 'foodDetected',
    CATCH_FOOD: 'celebrate',
    MISS_FOOD: 'disappointed',
    DISAPPOINTED: 'disappointed',
    SIT: 'sitting',
    LOOK_AT_USER: 'lookingAtUser',
    LOOK_AT_CARD: 'lookingAtCard',
    REACT: 'idle',
    SCRATCH: 'scratching',
  };
  return map[state] || 'idle';
}

// ── Simple Game Mode Component (no FSM, no food, no interactions) ──
function GameModeMascot({
  mood = 'idle',
  customSpeech,
  showSpeech = true,
  size = 'md',
  position = 'home',
  countdownValue,
  roundFormat,
  variantSeed,
  className = '',
}: Omit<TigerMascotProps, 'mode' | 'interactive'>) {
  const effectiveMood: TigerMood = useMemo(() => {
    if (countdownValue !== undefined && countdownValue !== null) {
      if (countdownValue > 0 && countdownValue <= 3) return 'countdown';
      if (countdownValue === 0) return 'celebrate';
    }
    if (roundFormat === 'EDGE') return 'edge';
    if (roundFormat === 'FUNNY') return 'funny';
    if (roundFormat === 'CHAOS') return 'chaos';
    return mood;
  }, [mood, countdownValue, roundFormat]);

  const speechText = useMemo(() => {
    if (customSpeech !== undefined) return customSpeech;
    if (countdownValue !== undefined && countdownValue !== null) {
      if (countdownValue === 3) return '3... get ready! ⚡';
      if (countdownValue === 2) return '2... lock in! 🎯';
      if (countdownValue === 1) return '1... GO! 🔥';
      if (countdownValue === 0) return 'GO GO GO! ⚡';
    }
    return getTigerDialogue(effectiveMood, variantSeed);
  }, [customSpeech, countdownValue, effectiveMood, variantSeed]);

  const isCelebrating = effectiveMood === 'match' || effectiveMood === 'celebrate' || effectiveMood === 'resultHigh';
  const isLaughing = effectiveMood === 'funny' || effectiveMood === 'chaos';
  const isSquinting = effectiveMood === 'edge';
  const isShocked = effectiveMood === 'timeout';
  const isSad = effectiveMood === 'opponentLeft' || effectiveMood === 'resultLow';
  const isWaiting = effectiveMood === 'waiting';

  return (
    <div
      className={`tiger-mascot-wrapper tiger-mascot--${size} tiger-mascot--${effectiveMood} tiger-mascot-pos--${position} ${className}`}
      aria-hidden="true"
    >
      {showSpeech && speechText && (
        <div className="tiger-speech-bubble" role="presentation">
          <span className="tiger-speech-text">{speechText}</span>
        </div>
      )}

      {isCelebrating && (
        <div className="tiger-sparks">
          <span className="tiger-spark-dot" style={{ top: '10%', left: '15%', width: 6, height: 6, background: '#FFD700' }} />
          <span className="tiger-spark-dot" style={{ top: '15%', right: '20%', width: 5, height: 5, background: '#FF3CAC', animationDelay: '0.2s' }} />
          <span className="tiger-spark-dot" style={{ bottom: '25%', left: '20%', width: 6, height: 6, background: '#00E5A0', animationDelay: '0.4s' }} />
          <span className="tiger-spark-dot" style={{ top: '5%', left: '50%', width: 7, height: 7, background: '#7B2FBE', animationDelay: '0.3s' }} />
        </div>
      )}

      <TigerSVG
        eyeState={isCelebrating || isLaughing ? 'happy' : isSquinting ? 'squint' : isShocked ? 'wide' : 'open'}
        mouthState={isCelebrating || isLaughing ? 'laugh' : isShocked ? 'surprise' : isSad ? 'sad' : isWaiting ? 'smirk' : 'smile'}
        eyebrowState={isShocked || isCelebrating ? 'raised' : isSquinting ? 'furrowed' : isWaiting ? 'asymmetric' : 'neutral'}
        pawPose={isCelebrating ? 'up' : isSquinting ? 'chin' : 'rest'}
        tailState={isCelebrating ? 'excited' : isSad ? 'droop' : isWaiting ? 'wag' : 'idle'}
        blush={isCelebrating || isLaughing}
      />
    </div>
  );
}

// ── Homepage Mode Component (full FSM + food + interactions) ──
function HomeModeMascot({ showSpeech = true, className = '' }: TigerMascotProps) {
  // Refs for animation state (no React re-renders per frame)
  const tigerRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<TigerStateData>(createInitialState());
  const interactionRef = useRef<InteractionState>(createInteractionState());
  const foodRef = useRef<FoodItem | null>(null);
  const rafRef = useRef<number>(0);
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const foodTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastFrameRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  // React state only for things that need DOM updates
  const [speechText, setSpeechText] = useState<string | null>(null);
  const [expression, setExpression] = useState(getExpressionForState('IDLE'));
  const [facingLeft, setFacingLeft] = useState(false);
  const [squashX, setSquashX] = useState(1);
  const [squashY, setSquashY] = useState(1);
  const [food, setFood] = useState<{ emoji: string; x: number; phase: string } | null>(null);
  const [reactionClass, setReactionClass] = useState('');
  const [showQuestion, setShowQuestion] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // ── Transition to new behaviour state ──
  const transitionTo = useCallback((newState: TigerBehaviourState) => {
    const s = stateRef.current;
    s.previousState = s.state;
    s.state = newState;
    s.stateTimer = getStateDuration(newState);

    // Update speed
    const speed = getSpeedForState(newState);
    if (speed > 0 && (newState === 'WANDER' || newState === 'LOOK_AT_CARD')) {
      // Pick random direction or toward food/card
      s.vx = (Math.random() > 0.5 ? 1 : -1) * speed;
      s.facingLeft = s.vx < 0;
    } else if (newState === 'CHASE_FOOD' && foodRef.current) {
      // Chase toward food
      const dir = foodRef.current.x > s.x ? 1 : -1;
      s.vx = dir * speed;
      s.facingLeft = dir < 0;
    } else {
      s.vx = 0;
    }

    // Update expression (batched React update)
    const expr = getExpressionForState(newState);
    setExpression(expr);
    setFacingLeft(s.facingLeft);
    setIsWalking(newState === 'WANDER' || newState === 'LOOK_AT_CARD');
    setIsRunning(newState === 'CHASE_FOOD');

    // Squash on stop
    if (speed === 0 && (s.previousState === 'WANDER' || s.previousState === 'CHASE_FOOD')) {
      setSquashX(1.08);
      setSquashY(0.92);
      setTimeout(() => { setSquashX(1); setSquashY(1); }, 150);
    }

    // Speech updates (only for interesting states)
    const shouldSpeak = ['HUNGRY', 'FOOD_DETECTED', 'CATCH_FOOD', 'DISAPPOINTED', 'LOOK_AT_USER', 'LOOK_AT_CARD', 'SNIFF', 'SIT', 'SCRATCH'].includes(newState);
    if (shouldSpeak) {
      const mood = behaviourToMood(newState);
      setSpeechText(getTigerDialogue(mood));
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => setSpeechText(null), 3000);
    } else if (newState === 'WANDER' || newState === 'IDLE') {
      // Occasionally speak while wandering
      if (Math.random() < 0.15) {
        setSpeechText(getTigerDialogue(behaviourToMood(newState)));
        if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
        speechTimerRef.current = setTimeout(() => setSpeechText(null), 2500);
      }
    }

    // Handle food sequence
    if (newState === 'CATCH_FOOD') {
      if (foodRef.current) {
        setFood({ emoji: foodRef.current.emoji, x: foodRef.current.x, phase: 'caught' });
        setTimeout(() => { setFood(null); foodRef.current = null; }, 300);
      }
      setSquashY(0.85); setSquashX(1.1);
      setTimeout(() => { setSquashX(1); setSquashY(1); }, 200);
    } else if (newState === 'MISS_FOOD') {
      if (foodRef.current) {
        setFood({ emoji: foodRef.current.emoji, x: foodRef.current.x, phase: 'vanishing' });
        setTimeout(() => { setFood(null); foodRef.current = null; }, 300);
      }
    }

    // Reaction classes
    setReactionClass('');
    setShowQuestion(false);

    // Schedule next transition
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    stateTimerRef.current = setTimeout(() => {
      const next = getNextState(newState);
      transitionTo(next);
    }, s.stateTimer);
  }, []);

  // ── Handle hover/tap interaction ──
  const handleInteraction = useCallback(() => {
    if (!canReact(interactionRef.current)) return;
    if (prefersReducedMotion.current) return;

    const reaction = pickReaction(interactionRef.current);
    interactionRef.current = recordReaction(interactionRef.current, reaction);

    // Pause FSM
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    stateRef.current.vx = 0;

    // Apply reaction expression
    const expr = getReactionExpression(reaction);
    setExpression(expr);
    setIsWalking(false);
    setIsRunning(false);

    // Reaction-specific visuals
    if (reaction === 'surprised') {
      setReactionClass('tiger-react--surprised');
      setSquashX(1.1); setSquashY(0.9);
      setTimeout(() => { setSquashX(1); setSquashY(1); }, 300);
    } else if (reaction === 'duck') {
      setReactionClass('tiger-react--duck');
    } else if (reaction === 'excited') {
      setReactionClass('tiger-react--excited');
    } else if (reaction === 'confused') {
      setShowQuestion(true);
    } else if (reaction === 'wave') {
      setReactionClass('');
    } else {
      setReactionClass('');
    }

    // Speech for reaction
    const reactionSpeechMap: Partial<Record<ReactionType, string>> = {
      surprised: 'WHOA! 😳',
      wave: 'Hey there! 👋🐯',
      duck: '*hides* ...you scared me! 😅',
      sniff_cursor: '*sniff sniff* ...you smell interesting 👃',
      annoyed: 'Hmph! Can\'t a tiger rest?! 😤',
      big_smile: 'Hehe! 😸✨',
      scratch_head: 'Hmm... what do you want? 🤔',
      excited: 'YESSS! LET\'S GOOOO! 🔥⚡',
      pretend_bite: 'NOM! ...just kidding 😂',
      confused: '...wait, what? 🐯❓',
      point_at_game: 'Play THIS ⚡ THAT! 🎮',
      look_at_cursor: 'I see you! 👀',
    };
    const reactionSpeech = reactionSpeechMap[reaction] || 'Hey! 🐯';
    setSpeechText(reactionSpeech);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => setSpeechText(null), 2500);

    // Return to FSM after reaction
    const duration = getReactionDuration(reaction);
    stateTimerRef.current = setTimeout(() => {
      setReactionClass('');
      setShowQuestion(false);
      transitionTo('IDLE');
    }, duration);
  }, [transitionTo]);

  // ── Animation frame loop — updates tiger position ──
  const animate = useCallback((timestamp: number) => {
    if (!lastFrameRef.current) lastFrameRef.current = timestamp;
    const dt = Math.min(timestamp - lastFrameRef.current, 50); // cap at 50ms
    lastFrameRef.current = timestamp;

    const s = stateRef.current;

    // Move tiger
    if (s.vx !== 0) {
      s.x += s.vx * (dt / 1000);
      // Clamp to bounds
      if (s.x < 0.05) { s.x = 0.05; s.vx = Math.abs(s.vx); s.facingLeft = false; setFacingLeft(false); }
      if (s.x > 0.95) { s.x = 0.95; s.vx = -Math.abs(s.vx); s.facingLeft = true; setFacingLeft(true); }

      // Check if reached food during chase
      if (s.state === 'CHASE_FOOD' && foodRef.current) {
        const dist = Math.abs(s.x - foodRef.current.x);
        if (dist < 0.06) {
          if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
          // 30% catch, 70% miss
          const caught = Math.random() < 0.3;
          transitionTo(caught ? 'CATCH_FOOD' : 'MISS_FOOD');
        }
      }
    }

    // Apply position directly to DOM
    if (tigerRef.current && areaRef.current) {
      const areaWidth = areaRef.current.offsetWidth;
      const tigerWidth = tigerRef.current.offsetWidth;
      const px = s.x * (areaWidth - tigerWidth);
      tigerRef.current.style.transform = `translateX(${px}px)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [transitionTo]);

  // ── Food spawning loop ──
  const scheduleFood = useCallback(() => {
    if (prefersReducedMotion.current) return;
    foodTimerRef.current = setTimeout(() => {
      if (!foodRef.current && stateRef.current.state !== 'REACT') {
        const s = stateRef.current;
        const f = createFood(s.x);
        foodRef.current = f;
        setFood({ emoji: f.emoji, x: f.x, phase: 'idle' });

        // Tiger notices food after delay
        setTimeout(() => {
          if (foodRef.current && stateRef.current.state !== 'REACT') {
            if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
            transitionTo('FOOD_DETECTED');
            // Start chase after detection time
            setTimeout(() => {
              if (foodRef.current) {
                transitionTo('CHASE_FOOD');
              }
            }, getStateDuration('FOOD_DETECTED'));
          }
        }, 600 + Math.random() * 800);
      }
      scheduleFood();
    }, randomSpawnInterval());
  }, [transitionTo]);

  // ── Initialization ──
  useEffect(() => {
    // Check reduced motion preference
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mql.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => { prefersReducedMotion.current = e.matches; };
    mql.addEventListener('change', handleMotionChange);

    // Start FSM
    transitionTo('IDLE');

    // Start animation loop
    if (!prefersReducedMotion.current) {
      rafRef.current = requestAnimationFrame(animate);
      scheduleFood();
    }

    // Initial speech
    setSpeechText(getTigerDialogue('idle'));
    speechTimerRef.current = setTimeout(() => setSpeechText(null), 3500);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
      if (foodTimerRef.current) clearTimeout(foodTimerRef.current);
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      mql.removeEventListener('change', handleMotionChange);
    };
  }, [animate, transitionTo, scheduleFood]);

  return (
    <div className={`home-mascot-area ${className}`} ref={areaRef} aria-hidden="true">
      {/* Food Item */}
      {food && (
        <span
          className={`tiger-food-item ${food.phase === 'vanishing' ? 'tiger-food-item--vanishing' : food.phase === 'caught' ? 'tiger-food-item--caught' : ''}`}
          style={{ left: `${food.x * 100}%` }}
        >
          {food.emoji}
        </span>
      )}

      {/* Tiger Character */}
      <div
        className={`tiger-wanderer tiger-mascot--hero ${reactionClass}`}
        ref={tigerRef}
        style={{ position: 'absolute', bottom: 0 }}
      >
        {/* Speech Bubble */}
        {showSpeech && speechText && (
          <div className="tiger-speech-bubble" role="presentation">
            <span className="tiger-speech-text">{speechText}</span>
          </div>
        )}

        {/* Question Mark for confused reaction */}
        {showQuestion && <span className="tiger-question-mark">❓</span>}

        {/* Sparkles on catch */}
        {food?.phase === 'caught' && (
          <div className="tiger-sparks">
            <span className="tiger-spark-dot" style={{ top: '10%', left: '15%', width: 6, height: 6, background: '#FFD700' }} />
            <span className="tiger-spark-dot" style={{ top: '15%', right: '20%', width: 5, height: 5, background: '#FF3CAC', animationDelay: '0.2s' }} />
            <span className="tiger-spark-dot" style={{ bottom: '25%', left: '20%', width: 6, height: 6, background: '#00E5A0', animationDelay: '0.4s' }} />
          </div>
        )}

        {/* Bounce wrapper for walking/running */}
        <div
          style={{
            animation: isRunning ? 'tiger-run-bounce 0.25s ease-in-out infinite' : isWalking ? 'tiger-walk-bounce 0.5s ease-in-out infinite' : 'none',
          }}
        >
          <TigerSVG
            eyeState={expression.eyeState}
            mouthState={expression.mouthState}
            eyebrowState={expression.eyebrowState}
            pawPose={expression.pawPose}
            tailState={expression.tailState}
            blush={expression.blush}
            lookX={0}
            lookY={0}
            squashX={squashX}
            squashY={squashY}
            facingLeft={facingLeft}
          />
        </div>

        {/* Transparent Interaction Hit Area */}
        <button
          className="tiger-hit-area"
          onClick={handleInteraction}
          onMouseEnter={handleInteraction}
          aria-label="Interact with the tiger mascot"
          tabIndex={-1}
          type="button"
        />
      </div>
    </div>
  );
}

// ── Main Export: TigerMascot ──
export function TigerMascot(props: TigerMascotProps) {
  if (props.mode === 'homepage') {
    return <HomeModeMascot {...props} />;
  }
  return <GameModeMascot {...props} />;
}
