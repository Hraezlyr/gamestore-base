import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  loading: boolean;
  hasNext: boolean;
  onChange: (page: number) => void;
}

export function Pagination({ page, loading, hasNext, onChange }: PaginationProps) {
  return (
    <nav className="shooter-pagination" aria-label="Páginas de juegos">
      <button type="button" disabled={loading || page === 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} aria-hidden="true" /> Anterior</button>
      <span>Página {page}</span>
      <button type="button" disabled={loading || !hasNext} onClick={() => onChange(page + 1)}>Siguiente <ChevronRight size={16} aria-hidden="true" /></button>
    </nav>
  );
}
