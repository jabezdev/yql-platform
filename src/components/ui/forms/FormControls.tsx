/**
 * FormControls — Checkbox, RadioGroup, Toggle, Select, Textarea
 *
 * All controls follow the same pattern as <Input>:
 *   - Label: `text-[10px] font-extrabold uppercase tracking-widest`
 *   - Error: `text-brand-wine` (validation) not red (destructive)
 *   - Focus ring: always blue-tinted on light, white-tinted on dark
 *   - dark?: inverts checked colours (blue → yellow, white dot → blue dot)
 *
 * Import via: import { Checkbox, RadioGroup, Toggle, Select, Textarea } from '@/design'
 */

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';

// ── Label helper ───────────────────────────────────────────────

// ── Label helper ───────────────────────────────────────────────

function FieldLabel({ children, dark }: { children: ReactNode; dark?: boolean }) {
    return (
        <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-1.5 ${dark ? 'text-white/55' : 'text-brand-blue/70 dark:text-white/55'}`}>
            {children}
        </p>
    );
}

function FieldError({ message }: { message: string }) {
    return <p className="text-[10px] text-brand-wine mt-1">{message}</p>;
}

// ── Checkbox ─────────────────────────────────────────────────────

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    dark?: boolean;
    className?: string;
}

export function Checkbox({ label, checked, onChange, disabled = false, dark = false, className = '' }: CheckboxProps) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={`flex items-center gap-2.5 cursor-pointer group text-left w-full ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
        >
            <span className={[
                'w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150',
                checked
                    ? dark ? 'bg-brand-yellow border-brand-yellow' : 'bg-brand-blue border-brand-blue dark:bg-brand-yellow dark:border-brand-yellow'
                    : dark ? 'border-white/30 bg-white/10 group-hover:border-white/50' : 'border-brand-blue/25 bg-white group-hover:border-brand-lightBlue dark:border-white/30 dark:bg-white/10 dark:group-hover:border-white/50',
            ].join(' ')}>
                {checked && (
                    <Check
                        size={10}
                        strokeWidth={3.5}
                        className={dark ? 'text-brand-blue' : 'text-white dark:text-brand-blue'}
                        aria-hidden="true"
                    />
                )}
            </span>
            <span className={`text-sm transition-colors ${dark ? 'text-white/75 group-hover:text-white' : 'text-brand-blue/75 group-hover:text-brand-blue dark:text-white/75 dark:group-hover:text-white'}`}>
                {label}
            </span>
        </button>
    );
}

// ── RadioGroup ────────────────────────────────────────────────────

interface RadioOption {
    label: string;
    value: string;
    disabled?: boolean;
}

interface RadioGroupProps {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    options: RadioOption[];
    dark?: boolean;
    className?: string;
}

export function RadioGroup({ label, value, onChange, options, dark = false, className = '' }: RadioGroupProps) {
    return (
        <div role="radiogroup" className={className}>
            {label && <FieldLabel dark={dark}>{label}</FieldLabel>}
            <div className="space-y-2.5">
                {options.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={value === opt.value}
                        disabled={opt.disabled}
                        onClick={() => !opt.disabled && onChange(opt.value)}
                        className={`flex items-center gap-2.5 cursor-pointer group text-left w-full ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        <span className={[
                            'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150',
                            value === opt.value
                                ? dark ? 'border-brand-yellow' : 'border-brand-blue dark:border-brand-yellow'
                                : dark ? 'border-white/30 bg-white/10 group-hover:border-white/50' : 'border-brand-blue/25 bg-white group-hover:border-brand-lightBlue dark:border-white/30 dark:bg-white/10 dark:group-hover:border-white/50',
                        ].join(' ')}>
                            {value === opt.value && (
                                <span className={`w-2 h-2 rounded-full ${dark ? 'bg-brand-yellow' : 'bg-brand-blue dark:bg-brand-yellow'}`} />
                            )}
                        </span>
                        <span className={`text-sm transition-colors ${dark ? 'text-white/75 group-hover:text-white' : 'text-brand-blue/75 group-hover:text-brand-blue dark:text-white/75 dark:group-hover:text-white'}`}>
                            {opt.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ── Toggle (Switch) ────────────────────────────────────────────────

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** Inline label text rendered to the left. */
    label?: string;
    disabled?: boolean;
    dark?: boolean;
    className?: string;
}

export function Toggle({ checked, onChange, label, disabled = false, dark = false, className = '' }: ToggleProps) {
    return (
        <div className={`flex items-center justify-between gap-3 ${className}`}>
            {label && (
                <span className={`text-sm ${dark ? 'text-white/75' : 'text-brand-blue/75 dark:text-white/75'}`}>{label}</span>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={[
                    'relative w-10 h-[22px] rounded-tl-lg rounded-br-lg p-0 overflow-hidden transition-colors duration-200',
                    'focus:outline-none focus:ring-2 flex-shrink-0',
                    disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                    dark
                        ? `focus:ring-white/30 ${checked ? 'bg-brand-yellow' : 'bg-white/20'}`
                        : `focus:ring-brand-blue/30 dark:focus:ring-white/30 ${checked ? 'bg-brand-blue dark:bg-brand-yellow' : 'bg-brand-blue/20 dark:bg-white/20'}`,
                ].join(' ')}
            >
                <span className={[
                    'absolute top-[3px] left-0 w-4 h-4 rounded-tl-md rounded-br-md shadow-sm transition-transform duration-200',
                    checked ? 'translate-x-[21px]' : 'translate-x-[3px]',
                    (dark && checked) || (checked) ? 'bg-brand-blue dark:bg-brand-blue' : 'bg-white',
                    !dark && !checked ? 'bg-white' : '',
                    dark && !checked ? 'bg-white' : '',
                ].join(' ').replace(/\s+/g, ' ')} />
            </button>
        </div>
    );
}

// ── Select ─────────────────────────────────────────────────────────

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
    dark?: boolean;
    className?: string;
}

export function Select({ label, value, onChange, options, placeholder = 'Select…', error, dark = false, className = '' }: SelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) close();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [close]);

    const selected = options.find(o => o.value === value);

    const borderCls = dark
        ? open ? 'border-white/40 ring-2 ring-white/25' : 'border-white/20'
        : open ? 'border-brand-lightBlue ring-2 ring-brand-blue/20 dark:border-white/40 dark:ring-white/25' : error ? 'border-brand-wine' : 'border-brand-blue/25 dark:border-white/20';

    return (
        <div ref={ref} className={`relative ${className}`}>
            {label && <FieldLabel dark={dark}>{label}</FieldLabel>}
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
                className={[
                    'w-full flex items-center justify-between px-3 py-2.5 text-sm border-2 brand-sm',
                    'transition-[border-color,box-shadow] duration-150 focus:outline-none',
                    dark ? 'bg-white/10 text-white' : 'bg-white dark:bg-white/10 dark:text-white',
                    borderCls,
                ].join(' ')}
            >
                <span className={selected ? (dark ? 'text-white' : 'text-brand-blue dark:text-white') : (dark ? 'text-white/40' : 'text-brand-blue/40 dark:text-white/40')}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-150 flex-shrink-0 ${open ? 'rotate-180' : ''} ${dark ? 'text-white/50' : 'text-brand-blue/50 dark:text-white/50'}`}
                    aria-hidden="true"
                />
            </button>
            {open && (
                <div
                    role="listbox"
                    className={[
                        'absolute top-full mt-1 w-full overflow-hidden z-10',
                        'border-2 brand-md',
                        'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]',
                        dark ? 'bg-brand-blue border-white/20' : 'bg-white border-brand-blue/15 dark:bg-[#1a2d40] dark:border-white/20',
                    ].join(' ')}
                >
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={value === opt.value}
                            onMouseDown={() => { onChange(opt.value); setOpen(false); }}
                            className={[
                                'w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center justify-between',
                                value === opt.value
                                    ? dark ? 'text-brand-yellow font-bold bg-white/10' : 'text-brand-blue font-bold bg-brand-bgLight/60 dark:text-brand-yellow dark:bg-white/10'
                                    : dark ? 'text-white/75 hover:bg-white/10' : 'text-brand-blue/75 hover:bg-brand-bgLight dark:text-white/75 dark:hover:bg-white/10',
                            ].join(' ')}
                        >
                            {opt.label}
                            {value === opt.value && <Check size={12} aria-hidden="true" className={dark ? 'text-brand-yellow' : 'text-brand-blue dark:text-brand-yellow'} />}
                        </button>
                    ))}
                </div>
            )}
            {error && <FieldError message={error} />}
        </div>
    );
}

// ── Textarea ────────────────────────────────────────────────────────

interface TextareaProps {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    error?: string;
    disabled?: boolean;
    dark?: boolean;
    className?: string;
}

export function Textarea({ label, value, onChange, placeholder, rows = 4, error, disabled = false, dark = false, className = '' }: TextareaProps) {
    const borderCls = dark
        ? 'border-white/20 bg-white/10 text-white placeholder-white/30 focus:ring-white/25 focus:border-white/40'
        : error
        ? 'border-brand-wine bg-white text-brand-blue placeholder-brand-blue/35 focus:ring-brand-wine/20 focus:border-brand-wine'
        : 'border-brand-blue/25 bg-white dark:bg-white/10 dark:border-white/20 text-brand-blue dark:text-white placeholder-brand-blue/35 dark:placeholder-white/30 focus:ring-brand-blue/30 dark:focus:ring-white/25 focus:border-brand-lightBlue dark:focus:border-white/40';

    return (
        <div className={className}>
            {label && <FieldLabel dark={dark}>{label}</FieldLabel>}
            <textarea
                rows={rows}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={[
                    'w-full px-3 py-2.5 text-sm border-2 brand-sm resize-none',
                    'focus:outline-none focus:ring-2 transition-[border-color,box-shadow] duration-150',
                    disabled ? 'opacity-50 cursor-not-allowed' : '',
                    borderCls,
                ].join(' ')}
            />
            {error && <FieldError message={error} />}
        </div>
    );
}

export type { CheckboxProps, RadioGroupProps, RadioOption, ToggleProps, SelectProps, SelectOption, TextareaProps };
