import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'white' | 'geometric-primary' | 'geometric-secondary' | 'outline' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    fullWidth?: boolean;
}

type ButtonAsButton = BaseButtonProps &
    ButtonHTMLAttributes<HTMLButtonElement> & {
        as?: 'button';
        href?: never;
    };

type ButtonAsLink = BaseButtonProps &
    AnchorHTMLAttributes<HTMLAnchorElement> & {
        as: 'a';
        href: string;
    };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        'bg-brand-blueDark text-white font-bold hover:bg-brand-darkBlue shadow-[3px_3px_0px_0px_rgba(10,22,48,0.55)] hover:shadow-[4px_4px_0px_0px_rgba(10,22,48,0.55)] hover:-translate-y-[1px] hover:-translate-x-[1px] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] rounded-tl-xl rounded-br-xl border-2 border-brand-blueDark',
    secondary:
        'bg-white text-brand-blueDark font-bold hover:bg-gray-50 shadow-[3px_3px_0px_0px_rgba(57,103,153,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,0.3)] hover:-translate-y-[1px] hover:-translate-x-[1px] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] rounded-tl-xl rounded-br-xl border-2 border-brand-blueDark',
    ghost:
        'bg-transparent text-brand-blueDark font-bold hover:bg-brand-blueDark/10 rounded-lg border-2 border-transparent',
    white:
        'bg-white text-brand-blueDark font-bold hover:bg-gray-50 border-2 border-transparent rounded-tl-xl rounded-br-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]',
    'geometric-primary':
        'bg-brand-blueDark text-white font-bold hover:bg-brand-darkBlue shadow-[4px_4px_0px_0px_rgba(10,22,48,0.55)] hover:shadow-[6px_6px_0px_0px_rgba(10,22,48,0.55)] hover:-translate-y-[2px] hover:-translate-x-[2px] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] rounded-tl-2xl rounded-br-2xl border-2 border-brand-blueDark',
    'geometric-secondary':
        'bg-white text-brand-blueDark font-bold border-2 border-brand-blueDark hover:bg-brand-bgLight shadow-[4px_4px_0px_0px_rgba(57,103,153,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.2)] hover:-translate-y-[2px] hover:-translate-x-[2px] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] rounded-tl-2xl rounded-br-2xl',
    outline:
        'bg-white text-brand-blueDark font-bold border-2 border-brand-blueDark hover:bg-brand-bgLight shadow-[2px_2px_0px_0px_rgba(57,103,153,0.5)] rounded-tl-lg rounded-br-lg active:shadow-none active:translate-y-[2px] active:translate-x-[2px]',
    destructive:
        'bg-brand-wine text-white font-bold hover:bg-brand-wine/90 shadow-[3px_3px_0px_0px_rgba(153,27,27,1)] hover:shadow-[4px_4px_0px_0px_rgba(153,27,27,1)] hover:-translate-y-[1px] hover:-translate-x-[1px] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] rounded-tl-xl rounded-br-xl border-2 border-brand-wine',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-4 text-lg',
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    fullWidth = false,
    as = 'button',
    ...props
}: ButtonProps) {
    const baseStyles =
        'inline-flex items-center justify-center gap-2 transition-all duration-200 font-display';
    const widthStyles = fullWidth ? 'w-full' : '';

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

    if (as === 'a') {
        const { href, ...anchorProps } = props as ButtonAsLink;
        return (
            <a href={href} className={combinedClassName} {...anchorProps}>
                {children}
            </a>
        );
    }

    return (
        <button className={combinedClassName} {...(props as ButtonAsButton)}>
            {children}
        </button>
    );
}
