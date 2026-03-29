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

        const labelCls = dark
            ? 'block text-[10px] font-extrabold uppercase tracking-widest text-white/55 mb-1.5'
            : 'block text-sm font-display font-medium text-brand-blue mb-1.5';
        const iconCls = dark ? 'h-5 w-5 text-white/40' : 'h-5 w-5 text-brand-blue/40';

        const inputCls = dark
            ? `block w-full rounded-tl-lg rounded-br-lg font-sans
              border-2 bg-white/10 px-4 py-2.5
              text-white placeholder:text-white/30
              transition-all duration-200
              focus:outline-none focus:ring-0
              ${Icon ? 'pl-10' : ''}
              ${error
                    ? 'border-brand-wine focus:border-brand-wine shadow-[0_0_0_3px_rgba(188,89,79,0.12)]'
                    : 'border-white/20 focus:border-white/40 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.12)]'
                }
              ${props.disabled ? 'opacity-60 cursor-not-allowed bg-white/5' : ''}
              ${className}`
            : `block w-full rounded-tl-lg rounded-br-lg font-sans
              border-2 bg-white px-4 py-2.5
              text-brand-blue placeholder:text-brand-blue/30
              transition-all duration-200
              focus:outline-none focus:ring-0
              ${Icon ? 'pl-10' : ''}
              ${error
                    ? 'border-brand-wine focus:border-brand-wine shadow-[0_0_0_3px_rgba(188,89,79,0.12)]'
                    : 'border-brand-blue/25 focus:border-brand-lightBlue focus:shadow-[0_0_0_3px_rgba(57,103,153,0.12)]'
                }
              ${props.disabled ? 'opacity-60 cursor-not-allowed bg-brand-bgLight' : ''}
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
