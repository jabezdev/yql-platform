import type { ReactNode } from 'react';

type CardVariant = 'minimal' | 'subtle' | 'bordered';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: CardVariant;
    interactive?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
    minimal: 'bg-white border-2 border-brand-blue/15 shadow-[2px_2px_0px_0px_rgba(57,103,153,0.10)]',
    subtle: 'bg-brand-bgLight border-2 border-brand-blue/10',
    bordered: 'bg-white border-2 border-brand-blue shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)]',
};

export function Card({
    children,
    className = '',
    variant = 'minimal',
    interactive = false,
}: CardProps) {
    const baseStyles = 'rounded-tl-xl rounded-br-xl overflow-hidden';
    const interactiveStyles = interactive
        ? 'hover:border-brand-blue/40 hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all duration-200 cursor-pointer'
        : '';

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`}
        >
            {children}
        </div>
    );
}
