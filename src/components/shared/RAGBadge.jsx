export function RAGBadge({ status, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const label = status === 'green' ? 'GREEN' : status === 'amber' ? 'AMBER' : 'RED';
  return (
    <span className={`inline-flex items-center rounded-full font-mono font-semibold ${sizeClass} rag-${status}`}>
      {label}
    </span>
  );
}
