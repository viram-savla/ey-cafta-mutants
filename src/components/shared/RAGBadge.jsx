const META = {
  green: { label: 'GREEN', dot: 'var(--green)' },
  amber: { label: 'AMBER', dot: 'var(--amber)' },
  red:   { label: 'RED',   dot: 'var(--red)' },
};

export function RAGBadge({ status, size = 'sm' }) {
  const m = META[status] || META.green;
  const padding = size === 'md' ? '4px 10px' : '3px 8px';
  const fontSize = size === 'md' ? 11 : 10;

  return (
    <span
      className={`rag-pill rag-${status}`}
      style={{ padding, fontSize }}
    >
      <span
        className="rounded-full"
        style={{ width: 5, height: 5, background: m.dot, boxShadow: `0 0 6px ${m.dot}` }}
      />
      {m.label}
    </span>
  );
}
