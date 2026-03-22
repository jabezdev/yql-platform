import { Calendar, Clock } from 'lucide-react';

// ============================================
// Date Input
// ============================================

interface DateInputProps {
    label?: string;
    value?: string;
    onChange?: (v: string) => void;
    min?: string;
    max?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
}

export function DateInput({ label, value, onChange, min, max, disabled, error, className = '' }: DateInputProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-extrabold uppercase tracking-widest text-brand-blue/70 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-blue/40" />
                <input
                    type="date"
                    value={value}
                    onChange={e => onChange?.(e.target.value)}
                    min={min}
                    max={max}
                    disabled={disabled}
                    className={`w-full pl-9 pr-3 py-2.5 text-sm border-2 rounded-tl-lg rounded-br-lg bg-white text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-[border-color,box-shadow] duration-150
                        ${error ? 'border-brand-wine focus:border-brand-wine' : 'border-brand-blue/25 focus:border-brand-lightBlue'}
                        ${disabled ? 'opacity-50 cursor-not-allowed bg-brand-bgLight' : ''}
                    `}
                />
            </div>
            {error && <p className="text-xs text-brand-wine mt-1 font-medium">{error}</p>}
        </div>
    );
}

// ============================================
// Time Input
// ============================================

interface TimeInputProps {
    label?: string;
    value?: string;
    onChange?: (v: string) => void;
    disabled?: boolean;
    error?: string;
    className?: string;
}

export function TimeInput({ label, value, onChange, disabled, error, className = '' }: TimeInputProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-extrabold uppercase tracking-widest text-brand-blue/70 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-blue/40" />
                <input
                    type="time"
                    value={value}
                    onChange={e => onChange?.(e.target.value)}
                    disabled={disabled}
                    className={`w-full pl-9 pr-3 py-2.5 text-sm border-2 rounded-tl-lg rounded-br-lg bg-white text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-[border-color,box-shadow] duration-150
                        ${error ? 'border-brand-wine focus:border-brand-wine' : 'border-brand-blue/25 focus:border-brand-lightBlue'}
                        ${disabled ? 'opacity-50 cursor-not-allowed bg-brand-bgLight' : ''}
                    `}
                />
            </div>
            {error && <p className="text-xs text-brand-wine mt-1 font-medium">{error}</p>}
        </div>
    );
}

// ============================================
// Date + Time pair
// ============================================

interface DateTimeInputProps {
    label?: string;
    dateValue?: string;
    timeValue?: string;
    onDateChange?: (v: string) => void;
    onTimeChange?: (v: string) => void;
    disabled?: boolean;
    className?: string;
}

export function DateTimeInput({ label, dateValue, timeValue, onDateChange, onTimeChange, disabled, className = '' }: DateTimeInputProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-extrabold uppercase tracking-widest text-brand-blue/70 mb-1.5">
                    {label}
                </label>
            )}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-blue/40" />
                    <input
                        type="date"
                        value={dateValue}
                        onChange={e => onDateChange?.(e.target.value)}
                        disabled={disabled}
                        className={`w-full pl-9 pr-3 py-2.5 text-sm border-2 border-brand-blue/25 rounded-tl-lg rounded-br-lg bg-white text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-lightBlue transition-[border-color,box-shadow] duration-150 ${disabled ? 'opacity-50 cursor-not-allowed bg-brand-bgLight' : ''}`}
                    />
                </div>
                <div className="relative w-32">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-blue/40" />
                    <input
                        type="time"
                        value={timeValue}
                        onChange={e => onTimeChange?.(e.target.value)}
                        disabled={disabled}
                        className={`w-full pl-9 pr-3 py-2.5 text-sm border-2 border-brand-blue/25 rounded-tl-lg rounded-br-lg bg-white text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-lightBlue transition-[border-color,box-shadow] duration-150 ${disabled ? 'opacity-50 cursor-not-allowed bg-brand-bgLight' : ''}`}
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================
// Date Range Input
// ============================================

interface DateRangeInputProps {
    label?: string;
    startValue?: string;
    endValue?: string;
    onStartChange?: (v: string) => void;
    onEndChange?: (v: string) => void;
    className?: string;
}

export function DateRangeInput({ label, startValue, endValue, onStartChange, onEndChange, className = '' }: DateRangeInputProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-extrabold uppercase tracking-widest text-brand-blue/70 mb-1.5">
                    {label}
                </label>
            )}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-blue/40" />
                    <input
                        type="date"
                        value={startValue}
                        onChange={e => onStartChange?.(e.target.value)}
                        max={endValue}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-brand-blue/25 rounded-tl-lg rounded-br-lg bg-white text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-lightBlue transition-[border-color,box-shadow] duration-150"
                    />
                </div>
                <span className="text-xs font-bold text-brand-blue/40 shrink-0">to</span>
                <div className="relative flex-1">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-blue/40" />
                    <input
                        type="date"
                        value={endValue}
                        onChange={e => onEndChange?.(e.target.value)}
                        min={startValue}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-brand-blue/25 rounded-tl-lg rounded-br-lg bg-white text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-lightBlue transition-[border-color,box-shadow] duration-150"
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================
// Time Slot Picker
// ============================================

interface TimeSlotPickerProps {
    label?: string;
    slots: string[];
    value?: string;
    onChange?: (v: string) => void;
    disabledSlots?: string[];
    className?: string;
}

export function TimeSlotPicker({ label, slots, value, onChange, disabledSlots = [], className = '' }: TimeSlotPickerProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-extrabold uppercase tracking-widest text-brand-blue/70 mb-2">
                    {label}
                </label>
            )}
            <div className="flex flex-wrap gap-2">
                {slots.map(slot => {
                    const isDisabled = disabledSlots.includes(slot);
                    const isSelected = value === slot;
                    return (
                        <button
                            key={slot}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => !isDisabled && onChange?.(slot)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-tl-lg rounded-br-lg border-2 transition-all duration-150
                                ${isSelected
                                    ? 'bg-brand-blue text-white border-brand-blue shadow-[2px_2px_0px_0px_rgba(10,22,48,0.35)]'
                                    : isDisabled
                                        ? 'bg-brand-bgLight text-brand-blue/25 border-brand-blue/10 cursor-not-allowed line-through decoration-brand-blue/30'
                                        : 'bg-white text-brand-blue border-brand-blue/25 hover:bg-brand-bgLight hover:border-brand-blue/40'
                                }
                            `}
                        >
                            {slot}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
