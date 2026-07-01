import { avatarTint, initials } from '@/lib/design';

/**
 * Patient avatar: initials on a deterministic tint derived from a stable seed
 * (patient id), so the same patient always gets the same colour.
 */
export function Avatar({
  seed,
  first,
  last,
  size = 34,
  fontSize,
}: {
  seed: string;
  first?: string;
  last?: string;
  size?: number;
  fontSize?: number;
}) {
  const tint = avatarTint(seed);
  return (
    <div
      className="flex-none rounded-full flex items-center justify-center font-sans font-semibold"
      style={{
        width: size,
        height: size,
        background: tint.bg,
        color: tint.fg,
        fontSize: fontSize ?? size * 0.37,
      }}
    >
      {initials(first, last)}
    </div>
  );
}
