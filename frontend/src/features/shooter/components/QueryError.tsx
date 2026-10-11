export function QueryError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="shooter-notice" role="alert">
      <p>{message}</p>
      <button type="button" onClick={onRetry}>Reintentar</button>
    </div>
  );
}
