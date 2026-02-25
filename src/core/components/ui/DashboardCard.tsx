import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

// ============================================
// Dashboard Card Component
// ============================================

type CardVariant = 'default' | 'stat' | 'glass';

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
    const baseStyles = 'bg-white rounded-tl-2xl rounded-br-2xl overflow-hidden border-2 border-brand-blueDark transition-all duration-200';
    const variantStyles = {
        default: 'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] hover:-translate-y-[2px] hover:-translate-x-[2px]',
        stat: 'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] hover:-translate-y-[2px] hover:-translate-x-[2px]',
        glass: 'bg-white/90 backdrop-blur-sm shadow-[4px_4px_0px_0px_rgba(57,103,153,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.2)] hover:-translate-y-[2px] hover:-translate-x-[2px]',
    };
    const paddingStyles = noPadding ? '' : 'p-6';

    return (
        <div className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles} ${className}`}>
            {children}
        </div>
    );
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: {
        direction: 'up' | 'down' | 'neutral';
        value: string;
    };
    color?: 'blue' | 'yellow' | 'wine' | 'gray' | 'green';
    className?: string;
}

const colorStyles = {
    blue: {
        bg: 'bg-brand-blue/10',
        icon: 'text-brand-blue',
        accent: 'text-brand-blueDark',
    },
    yellow: {
        bg: 'bg-brand-yellow/20',
        icon: 'text-amber-600',
        accent: 'text-amber-700',
    },
    wine: {
        bg: 'bg-brand-wine/10',
        icon: 'text-brand-wine',
        accent: 'text-brand-wine',
    },
    gray: {
        bg: 'bg-gray-100',
        icon: 'text-gray-500',
        accent: 'text-gray-700',
    },
    green: {
        bg: 'bg-emerald-50',
        icon: 'text-emerald-600',
        accent: 'text-emerald-700',
    },
};

export function StatCard({
    icon: Icon,
    label,
    value,
    trend,
    color = 'blue',
    className = '',
}: StatCardProps) {
    const styles = colorStyles[color];

    return (
        <div className={`bg-white rounded-tl-2xl rounded-br-2xl overflow-hidden border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)] p-6 transition-transform hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] ${className}`}>
            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${styles.bg}`}>
                    <Icon size={24} className={styles.icon} />
                </div>
                {trend && (
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${trend.direction === 'up'
                        ? 'bg-emerald-50 text-emerald-600'
                        : trend.direction === 'down'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                        {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <p className={`text-3xl font-bold ${styles.accent}`}>{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
        </div>
    );
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
        <div className={`flex items-center justify-between mb-4 border-b-2 border-brand-blueDark pb-2 ${className}`}>
            <h3 className="text-xl font-bold text-brand-blueDark font-display">{children}</h3>
            {action && <div>{action}</div>}
        </div>
    );
}
