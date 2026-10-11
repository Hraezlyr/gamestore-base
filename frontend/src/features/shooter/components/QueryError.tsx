import { RefreshCw } from "lucide-react";

export function QueryError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="shooter-notice" role="alert">
      <p>{message}</p>
      <button type="button" onClick={onRetry}><RefreshCw size={16} aria-hidden="true" /> Reintentar</button>
    </div>
  );
}
