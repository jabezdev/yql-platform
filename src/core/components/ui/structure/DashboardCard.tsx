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
    const baseCls = dark
        ? 'rounded-tl-2xl rounded-br-2xl overflow-hidden border transition-all duration-200 bg-white/8 border-white/15'
        : 'bg-white rounded-tl-2xl rounded-br-2xl overflow-hidden border-2 border-brand-blue transition-all duration-200';

    const variantCls = dark ? {
        default: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] hover:bg-white/12 hover:-translate-y-[2px] hover:-translate-x-[2px]',
        stat:    'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:bg-white/12 hover:-translate-y-[2px] hover:-translate-x-[2px]',
        glass:   'bg-white/12 backdrop-blur-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-[2px] hover:-translate-x-[2px]',
        static:  'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]',
    } : {
        default: 'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] hover:-translate-y-[2px] hover:-translate-x-[2px]',
        stat:    'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] hover:-translate-y-[2px] hover:-translate-x-[2px]',
        glass:   'bg-white/90 backdrop-blur-sm shadow-[4px_4px_0px_0px_rgba(57,103,153,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.2)] hover:-translate-y-[2px] hover:-translate-x-[2px]',
        static:  'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.12)]',
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
        bg:      'bg-brand-lightBlue/10',
        icon:    'text-brand-lightBlue',
        accent:  'text-brand-blue',
        bgDark:  'bg-brand-lightBlue/15 border border-brand-lightBlue/25',
        iconDark:'text-brand-lightBlue',
    },
    yellow: {
        bg:      'bg-brand-yellow/20',
        icon:    'text-brand-blue',
        accent:  'text-brand-blue',
        bgDark:  'bg-brand-yellow/15 border border-brand-yellow/25',
        iconDark:'text-brand-yellow',
    },
    wine: {
        bg:      'bg-brand-wine/10',
        icon:    'text-brand-wine',
        accent:  'text-brand-wine',
        bgDark:  'bg-brand-wine/15 border border-brand-wine/25',
        iconDark:'text-brand-wine',
    },
    gray: {
        bg:      'bg-brand-gray/10',
        icon:    'text-brand-gray',
        accent:  'text-brand-blue/60',
        bgDark:  'bg-white/10 border border-white/20',
        iconDark:'text-white/55',
    },
    green: {
        bg:      'bg-brand-green/10',
        icon:    'text-brand-green',
        accent:  'text-brand-green',
        bgDark:  'bg-brand-green/15 border border-brand-green/25',
        iconDark:'text-brand-green',
    },
};

function InternalTrendBadge({ trend, dark = false }: { trend: NonNullable<InfoCardProps['trend']>; dark?: boolean }) {
    const cls = dark ? {
        up:   'bg-brand-green/20 text-brand-green border-brand-green/45',
        down: 'bg-brand-wine/20 text-brand-wine border-brand-wine/45',
        neutral: 'bg-white/10 text-white/65 border-white/25',
    } : {
        up:   'bg-brand-green/10 text-brand-green border-brand-green/30',
        down: 'bg-brand-wine/10 text-brand-wine border-brand-wine/30',
        neutral: 'bg-brand-bgLight text-brand-blue/50 border-brand-blue/15',
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
    const topRight = badge ?? (trend ? <InternalTrendBadge trend={trend} dark={dark} /> : null);

    const cardCls = dark
        ? 'bg-white/8 rounded-tl-2xl rounded-br-2xl overflow-hidden border border-white/12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] p-4 transition-transform hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)]'
        : 'bg-white rounded-tl-2xl rounded-br-2xl overflow-hidden border-2 border-brand-blue shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)] p-4 transition-transform hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)]';
    const iconContainerCls = `p-2 rounded-tl-lg rounded-br-lg shrink-0 ${dark ? styles.bgDark : styles.bg}`;
    const iconCls = dark ? styles.iconDark : styles.icon;
    const valueCls = dark ? 'text-white' : styles.accent;
    const descCls = dark ? 'text-white/65' : 'text-brand-blue/70';
    const labelCls = dark ? 'text-white/40' : 'text-brand-blue/40';

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
                    <p className={`text-2xl font-display font-extrabold leading-none ${valueCls}`}>{value}</p>
                ) : description !== undefined ? (
                    <p className={`text-sm leading-snug ${descCls}`}>{description}</p>
                ) : children ? (
                    <div className={`text-sm ${descCls}`}>{children}</div>
                ) : null}
                <p className={`text-[10px] font-extrabold uppercase tracking-widest ${labelCls} mt-1.5`}>{label}</p>
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
