export function Icon({ name, size, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  return (
    <span className="ms" style={{ fontSize: size ?? 20, ...style }}>
      {name}
    </span>
  );
}

export function Waveform({ color = '#4f6b52', bars = 14, height = 34 }: { color?: string; bars?: number; height?: number }) {
  return (
    <span className="wave" style={{ height }}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          style={{
            height,
            background: color,
            animationDelay: `${(i % 7) * 0.09}s`,
          }}
        />
      ))}
    </span>
  );
}
