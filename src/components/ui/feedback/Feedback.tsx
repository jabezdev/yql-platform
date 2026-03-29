/**
 * Feedback — Spinner, Skeleton
 *
 * All animations use `motion-safe:` prefix to respect
 * `prefers-reduced-motion`.
 *
 * Import via: import { Spinner, Skeleton } from '@/design'
 */

// ── Spinner ────────────────────────────────────────────────────

const SPINNER_SIZE = {
    sm: 'w-4 h-4 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
} as const;

interface SpinnerProps {
    size?: keyof typeof SPINNER_SIZE;
    dark?: boolean;
    /** Optional visible label rendered below the spinner. */
    label?: string;
    className?: string;
}

/**
 * Branded spinner. Use for user-triggered actions (saving, submitting), not
 * initial page load — use a Skeleton for that instead.
 *
 * ```tsx
 * // Full-page workspace
 * <Spinner size="md" label="Loading…" />
 *
 * // Inline / button feedback
 * <Spinner size="sm" />
 * ```
 */
export function Spinner({ size = 'md', dark = false, label, className = '' }: SpinnerProps) {
    const track = dark ? 'border-white/15 border-t-white' : 'border-brand-blue/15 border-t-brand-blue';
    const showLabel = label && size !== 'sm';

    return (
        <div className={`flex flex-col items-center gap-3 ${className}`} role="status" aria-label={label ?? 'Loading'}>
            <div className={`${SPINNER_SIZE[size]} ${track} rounded-full motion-safe:animate-spin`} aria-hidden="true" />
            {showLabel && (
                <p className={`text-xs font-extrabold uppercase tracking-widest ${dark ? 'text-white/50' : 'text-brand-blue/65'}`}>
                    {label}
                </p>
            )}
        </div>
    );
}

// ── Skeleton ────────────────────────────────────────────────────

interface SkeletonLineProps {
    dark?: boolean;
    /** Controls fractional width class, e.g. "3/4", "full", "2/3". */
    width?: string;
}

function SkeletonLine({ dark = false, width = 'full' }: SkeletonLineProps) {
    return (
        <div
            className={`h-4 w-${width} rounded motion-safe:animate-pulse ${dark ? 'bg-white/10' : 'bg-brand-blue/10'}`}
        />
    );
}

interface SkeletonProps {
    /**
     * - `line`  — 3–5 text lines (use `lines` prop to control count)
     * - `block` — square placeholder block (icon/avatar/image)
     * - `card`  — header banner + 3 text lines
     * - `list`  — 3 avatar + text rows
     */
    variant?: 'line' | 'block' | 'card' | 'list';
    /** Number of lines (only used for `line` variant). Default 4. */
    lines?: number;
    dark?: boolean;
    className?: string;
}

/**
 * Pulsing content placeholder. Shaped to match the incoming layout.
 * Use for **initial page load only** — use `<Spinner>` for user actions.
 *
 * ```tsx
 * <Skeleton variant="card" />
 * <Skeleton variant="list" dark />
 * <Skeleton variant="line" lines={3} />
 * ```
 */
export function Skeleton({ variant = 'line', lines = 4, dark = false, className = '' }: SkeletonProps) {
    const pulse = dark ? 'bg-white/10' : 'bg-brand-blue/10';
    const pulseFaint = dark ? 'bg-white/8' : 'bg-brand-blue/8';
    const border = dark ? 'border-white/10' : 'border-brand-blue/8';

    if (variant === 'block') {
        return (
            <div className={`w-10 h-10 rounded-tl-lg rounded-br-lg ${pulse} motion-safe:animate-pulse ${className}`} aria-hidden="true" />
        );
    }

    if (variant === 'card') {
        return (
            <div className={`rounded-tl-xl rounded-br-xl border-2 ${border} overflow-hidden ${className}`} aria-hidden="true">
                <div className={`h-20 ${pulse} motion-safe:animate-pulse`} />
                <div className="p-3 space-y-2">
                    <div className={`h-3 w-2/3 rounded ${pulse} motion-safe:animate-pulse`} />
                    <div className={`h-3 w-full rounded ${pulseFaint} motion-safe:animate-pulse`} />
                    <div className={`h-3 w-4/5 rounded ${pulseFaint} motion-safe:animate-pulse`} />
                </div>
            </div>
        );
    }

    if (variant === 'list') {
        return (
            <div className={`space-y-3 ${className}`} aria-hidden="true">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`flex items-center gap-2.5 py-2 border-b ${border} last:border-0`}>
                        <div className={`w-8 h-8 rounded-tl-lg rounded-br-lg ${pulse} flex-shrink-0 motion-safe:animate-pulse`} />
                        <div className="flex-1 space-y-1.5">
                            <div className={`h-3 w-3/4 rounded ${pulse} motion-safe:animate-pulse`} />
                            <div className={`h-2.5 w-1/2 rounded ${pulseFaint} motion-safe:animate-pulse`} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // line (default)
    const widths = ['3/4', 'full', '5/6', '2/3', 'full', '4/5'];
    return (
        <div className={`space-y-2.5 ${className}`} aria-hidden="true">
            {[...Array(Math.min(lines, 6))].map((_, i) => (
                <SkeletonLine key={i} dark={dark} width={widths[i % widths.length]} />
            ))}
        </div>
    );
}

export type { SpinnerProps, SkeletonProps };
