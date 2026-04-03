import type { ReactNode } from 'react';

type CardVariant = 'minimal' | 'subtle' | 'bordered';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: CardVariant;
    interactive?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
    minimal: 'bg-white dark:bg-white/5 border-2 border-brand-blue/15 dark:border-white/10 shadow-[2px_2px_0px_0px_rgba(57,103,153,0.10)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]',
    subtle: 'bg-brand-bgLight dark:bg-white/8 border-2 border-brand-blue/10 dark:border-white/15',
    bordered: 'bg-white dark:bg-white/8 border-2 border-brand-blue dark:border-white/20 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]',
};

export function Card({
    children,
    className = '',
    variant = 'minimal',
    interactive = false,
}: CardProps) {
    const baseStyles = 'rounded-tl-xl rounded-br-xl overflow-hidden transition-all duration-200';
    const interactiveStyles = interactive
        ? 'hover:border-brand-blue/40 dark:hover:border-white/40 hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] dark:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-[2px] hover:-translate-x-[2px] cursor-pointer'
        : '';

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`}
        >
            {children}
        </div>
    );
}
