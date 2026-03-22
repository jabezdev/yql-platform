import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

// ============================================
// Dashboard Card Component
// ============================================

type CardVariant = 'default' | 'stat' | 'glass' | 'static';

interface DashboardCardProps {
    children: ReactNode;
    className?: string;
    variant?: CardVariant;
    noPadding?: boolean;
}

export function DashboardCard({
    children,
    className = '',
    variant = 'default',
    noPadding = false,
}: DashboardCardProps) {
    const baseStyles = 'bg-white rounded-tl-2xl rounded-br-2xl overflow-hidden border-2 border-brand-blue transition-all duration-200';
    const variantStyles = {
        default: 'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] hover:-translate-y-[2px] hover:-translate-x-[2px]',
        stat: 'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] hover:-translate-y-[2px] hover:-translate-x-[2px]',
        glass: 'bg-white/90 backdrop-blur-sm shadow-[4px_4px_0px_0px_rgba(57,103,153,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.2)] hover:-translate-y-[2px] hover:-translate-x-[2px]',
        static: 'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.12)]',
    };
    const paddingStyles = noPadding ? '' : 'p-6';

    return (
        <div className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles} ${className}`}>
            {children}
        </div>
    );
}

// ============================================
// Info Card Component (formerly StatCard)
// Works for stats, status, or any short highlight.
// ============================================

interface InfoCardProps {
    icon: LucideIcon;
    label: string;
    /** Big numeric or short text value — shows in large type. Omit to use description or children. */
    value?: ReactNode;
    /** Paragraph-style body for non-numeric content. Shown when value is absent. */
    description?: ReactNode;
    /** Fully custom body. Shown when both value and description are absent. */
    children?: ReactNode;
    trend?: {
        direction: 'up' | 'down' | 'neutral';
        value: string;
    };
    /** Slot for a custom badge/tag in the top-right, overrides trend. */
    badge?: ReactNode;
    color?: 'blue' | 'yellow' | 'wine' | 'gray' | 'green';
    className?: string;
}

const colorStyles = {
    blue: {
        bg: 'bg-brand-lightBlue/10',
        icon: 'text-brand-lightBlue',
        accent: 'text-brand-blue',
    },
    yellow: {
        bg: 'bg-brand-yellow/20',
        icon: 'text-brand-blue',
        accent: 'text-brand-blue',
    },
    wine: {
        bg: 'bg-brand-wine/10',
        icon: 'text-brand-wine',
        accent: 'text-brand-wine',
    },
    gray: {
        bg: 'bg-brand-gray/10',
        icon: 'text-brand-gray',
        accent: 'text-brand-blue/60',
    },
    green: {
        bg: 'bg-brand-green/10',
        icon: 'text-brand-green',
        accent: 'text-brand-green',
    },
};

function TrendBadge({ trend }: { trend: NonNullable<InfoCardProps['trend']> }) {
    return (
        <div className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
            trend.direction === 'up'
                ? 'bg-brand-green/10 text-brand-green border-brand-green/30'
                : trend.direction === 'down'
                    ? 'bg-brand-wine/10 text-brand-wine border-brand-wine/30'
                    : 'bg-brand-bgLight text-brand-blue/50 border-brand-blue/15'
        }`}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
        </div>
    );
}

export function InfoCard({
    icon: Icon,
    label,
    value,
    description,
    children,
    trend,
    badge,
    color = 'blue',
    className = '',
}: InfoCardProps) {
    const styles = colorStyles[color];
    const topRight = badge ?? (trend ? <TrendBadge trend={trend} /> : null);

    return (
        <div className={`bg-white rounded-tl-2xl rounded-br-2xl overflow-hidden border-2 border-brand-blue shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)] p-4 transition-transform hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] ${className}`}>
            <div className="flex items-start justify-between gap-2">
                <div className={`p-2 rounded-tl-lg rounded-br-lg shrink-0 ${styles.bg}`}>
                    <Icon size={20} className={styles.icon} />
                </div>
                {topRight && <div className="mt-0.5">{topRight}</div>}
            </div>
            <div className="mt-3">
                {value !== undefined ? (
                    <p className={`text-2xl font-display font-extrabold leading-none ${styles.accent}`}>{value}</p>
                ) : description !== undefined ? (
                    <p className="text-sm text-brand-blue/70 leading-snug">{description}</p>
                ) : children ? (
                    <div className="text-sm text-brand-blue/70">{children}</div>
                ) : null}
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/40 mt-1.5">{label}</p>
            </div>
        </div>
    );
}

/** @deprecated Use InfoCard instead. Kept for backward-compat — maps 1:1 to InfoCard. */
export function StatCard(props: InfoCardProps) {
    return <InfoCard {...props} />;
}

// ============================================
// Dashboard Section Title
// ============================================

interface SectionTitleProps {
    children: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function DashboardSectionTitle({ children, action, className = '' }: SectionTitleProps) {
    return (
        <div className={`flex items-center justify-between mb-4 border-b-2 border-brand-blue/15 pb-2 ${className}`}>
            <h3 className="text-xl font-bold text-brand-blue font-display">{children}</h3>
            {action && <div>{action}</div>}
        </div>
    );
}
