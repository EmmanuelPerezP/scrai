export function Icon({
  name,
  size,
  style,
  className,
}: {
  name: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <span className={className ? `ms ${className}` : 'ms'} style={{ fontSize: size ?? 20, ...style }}>
      {name}
    </span>
  );
}

export function Waveform({
  color = '#4f6b52',
  bars = 14,
  height = 34,
}: {
  color?: string;
  bars?: number;
  height?: number;
}) {
  return (
    <span className="inline-flex items-end gap-[3px]" style={{ height }}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-[3px] rounded-[3px] animate-wave"
          style={{ height, background: color, animationDelay: `${(i % 7) * 0.09}s` }}
        />
      ))}
    </span>
  );
}
