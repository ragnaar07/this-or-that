import { useEffect, useState } from 'react';

interface OptionButtonProps {
  label: string;
  variant: 'a' | 'b';
  onClick: () => void;
  disabled: boolean;
  selected: boolean;
  dimmed: boolean;
}

export function OptionButton({
  label,
  variant,
  onClick,
  disabled,
  selected,
  dimmed,
}: OptionButtonProps) {
  const [isPressing, setIsPressing] = useState(false);
  const classes = [
    'option-btn',
    `option-btn--${variant}`,
    selected ? 'selected' : '',
    dimmed ? 'dimmed' : '',
    isPressing ? 'is-pressing' : '',
  ]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    if (!isPressing) return;
    const timer = window.setTimeout(() => {
      setIsPressing(false);
    }, 140);

    return () => window.clearTimeout(timer);
  }, [isPressing]);

  function handleClick() {
    setIsPressing(true);
    onClick();
  }

  return (
    <button
      className={classes}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Choose ${label}`}
      id={`option-${variant}-btn`}
    >
      {label}
    </button>
  );
}
