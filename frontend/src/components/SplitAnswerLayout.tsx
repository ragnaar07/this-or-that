import { useEffect, useState, type ReactNode } from 'react';

type AnswerVariant = 'a' | 'b';

const CATEGORY_ICONS: Record<string, string> = {
  'food & chai': '🍛',
  'money & career': '💼',
  'indian everyday life': '🏠',
  'bollywood & cinema': '🎬',
  'cinema & entertainment': '🎬',
  'cricket & sports': '🏏',
  'crazy & superpowers': '⚡',
  'deep & philosophy': '🧠',
  'friendship & relationships': '💬',
  'public life & culture': '🏛️',
  'digital & memes': '📱',
};

interface SplitAnswerLayoutProps {
  optionA: string;
  optionB: string;
  roundLabel: string;
  category?: string;
  prompt: string;
  scoreLabel: string;
  roundBadgeLabel?: string;
  roundBadgeVariant?: string;
  scenario?: string;
  selectedChoice: string | null;
  disabled: boolean;
  dimUnselected?: boolean;
  revealChoices?: string[];
  myRevealChoice?: string | null;
  opponentRevealChoice?: string | null;
  predictionNotice?: ReactNode;
  countdown?: ReactNode;
  onSelect: (choice: string, variant: AnswerVariant) => void;
}

function scenarioSizeClass(scenario?: string) {
  if (!scenario) return '';
  if (scenario.length < 75) return 'split-answer-context--hero';
  if (scenario.length < 130) return 'split-answer-context--lg';
  return 'split-answer-context--md';
}

function getCategoryIcon(category?: string) {
  if (!category) return null;
  return CATEGORY_ICONS[category.trim().toLowerCase()] ?? '✨';
}

interface AnswerPanelProps {
  label: string;
  variant: AnswerVariant;
  selected: boolean;
  pressing: boolean;
  dimmed: boolean;
  revealPicked: boolean;
  revealPickedByMe: boolean;
  revealPickedByOpponent: boolean;
  disabled: boolean;
  onSelect: (choice: string, variant: AnswerVariant) => void;
}

function AnswerPanel({
  label,
  variant,
  selected,
  pressing,
  dimmed,
  revealPicked,
  revealPickedByMe,
  revealPickedByOpponent,
  disabled,
  onSelect,
}: AnswerPanelProps) {
  const classes = [
    'split-answer-panel',
    `split-answer-panel--${variant}`,
    selected ? 'is-selected' : '',
    pressing ? 'is-pressing' : '',
    dimmed ? 'is-dimmed' : '',
    revealPicked ? 'is-reveal-picked' : '',
    revealPickedByMe ? 'is-reveal-picked-by-me' : '',
    revealPickedByOpponent ? 'is-reveal-picked-by-opponent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={() => onSelect(label, variant)}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Choose ${label}`}
      id={`option-${variant}-panel`}
    >
      <span className="split-answer-panel__inner">
        <span className="split-answer-panel__label">{label}</span>
      </span>
    </button>
  );
}

export function SplitAnswerLayout({
  optionA,
  optionB,
  roundLabel,
  category,
  prompt,
  scoreLabel,
  roundBadgeLabel,
  roundBadgeVariant = 'situational',
  scenario,
  selectedChoice,
  disabled,
  dimUnselected = false,
  revealChoices = [],
  myRevealChoice,
  opponentRevealChoice,
  predictionNotice,
  countdown,
  onSelect,
}: SplitAnswerLayoutProps) {
  const [pressedVariant, setPressedVariant] = useState<AnswerVariant | null>(null);
  const selectedA = selectedChoice === optionA;
  const selectedB = selectedChoice === optionB;
  const shouldDim = dimUnselected && selectedChoice !== null;
  const revealPickedA = revealChoices.includes(optionA);
  const revealPickedB = revealChoices.includes(optionB);
  const categoryIcon = getCategoryIcon(category);

  useEffect(() => {
    if (pressedVariant === null) return;
    const timer = window.setTimeout(() => {
      setPressedVariant(null);
    }, 140);

    return () => window.clearTimeout(timer);
  }, [pressedVariant]);

  function handleSelect(choice: string, variant: AnswerVariant) {
    setPressedVariant(variant);
    onSelect(choice, variant);
  }

  return (
    <section className="split-answer-layout" aria-label="Choose one answer">
      <div className="split-answer-meta" aria-label={`${roundLabel}${category ? `, ${category}` : ''}`}>
        {roundBadgeLabel && (
          <div className={`game-round-badge game-round-badge--${roundBadgeVariant}`}>
            {roundBadgeLabel}
          </div>
        )}
        <div className="split-answer-round-pill">
          <span>{roundLabel}</span>
          {category && (
            <span className="split-answer-category">
              {categoryIcon && (
                <span className="split-answer-category__icon" aria-hidden="true">
                  {categoryIcon}
                </span>
              )}
              <span>{category}</span>
            </span>
          )}
        </div>
        {scenario && (
          <div className={`split-answer-context ${scenarioSizeClass(scenario)}`}>
            {scenario}
          </div>
        )}
        <div className="split-answer-prompt">{prompt}</div>
        {predictionNotice}
      </div>

      <div className="split-answer-score" aria-label={`${scoreLabel} matched`}>
        <span aria-hidden="true">⚡</span>
        <strong>{scoreLabel}</strong>
      </div>

      <div className="split-answer-panels">
        <AnswerPanel
          label={optionA}
          variant="a"
          selected={selectedA}
          pressing={pressedVariant === 'a'}
          dimmed={shouldDim && !selectedA && !revealPickedA}
          revealPicked={revealPickedA}
          revealPickedByMe={myRevealChoice === optionA}
          revealPickedByOpponent={opponentRevealChoice === optionA}
          disabled={disabled}
          onSelect={handleSelect}
        />
        <div className="split-answer-divider" aria-hidden="true" />
        <AnswerPanel
          label={optionB}
          variant="b"
          selected={selectedB}
          pressing={pressedVariant === 'b'}
          dimmed={shouldDim && !selectedB && !revealPickedB}
          revealPicked={revealPickedB}
          revealPickedByMe={myRevealChoice === optionB}
          revealPickedByOpponent={opponentRevealChoice === optionB}
          disabled={disabled}
          onSelect={handleSelect}
        />
      </div>

      {countdown && (
        <div className="split-answer-countdown">
          {countdown}
        </div>
      )}
    </section>
  );
}
