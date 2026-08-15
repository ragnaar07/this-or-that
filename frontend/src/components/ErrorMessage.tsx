interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <div className="error-msg" role="alert" aria-live="polite">
      {message}
    </div>
  );
}
