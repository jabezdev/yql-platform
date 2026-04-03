import React, { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    fullWidth?: boolean;
    /**
     * When `true`, renders on a dark surface:
     * `bg-white/10 border-white/20 text-white`.
     * Focus ring becomes `ring-white/25 border-white/40`.
     * Label becomes `text-white/55`.
     */
    dark?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, icon: Icon, fullWidth = true, dark = false, ...props }, ref) => {

        const labelCls = `block text-[10px] font-extrabold uppercase tracking-widest mb-1.5 
            ${dark ? 'text-white/55' : 'text-brand-blue/70 dark:text-white/55'}`;
        const iconCls = `h-5 w-5 ${dark ? 'text-white/40' : 'text-brand-blue/40 dark:text-white/40'}`;

        const inputCls = `block w-full rounded-tl-lg rounded-br-lg font-sans border-2 px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-0
            ${Icon ? 'pl-10' : ''}
            ${dark || 'dark:bg-white/10 dark:text-white dark:placeholder:text-white/30 dark:border-white/20 dark:focus:border-white/40 dark:focus:shadow-[0_0_0_3px_rgba(255,255,255,0.12)]'}
            ${dark 
                ? `bg-white/10 text-white placeholder:text-white/30 border-white/20 focus:border-white/40 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.12)]`
                : error 
                    ? 'bg-white border-brand-wine text-brand-blue placeholder:text-brand-blue/30 focus:border-brand-wine shadow-[0_0_0_3px_rgba(188,89,79,0.12)]' 
                    : 'bg-white border-brand-blue/25 text-brand-blue placeholder:text-brand-blue/30 focus:border-brand-lightBlue focus:shadow-[0_0_0_3px_rgba(57,103,153,0.12)]'
            }
            ${props.disabled ? 'opacity-60 cursor-not-allowed bg-brand-bgLight dark:bg-white/5' : ''}
            ${className}`;

        return (
            <div className={`${fullWidth ? 'w-full' : 'inline-block'}`}>
                {label && (
                    <label className={labelCls}>
                        {label}
                        {props.required && <span className="text-brand-wine ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    {Icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon className={iconCls} aria-hidden="true" />
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={inputCls}
                        {...props}
                    />
                </div>

                {error && (
                    <p className="mt-1.5 text-sm text-brand-wine">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
