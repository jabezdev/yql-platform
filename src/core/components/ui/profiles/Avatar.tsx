import { type ReactNode } from 'react';

// ── Colour palette (deterministic by name) ─────────────────────
const PALETTE = [
    { bg: 'bg-brand-blue',    text: 'text-white' },
    { bg: 'bg-[#6554c0]',     text: 'text-white' },
    { bg: 'bg-brand-green',   text: 'text-white' },
    { bg: 'bg-brand-wine',    text: 'text-white' },
    { bg: 'bg-[#d97706]',     text: 'text-white' },
] as const;

function paletteFor(name: string) {
    return PALETTE[name.charCodeAt(0) % PALETTE.length];
}

// ── Sizes ──────────────────────────────────────────────────────
const SIZE_MAP = {
    xs: 'w-6  h-6  text-[9px]',
    sm: 'w-8  h-8  text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-2xl',
} as const;

type AvatarSize = keyof typeof SIZE_MAP;

// ── Avatar ─────────────────────────────────────────────────────

interface AvatarProps {
    /** Full name — used for initials and palette selection. */
    name: string;
    /** Remote image URL; falls back to initials when absent. */
    photoUrl?: string;
    size?: AvatarSize;
    /**
     * When true, adds a 3 px white ring around the avatar — used when
     * overlapping a coloured banner or another avatar.
     */
    border?: boolean;
    className?: string;
}

export function Avatar({
    name,
    photoUrl,
    size = 'md',
    border = false,
    className = '',
}: AvatarProps) {
    const { bg, text } = paletteFor(name);
    const ring = border ? 'ring-[3px] ring-white shadow-sm' : '';

    return (
        <div
            className={[
                'rounded-full flex items-center justify-center font-extrabold font-display flex-shrink-0 select-none',
                SIZE_MAP[size],
                bg,
                text,
                ring,
                className,
            ].join(' ')}
        >
            {photoUrl ? (
                <img
                    src={photoUrl}
                    alt={name}
                    className="w-full h-full rounded-full object-cover"
                />
            ) : (
                name.charAt(0).toUpperCase()
            )}
        </div>
    );
}

// ── AvatarStack ────────────────────────────────────────────────

interface AvatarStackProps {
    /** Array of name strings (and optionally photoUrls). */
    people: { name: string; photoUrl?: string }[];
    /** Maximum avatars to show before the "+N" chip. */
    max?: number;
    size?: Extract<AvatarSize, 'xs' | 'sm' | 'md'>;
    className?: string;
}

export function AvatarStack({
    people,
    max = 4,
    size = 'sm',
    className = '',
}: AvatarStackProps) {
    const shown  = people.slice(0, max);
    const hidden = people.length - shown.length;

    const sizeMap: Record<Extract<AvatarSize, 'xs' | 'sm' | 'md'>, string> = {
        xs: 'w-6 h-6 text-[9px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
    };

    return (
        <div className={`flex items-center ${className}`}>
            {shown.map((p, i) => (
                <div
                    key={p.name + i}
                    className={`-ml-${i === 0 ? '0' : '2'} ${i > 0 ? '-ml-2' : ''}`}
                    style={{ marginLeft: i === 0 ? 0 : '-0.5rem' }}
                >
                    <Avatar name={p.name} photoUrl={p.photoUrl} size={size} border />
                </div>
            ))}
            {hidden > 0 && (
                <div
                    className={`flex items-center justify-center rounded-full bg-brand-bgLight border-2 border-white ring-[3px] ring-white text-brand-blue/70 font-extrabold font-display flex-shrink-0 -ml-2 ${sizeMap[size]}`}
                    style={{ marginLeft: '-0.5rem' }}
                >
                    +{hidden}
                </div>
            )}
        </div>
    );
}

// ── ChipFallback (exported for profile pages) ──────────────────
// The branded gradient banner used when no chip image has been uploaded.

interface ChipFallbackProps {
    name: string;
    role: string;
}

export function ChipFallback({ name, role }: ChipFallbackProps) {
    const initial = name.charAt(0).toUpperCase();
    return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#172b4d] via-brand-blue to-[#1e4a7a] overflow-hidden">
            {/* dot grid */}
            <div
                className="absolute inset-0 opacity-[0.08]"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}
            />
            {/* diagonal stripe accent */}
            <div
                className="absolute -right-8 -top-8 w-40 h-40 opacity-[0.06] bg-brand-yellow"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
            />
            {/* watermark initial */}
            <span className="absolute right-3 bottom-0 text-[72px] font-extrabold text-white/[0.07] leading-none select-none font-display">
                {initial}
            </span>
            {/* role label */}
            <div className="absolute bottom-2.5 left-3">
                <span className="text-[8px] font-extrabold uppercase tracking-[0.22em] text-white/40">{role}</span>
            </div>
            {/* corner mark */}
            <div className="absolute top-2.5 left-3 w-4 h-4 bg-brand-yellow/70 rounded-tl-md rounded-br-md" />
        </div>
    );
}

// ── Convenience re-export of palette util for external use ─────
export { paletteFor as avatarPaletteFor };
export type { AvatarProps, AvatarStackProps, AvatarSize };

// Needed so JSX is valid in files that import this
declare const React: { createElement: unknown };
void (null as unknown as ReactNode);
