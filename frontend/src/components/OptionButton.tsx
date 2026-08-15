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
  const classes = [
    'option-btn',
    `option-btn--${variant}`,
    selected ? 'selected' : '',
    dimmed ? 'dimmed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Choose ${label}`}
      id={`option-${variant}-btn`}
    >
      {label}
    </button>
  );
}
