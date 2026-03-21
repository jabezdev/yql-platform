import { type ReactNode } from 'react';

// ============================================
// Page Header Component
// ============================================

type HeaderVariant = 'card' | 'ghost';
type HeaderSize = 'sm' | 'lg';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    variant?: HeaderVariant;
    size?: HeaderSize;
    className?: string;
}

export function PageHeader({
    title,
    subtitle,
    action,
    variant = 'card',
    size = 'lg',
    className = '',
}: PageHeaderProps) {
    const isCard = variant === 'card';
    const isLarge = size === 'lg';

    const containerStyles = isCard
        ? `bg-white border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl p-6 sm:p-8 flex flex-col justify-center ${isLarge ? 'min-h-[160px]' : 'min-h-[110px]'}`
        : 'py-2';

    const titleStyles = isLarge
        ? 'text-4xl sm:text-5xl font-extrabold font-display leading-tight text-brand-blueDark'
        : 'text-2xl md:text-3xl font-display font-extrabold text-brand-blueDark';

    const subStyles = isLarge
        ? 'text-brand-darkBlue/70 mt-2 font-medium text-lg'
        : 'text-brand-darkBlue/70 mt-1 font-medium';

    return (
        <div className={`${containerStyles} ${className} mb-8`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col">
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
}

const badgeStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-brand-blue border-blue-200',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function StatusBadge({ status, variant = 'neutral', size = 'sm' }: StatusBadgeProps) {
    const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${badgeStyles[variant]} ${sizeStyles}`}>
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
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="text-center py-12 px-6">
            {Icon && (
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon size={28} className="text-gray-400" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 max-w-sm mx-auto">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
