/**
 * DataDisplay — ProgressBar, StepIndicator, TrendBadge
 *
 * Import via: import { ProgressBar, StepIndicator, TrendBadge } from '@/design'
 */

import { Check } from 'lucide-react';

// ── ProgressBar ────────────────────────────────────────────────

export type ProgressColor = 'blue' | 'green' | 'yellow' | 'wine' | 'lightBlue' | 'white';

const PROGRESS_FILL: Record<ProgressColor, string> = {
    blue:      'bg-brand-blue',
    green:     'bg-brand-green',
    yellow:    'bg-brand-yellow',
    wine:      'bg-brand-wine',
    lightBlue: 'bg-brand-lightBlue',
    white:     'bg-white/50',
};

interface ProgressBarProps {
    /** 0–max (default max = 100). */
    value: number;
    max?: number;
    label?: string;
    color?: ProgressColor;
    dark?: boolean;
    className?: string;
}

export function ProgressBar({ value, max = 100, label, color = 'lightBlue', dark = false, className = '' }: ProgressBarProps) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    const fill = PROGRESS_FILL[color];

    return (
        <div className={className}>
            {label && (
                <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-medium ${dark ? 'text-white/70' : 'text-brand-blue/75'}`}>{label}</span>
                    <span className={`text-xs font-mono font-bold ${dark ? 'text-white/45' : 'text-brand-blue/55'}`}>{Math.round(pct)}%</span>
                </div>
            )}
            <div
                className={`w-full h-2.5 rounded-tl-sm rounded-br-sm overflow-hidden border ${dark ? 'bg-white/10 border-white/10' : 'bg-brand-bgLight border-brand-blue/8'}`}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={label}
            >
                <div
                    className={`h-full rounded-tl-sm rounded-br-sm transition-[width] duration-500 ${fill}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

// ── StepIndicator ──────────────────────────────────────────────

interface StepIndicatorProps {
    steps: string[];
    /** 0-indexed. */
    current: number;
    dark?: boolean;
    className?: string;
}

export function StepIndicator({ steps, current, dark = false, className = '' }: StepIndicatorProps) {
    return (
        <div className={`flex items-center gap-0 ${className}`}>
            {steps.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                        <div className={[
                            'w-7 h-7 rounded-tl-lg rounded-br-lg border-2 flex items-center justify-center text-[10px] font-extrabold',
                            i < current
                                ? 'bg-brand-blue border-brand-blue text-white'
                                : i === current
                                ? 'bg-brand-yellow border-brand-blue text-brand-blue'
                                : dark
                                ? 'bg-white/10 border-white/20 text-white/30'
                                : 'bg-white border-brand-blue/20 text-brand-blue/30',
                        ].join(' ')}>
                            {i < current ? <Check size={12} aria-hidden="true" /> : i + 1}
                        </div>
                        <p className={`text-[10px] font-medium whitespace-nowrap ${
                            i <= current
                                ? dark ? 'text-white' : 'text-brand-blue'
                                : dark ? 'text-white/35' : 'text-brand-blue/35'
                        }`}>{step}</p>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < current ? 'bg-brand-blue' : dark ? 'bg-white/15' : 'bg-brand-blue/15'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ── TrendBadge ─────────────────────────────────────────────────

interface TrendBadgeProps {
    direction: 'up' | 'down' | 'flat';
    /** Display string, e.g. "+12%" or "−5%". */
    value: string;
    dark?: boolean;
    className?: string;
}

const TREND_CLS = {
    light: {
        up:   'bg-brand-green/10  text-brand-green border-brand-green/30',
        down: 'bg-brand-red/10    text-brand-red   border-brand-red/30',
        flat: 'bg-brand-bgLight   text-brand-blue/65 border-brand-blue/15',
    },
    dark: {
        up:   'bg-brand-green/25  text-brand-green border-brand-green/55',
        down: 'bg-brand-red/25    text-brand-red   border-brand-red/55',
        flat: 'bg-white/10        text-white/65    border-white/25',
    },
};

const TREND_ARROW = { up: '↑', down: '↓', flat: '→' } as const;

export function TrendBadge({ direction, value, dark = false, className = '' }: TrendBadgeProps) {
    const cls = dark ? TREND_CLS.dark[direction] : TREND_CLS.light[direction];
    return (
        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${cls} ${className}`}>
            {TREND_ARROW[direction]} {value}
        </span>
    );
}

export type { ProgressBarProps, StepIndicatorProps, TrendBadgeProps };
