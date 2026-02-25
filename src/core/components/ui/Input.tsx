import React, { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, icon: Icon, fullWidth = true, ...props }, ref) => {

        return (
            <div className={`${fullWidth ? 'w-full' : 'inline-block'}`}>
                {label && (
                    <label className="block text-sm font-display font-medium text-brand-blueDark mb-1.5">
                        {label}
                        {props.required && <span className="text-brand-wine ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    {Icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon className="h-5 w-5 text-gray-400" />
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={`
              block w-full rounded-lg font-sans
              border-2 bg-white px-4 py-2.5 
              text-brand-blueDark placeholder-gray-400
              transition-colors duration-200
              focus:outline-none focus:ring-0
              ${Icon ? 'pl-10' : ''}
              ${error
                                ? 'border-brand-wine focus:border-brand-wine/80'
                                : 'border-brand-gray/30 focus:border-brand-blue'
                            }
              ${props.disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}
              ${className}
            `}
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
