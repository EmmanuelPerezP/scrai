export function SourceBadge({ source }: { source: string }) {
  return <span className={`badge ${source}`}>{source}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${status}`}>{status}</span>;
}
