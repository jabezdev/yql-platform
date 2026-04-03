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
    /**
     * When `true`, renders on a dark surface:
     * `bg-white/8 border-white/15`; hover uses a black-based shadow.
     */
    dark?: boolean;
}

export function DashboardCard({
    children,
    className = '',
    variant = 'default',
    noPadding = false,
    dark = false,
}: DashboardCardProps) {
    const baseCls = `rounded-tl-2xl rounded-br-2xl overflow-hidden border transition-all duration-200 
        ${dark ? 'bg-[#0d1825] border-white/15' : 'bg-white border-2 border-brand-blue dark:bg-[#0d1825] dark:border-white/15'}`;

    const variantCls: Record<CardVariant, string> = {
        default: `shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] hover:-translate-y-[2px] hover:-translate-x-[2px]
            dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] dark:hover:bg-white/12`,
        stat:    `shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] hover:-translate-y-[2px] hover:-translate-x-[2px]
            dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] dark:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:hover:bg-white/12`,
        glass:   `bg-white/90 backdrop-blur-sm shadow-[4px_4px_0px_0px_rgba(57,103,153,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.2)] hover:-translate-y-[2px] hover:-translate-x-[2px]
            dark:bg-white/12 dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] dark:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]`,
        static:  `shadow-[4px_4px_0px_0px_rgba(57,103,153,0.12)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]`,
    };

    const paddingStyles = noPadding ? '' : 'p-6';

    return (
        <div className={`${baseCls} ${variantCls[variant]} ${paddingStyles} ${className}`}>
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
    /**
     * When `true`, renders on a dark surface:
     * `bg-white/8 border-white/12`; icon bg at `/15+/25`; value `text-white`.
     */
    dark?: boolean;
    className?: string;
}

const colorStyles = {
    blue: {
        bg:      'bg-brand-lightBlue/10 dark:bg-brand-lightBlue/15 dark:border dark:border-brand-lightBlue/25',
        icon:    'text-brand-lightBlue',
        accent:  'text-brand-blue dark:text-brand-lightBlue',
    },
    yellow: {
        bg:      'bg-brand-yellow/20 dark:bg-brand-yellow/15 dark:border dark:border-brand-yellow/25',
        icon:    'text-brand-blue dark:text-brand-yellow',
        accent:  'text-brand-blue dark:text-brand-yellow',
    },
    wine: {
        bg:      'bg-brand-wine/10 dark:bg-brand-wine/15 dark:border dark:border-brand-wine/25',
        icon:    'text-brand-wine',
        accent:  'text-brand-wine',
    },
    gray: {
        bg:      'bg-brand-gray/10 dark:bg-white/10 dark:border dark:border-white/20',
        icon:    'text-brand-gray dark:text-white/55',
        accent:  'text-brand-blue/60 dark:text-brand-lightBlue',
    },
    green: {
        bg:      'bg-brand-green/10 dark:bg-brand-green/15 dark:border dark:border-brand-green/25',
        icon:    'text-brand-green',
        accent:  'text-brand-green',
    },
};

function InternalTrendBadge({ trend }: { trend: NonNullable<InfoCardProps['trend']> }) {
    const cls = {
        up:   'bg-brand-green/10 text-brand-green border-brand-green/30 dark:bg-brand-green/20 dark:border-brand-green/45',
        down: 'bg-brand-wine/10 text-brand-wine border-brand-wine/30 dark:bg-brand-wine/20 dark:border-brand-wine/45',
        neutral: 'bg-brand-bgLight text-brand-blue/50 border-brand-blue/15 dark:bg-white/10 dark:text-white/65 dark:border-white/25',
    };
    const dirCls = cls[trend.direction];
    return (
        <div className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${dirCls}`}>
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
    dark = false,
    className = '',
}: InfoCardProps) {
    const styles = colorStyles[color];
    const topRight = badge ?? (trend ? <InternalTrendBadge trend={trend} /> : null);

    const cardCls = `rounded-tl-2xl rounded-br-2xl overflow-hidden border transition-transform p-4 
        ${dark ? 'bg-[#0d1825] border-white/12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)]' 
               : 'bg-white border-2 border-brand-blue shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] \
                 dark:bg-[#0d1825] dark:border dark:border-white/12 dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)]'}
        hover:-translate-y-[2px] hover:-translate-x-[2px]`;

    const iconContainerCls = `p-2 rounded-tl-lg rounded-br-lg shrink-0 ${styles.bg}`;
    const iconCls = `${styles.icon}`;
    const valueCls = `text-2xl font-display font-extrabold leading-none ${styles.accent}`;
    const descCls = `text-sm leading-snug text-brand-blue/70 dark:text-white/65`;
    const labelCls = `text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/40 dark:text-white/40 mt-1.5`;

    return (
        <div className={`${cardCls} ${className}`}>
            <div className="flex items-start justify-between gap-2">
                <div className={iconContainerCls}>
                    <Icon size={20} className={iconCls} aria-hidden="true" />
                </div>
                {topRight && <div className="mt-0.5">{topRight}</div>}
            </div>
            <div className="mt-3">
                {value !== undefined ? (
                    <p className={valueCls}>{value}</p>
                ) : description !== undefined ? (
                    <p className={descCls}>{description}</p>
                ) : children ? (
                    <div className={`text-sm ${descCls}`}>{children}</div>
                ) : null}
                <p className={labelCls}>{label}</p>
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
        <div className={`flex items-center justify-between mb-4 border-b-2 border-brand-blue/15 dark:border-white/10 pb-2 ${className}`}>
            <h3 className="text-xl font-bold text-brand-blue dark:text-brand-lightBlue font-display">{children}</h3>
            {action && <div>{action}</div>}
        </div>
    );
}

