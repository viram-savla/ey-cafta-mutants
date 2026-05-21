import { Badge } from '../ui/badge';

export function RAGBadge({ status, size = 'sm' }) {
  const label = status === 'green' ? 'GREEN' : status === 'amber' ? 'AMBER' : 'RED';
  return (
    <Badge variant={status} className={size === 'md' ? 'text-sm px-3 py-1' : ''}>
      {label}
    </Badge>
  );
}
