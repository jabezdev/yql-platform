import { type ReactNode } from 'react';

// ============================================
// Page Header Component
// ============================================

type HeaderVariant = 'card' | 'ghost';
type HeaderSize = 'sm' | 'lg';

interface PageHeaderProps {
    title: string;
    /** Optional small label rendered above the title — e.g. "Cohort 2 · Admin". */
    eyebrow?: string;
    subtitle?: string;
    action?: ReactNode;
    variant?: HeaderVariant;
    size?: HeaderSize;
    /**
     * When `true`, renders the header on a dark surface.
     * Card: `bg-white/8 border-white/15`. Ghost: `border-b border-white/10`.
     * Title becomes `text-white`; subtitle `text-white/60`.
     */
    dark?: boolean;
    className?: string;
}

export function PageHeader({
    title,
    eyebrow,
    subtitle,
    action,
    variant = 'card',
    size = 'lg',
    dark = false,
    className = '',
}: PageHeaderProps) {
    const isCard = variant === 'card';
    const isLarge = size === 'lg';

    let containerStyles: string;
    if (isCard) {
        containerStyles = dark
            ? `bg-white/8 border-2 border-white/15 rounded-tl-2xl rounded-br-2xl px-5 py-5 flex flex-col justify-between ${isLarge ? 'min-h-[130px]' : 'min-h-[96px]'}`
            : `bg-white border-2 border-brand-blue shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl p-6 sm:p-8 flex flex-col justify-center ${isLarge ? 'min-h-[130px]' : 'min-h-[96px]'}`;
    } else {
        containerStyles = dark ? 'pb-4 border-b-2 border-white/10' : 'py-2';
    }

    const eyebrowCls = dark ? 'text-white/45 mb-1' : 'text-brand-blue/45 mb-1.5';
    const titleStyles = isLarge
        ? `text-4xl sm:text-5xl font-extrabold font-display leading-tight ${dark ? 'text-white' : 'text-brand-blue'}`
        : `text-2xl md:text-3xl font-display font-extrabold ${dark ? 'text-white' : 'text-brand-blue'}`;
    const subStyles = isLarge
        ? `mt-2 font-medium text-lg ${dark ? 'text-white/60' : 'text-brand-darkBlue/70'}`
        : `mt-1 font-medium ${dark ? 'text-white/55' : 'text-brand-darkBlue/70'}`;

    return (
        <div className={`${containerStyles} ${className}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col">
                    {eyebrow && (
                        <p className={`text-[10px] font-extrabold uppercase tracking-widest ${eyebrowCls}`}>
                            {eyebrow}
                        </p>
                    )}
                    <h1 className={titleStyles}>{title}</h1>
                    {subtitle && <p className={subStyles}>{subtitle}</p>}
                </div>
                {action && (
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// Page Wrapper
// ============================================

interface DashboardPageProps {
    children: ReactNode;
    className?: string;
}

export function DashboardPage({
    children,
    className = '',
}: DashboardPageProps) {
    return (
        <div className={`min-h-full ${className}`}>
            {children}
        </div>
    );
}

// ============================================
// Status Badge Component
// ============================================

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
    status: string;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    /**
     * When `true`, applies dark-surface badge colours:
     * fill at `/25`, border at `/55`. Pending (warning) text flips to `text-brand-yellow`.
     */
    dark?: boolean;
}

const badgeStyles: Record<BadgeVariant, string> = {
    success: 'bg-brand-green/10 text-brand-green border-brand-green/30',
    warning: 'bg-brand-yellow/20 text-brand-blue border-brand-yellow/40',
    error: 'bg-brand-red/10 text-brand-red border-brand-red/30',
    info: 'bg-brand-lightBlue/10 text-brand-lightBlue border-brand-lightBlue/30',
    neutral: 'bg-brand-bgLight text-brand-blue/60 border-brand-blue/15',
};

const badgeStylesDark: Record<BadgeVariant, string> = {
    success: 'bg-brand-green/25 text-brand-green border-brand-green/55',
    warning: 'bg-brand-yellow/20 text-brand-yellow border-brand-yellow/50',
    error:   'bg-brand-red/25 text-brand-red border-brand-red/55',
    info:    'bg-brand-lightBlue/20 text-brand-lightBlue border-brand-lightBlue/45',
    neutral: 'bg-white/10 text-white/65 border-white/25',
};

export function StatusBadge({ status, variant = 'neutral', size = 'sm', dark = false }: StatusBadgeProps) {
    const sizeStyles = size === 'sm'
        ? 'px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest'
        : 'px-3 py-1 text-xs font-bold uppercase tracking-wider';
    const colorStyles = dark ? badgeStylesDark[variant] : badgeStyles[variant];

    return (
        <span className={`inline-flex items-center gap-1 rounded-sm border ${colorStyles} ${sizeStyles}`}>
            {status}
        </span>
    );
}

// ============================================
// Empty State Component
// ============================================

interface EmptyStateProps {
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    description?: string;
    action?: ReactNode;
    /**
     * When `true`, renders on a dark surface:
     * icon container `bg-white/10 border-white/20`, title `text-white`, body `text-white/50`,
     * action button `bg-white/10 border-white/20`.
     */
    dark?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, dark = false }: EmptyStateProps) {
    const iconContainerCls = dark
        ? 'bg-white/10 border-2 border-white/20 rounded-tl-xl rounded-br-xl'
        : 'bg-brand-yellow/20 border-2 border-brand-blue/15 rounded-tl-2xl rounded-br-2xl';
    const iconCls = dark ? 'text-white/50' : 'text-brand-blue/50';
    const titleCls = dark ? 'text-white' : 'text-brand-blue';
    const descCls = dark ? 'text-white/50' : 'text-brand-blue/50';

    return (
        <div className="text-center py-12 px-6">
            {Icon && (
                <div className={`w-10 h-10 ${iconContainerCls} flex items-center justify-center mx-auto mb-3`}>
                    <Icon size={20} className={iconCls} aria-hidden="true" />
                </div>
            )}
            <h3 className={`text-sm font-display font-extrabold ${titleCls} mb-1`}>{title}</h3>
            {description && (
                <p className={`text-xs font-medium ${descCls} max-w-[180px] mx-auto leading-relaxed`}>{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
