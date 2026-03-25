import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS  = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const HOUR_OPTS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MIN_OPTS  = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

function parseDate(val: string): Date | null {
    if (!val) return null;
    const d = new Date(val + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
}

function formatDateDisplay(iso: string): string {
    if (!iso) return '';
    const d = parseDate(iso);
    return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : iso;
}

function tryParseDate(text: string): string | null {
    const t = text.trim();
    if (!t) return null;
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return parseDate(t) ? t : null;
    // MM/DD/YYYY
    const slash = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
        const iso = `${slash[3]}-${slash[1].padStart(2, '0')}-${slash[2].padStart(2, '0')}`;
        return parseDate(iso) ? iso : null;
    }
    // Natural language ("Apr 5, 2026", "April 5 2026", etc.)
    const d = new Date(t);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return null;
}

function parse12h(val: string): { h: string; m: string; ampm: 'AM' | 'PM' } {
    if (!val) return { h: '12', m: '00', ampm: 'AM' };
    const [hh, mm] = val.split(':').map(Number);
    return {
        h: String(hh % 12 || 12).padStart(2, '0'),
        m: String(mm).padStart(2, '0'),
        ampm: hh >= 12 ? 'PM' : 'AM',
    };
}

function to24h(h: string, m: string, ampm: 'AM' | 'PM'): string {
    let hh = parseInt(h, 10);
    if (ampm === 'PM' && hh !== 12) hh += 12;
    if (ampm === 'AM' && hh === 12) hh = 0;
    return `${String(hh).padStart(2, '0')}:${m}`;
}

function formatTimeDisplay(val24: string): string {
    if (!val24) return '';
    const { h, m, ampm } = parse12h(val24);
    return `${h}:${m} ${ampm}`;
}

function tryParseTime(text: string): string | null {
    const t = text.trim();
    if (!t) return null;
    // HH:MM (24h)
    const hhmm = t.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmm) {
        const h = parseInt(hhmm[1]), m = parseInt(hhmm[2]);
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59)
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    // H:MM AM/PM
    const ampm = t.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (ampm) {
        let h = parseInt(ampm[1]); const m = parseInt(ampm[2]); const ap = ampm[3].toUpperCase();
        if (ap === 'PM' && h !== 12) h += 12;
        if (ap === 'AM' && h === 12) h = 0;
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59)
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return null;
}

function useAnchorStyle(ref: { current: HTMLElement | null }, open: boolean) {
    const [style, setStyle] = useState<React.CSSProperties>({});
    useEffect(() => {
        if (!open) return;
        const update = () => {
            const el = ref.current;
            if (!el) return;
            const r  = el.getBoundingClientRect();
            const fits = window.innerHeight - r.bottom >= 320;
            setStyle(fits
                ? { position: 'fixed', top: r.bottom + 4, left: Math.min(r.left, window.innerWidth - 292), zIndex: 9999 }
                : { position: 'fixed', bottom: window.innerHeight - r.top + 4, left: Math.min(r.left, window.innerWidth - 292), zIndex: 9999 }
            );
        };
        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [open, ref]);
    return style;
}

// ─── Shared Calendar Popover ──────────────────────────────────────────────────

interface CalendarProps {
    viewYear: number;
    viewMonth: number;
    today: Date;
    selectedStart?: string;
    selectedEnd?: string;
    min?: string;
    max?: string;
    dark?: boolean;
    phaseLabel?: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onPickDay: (day: number) => void;
}

function CalendarGrid({
    viewYear, viewMonth, today,
    selectedStart, selectedEnd,
    min, max, dark, phaseLabel,
    onPrevMonth, onNextMonth, onPickDay,
}: CalendarProps) {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
    const iso = (day: number) =>
        `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Theme tokens
    const bg       = dark ? 'bg-brand-blue border border-white/12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.45)]'
                           : 'bg-white border-2 border-brand-blue/15 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.18)]';
    const hdr      = dark ? 'bg-white/5 border-b border-white/8' : 'bg-brand-bgLight/70 border-b-2 border-brand-blue/8';
    const phaseBar = dark ? 'bg-white/5 border-b border-white/8 text-white/45' : 'bg-brand-blue/5 border-b border-brand-blue/8 text-brand-blue/50';
    const nav      = dark ? 'text-white/45 hover:text-white hover:bg-white/8' : 'text-brand-blue/50 hover:text-brand-blue hover:bg-brand-blue/8';
    const title    = dark ? 'text-white' : 'text-brand-blue';
    const wdayClr  = dark ? 'text-white/25' : 'text-brand-blue/30';

    const dayClass = (day: number) => {
        const d    = iso(day);
        const sel  = d === selectedStart || d === selectedEnd;
        const isStart = d === selectedStart;
        const isEnd   = d === selectedEnd;
        const inRange = selectedStart && selectedEnd && d > selectedStart && d < selectedEnd;
        const isTodayD = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
        const off  = (min ? d < min : false) || (max ? d > max : false);

        if (sel) return dark
            ? `bg-brand-yellow text-brand-blue font-bold ${isStart ? 'rounded-tl-md' : ''} ${isEnd ? 'rounded-br-md' : ''} ${isStart && !selectedEnd ? 'rounded-br-md' : ''}`
            : `bg-brand-blue text-white font-bold ${isStart ? 'rounded-tl-md' : ''} ${isEnd ? 'rounded-br-md' : ''} ${isStart && !selectedEnd ? 'rounded-br-md' : ''}`;
        if (inRange) return dark ? 'bg-brand-yellow/15 text-white/85' : 'bg-brand-blue/10 text-brand-blue';
        if (isTodayD) return dark
            ? 'border border-white/40 text-white font-bold hover:bg-white/8 rounded-tl-md rounded-br-md'
            : 'border-2 border-brand-lightBlue text-brand-blue font-bold hover:bg-brand-bgLight rounded-tl-md rounded-br-md';
        if (off) return dark ? 'text-white/15 cursor-not-allowed' : 'text-brand-blue/20 cursor-not-allowed';
        return dark ? 'text-white/60 hover:bg-white/10 hover:text-white rounded' : 'text-brand-blue/65 hover:bg-brand-bgLight hover:text-brand-blue rounded';
    };

    return (
        <div className={`w-72 rounded-tl-xl rounded-br-xl overflow-hidden ${bg}`}>
            {phaseLabel && (
                <div className={`px-3 py-1.5 text-center ${phaseBar}`}>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest">{phaseLabel}</p>
                </div>
            )}
            {/* Month nav */}
            <div className={`flex items-center justify-between px-3 py-2.5 ${hdr}`}>
                <button onMouseDown={e => { e.preventDefault(); onPrevMonth(); }} className={`p-1.5 rounded transition-colors ${nav}`}>
                    <ChevronLeft size={13} />
                </button>
                <span className={`text-xs font-extrabold tracking-wide select-none ${title}`}>
                    {MONTHS[viewMonth]} {viewYear}
                </span>
                <button onMouseDown={e => { e.preventDefault(); onNextMonth(); }} className={`p-1.5 rounded transition-colors ${nav}`}>
                    <ChevronRight size={13} />
                </button>
            </div>
            {/* Weekday labels */}
            <div className="grid grid-cols-7 px-2 pt-2 pb-1">
                {WEEKDAYS.map(d => (
                    <div key={d} className={`text-center text-[9px] font-extrabold tracking-widest uppercase select-none ${wdayClr}`}>{d}</div>
                ))}
            </div>
            {/* Day grid */}
            <div className="grid grid-cols-7 px-2 pb-3 gap-y-0.5">
                {Array.from({ length: firstDay }, (_, i) => <div key={`p${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const off = (min ? iso(day) < min : false) || (max ? iso(day) > max : false);
                    return (
                        <button
                            key={day}
                            type="button"
                            disabled={off}
                            onMouseDown={e => { e.preventDefault(); if (!off) onPickDay(day); }}
                            className={`h-8 w-full flex items-center justify-center text-xs font-medium transition-colors select-none ${dayClass(day)}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Input wrapper theme tokens ───────────────────────────────────────────────

function wrapperClass(open: boolean, error: boolean | undefined, disabled: boolean | undefined, dark: boolean | undefined) {
    const base = 'flex items-center border-2 rounded-tl-lg rounded-br-lg transition-[border-color,box-shadow] duration-150';
    const disabledCls = disabled ? ' opacity-50' : '';
    if (dark) {
        const border = error
            ? 'border-brand-wine'
            : open
                ? 'border-white/40 ring-2 ring-white/20'
                : 'border-white/20 focus-within:border-white/40 focus-within:ring-2 focus-within:ring-white/20';
        return `${base} bg-white/10 ${border}${disabledCls}`;
    }
    const border = error
        ? 'border-brand-wine'
        : open
            ? 'border-brand-lightBlue ring-2 ring-brand-blue/20'
            : 'border-brand-blue/25 focus-within:border-brand-lightBlue focus-within:ring-2 focus-within:ring-brand-blue/20';
    return `${base} bg-white ${border}${disabled ? ' bg-brand-bgLight opacity-50' : ''}`;
}

// ─── DateInput ────────────────────────────────────────────────────────────────

interface DateInputProps {
    label?: string;
    value?: string;
    onChange?: (v: string) => void;
    min?: string;
    max?: string;
    disabled?: boolean;
    error?: string;
    dark?: boolean;
    className?: string;
}

export function DateInput({ label, value, onChange, min, max, disabled, error, dark, className = '' }: DateInputProps) {
    const [open, setOpen]         = useState(false);
    const [textVal, setTextVal]   = useState(() => formatDateDisplay(value ?? ''));
    const [isTyping, setIsTyping] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const anchorRef    = useRef<HTMLDivElement>(null);
    const popoverRef   = useRef<HTMLDivElement>(null);

    const today    = new Date();
    const selected = parseDate(value ?? '');
    const [viewYear,  setViewYear]  = useState(selected?.getFullYear() ?? today.getFullYear());
    const [viewMonth, setViewMonth] = useState(selected?.getMonth()    ?? today.getMonth());

    const anchorStyle = useAnchorStyle(anchorRef as { current: HTMLElement | null }, open);

    // Sync display text when value changes externally
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { if (!isTyping) setTextVal(formatDateDisplay(value ?? '')); }, [value, isTyping]);
    // Sync calendar view to selected date
    useEffect(() => {
        const d = parseDate(value ?? '');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (d) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
    }, [value]);
    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!containerRef.current?.contains(t) && !popoverRef.current?.contains(t)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
    const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
    const pickDay   = (day: number) => {
        const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange?.(iso);
        setOpen(false);
    };

    const handleBlur = () => {
        setIsTyping(false);
        const parsed = tryParseDate(textVal);
        if (parsed) onChange?.(parsed);
        else setTextVal(formatDateDisplay(value ?? ''));
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { const p = tryParseDate(textVal); if (p) { onChange?.(p); setOpen(false); } }
        if (e.key === 'Escape') setOpen(false);
    };
    const toggle = () => { if (!disabled) setOpen(o => !o); };

    const iconCls  = dark ? 'text-white/40 hover:text-white/70' : 'text-brand-blue/40 hover:text-brand-blue';
    const inputCls = dark ? 'text-white placeholder-white/30' : 'text-brand-blue placeholder-brand-blue/35';
    const labelCls = dark ? 'text-white/55' : 'text-brand-blue/70';

    return (
        <div className={className} ref={containerRef}>
            {label && <label className={`block text-xs font-extrabold uppercase tracking-widest mb-1.5 ${labelCls}`}>{label}</label>}
            <div className={wrapperClass(open, !!error, disabled, dark)} ref={anchorRef}>
                {/* Left icon — opens popover */}
                <button type="button" onMouseDown={e => { e.preventDefault(); toggle(); }} disabled={disabled}
                    className={`pl-3 py-2.5 shrink-0 transition-colors ${iconCls}`} aria-label="Open date picker">
                    <Calendar size={14} />
                </button>
                {/* Text input — manual entry */}
                <input
                    type="text"
                    value={textVal}
                    onChange={e => { setTextVal(e.target.value); setIsTyping(true); }}
                    onFocus={() => setIsTyping(true)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder="MMM D, YYYY"
                    className={`flex-1 min-w-0 px-2 py-2.5 text-sm bg-transparent focus:outline-none ${inputCls} ${disabled ? 'cursor-not-allowed' : ''}`}
                />
                {/* Chevron — toggles popover */}
                <button type="button" onMouseDown={e => { e.preventDefault(); toggle(); }} disabled={disabled}
                    className={`pr-2.5 py-2.5 shrink-0 transition-colors ${iconCls}`} aria-label="Toggle date picker">
                    <ChevronDown size={13} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {error && <p className="text-xs text-brand-wine mt-1 font-medium">{error}</p>}

            {open && createPortal(
                <div ref={popoverRef} style={anchorStyle}>
                    <CalendarGrid
                        viewYear={viewYear} viewMonth={viewMonth}
                        today={today} selectedStart={value}
                        min={min} max={max} dark={dark}
                        onPrevMonth={prevMonth} onNextMonth={nextMonth} onPickDay={pickDay}
                    />
                </div>,
                document.body
            )}
        </div>
    );
}

// ─── TimeInput ────────────────────────────────────────────────────────────────

interface TimeInputProps {
    label?: string;
    value?: string;
    onChange?: (v: string) => void;
    disabled?: boolean;
    error?: string;
    dark?: boolean;
    className?: string;
}

export function TimeInput({ label, value, onChange, disabled, error, dark, className = '' }: TimeInputProps) {
    const [open, setOpen]         = useState(false);
    const [textVal, setTextVal]   = useState(() => formatTimeDisplay(value ?? ''));
    const [isTyping, setIsTyping] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const anchorRef    = useRef<HTMLDivElement>(null);
    const popoverRef   = useRef<HTMLDivElement>(null);
    const hourColRef   = useRef<HTMLDivElement>(null);
    const minColRef    = useRef<HTMLDivElement>(null);

    const anchorStyle = useAnchorStyle(anchorRef as { current: HTMLElement | null }, open);

    const p = parse12h(value ?? '');
    const [selH,    setSelH]    = useState(p.h);
    const [selM,    setSelM]    = useState(p.m);
    const [selAmpm, setSelAmpm] = useState<'AM' | 'PM'>(p.ampm);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { if (!isTyping) setTextVal(formatTimeDisplay(value ?? '')); }, [value, isTyping]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { const q = parse12h(value ?? ''); setSelH(q.h); setSelM(q.m); setSelAmpm(q.ampm); }, [value]);

    // Scroll selected items into view
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => {
            if (hourColRef.current) {
                const idx = HOUR_OPTS.indexOf(selH);
                hourColRef.current.querySelectorAll('button')[idx]?.scrollIntoView({ block: 'center', behavior: 'instant' });
            }
            if (minColRef.current) {
                const idx = MIN_OPTS.indexOf(selM);
                minColRef.current.querySelectorAll('button')[idx]?.scrollIntoView({ block: 'center', behavior: 'instant' });
            }
        }, 0);
        return () => clearTimeout(t);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!containerRef.current?.contains(t) && !popoverRef.current?.contains(t)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const pickH    = (h: string)       => { setSelH(h);    onChange?.(to24h(h,    selM, selAmpm)); };
    const pickM    = (m: string)       => { setSelM(m);    onChange?.(to24h(selH, m,    selAmpm)); };
    const pickAmpm = (a: 'AM' | 'PM') => { setSelAmpm(a); onChange?.(to24h(selH, selM, a));       };

    const handleBlur = () => {
        setIsTyping(false);
        const parsed = tryParseTime(textVal);
        if (parsed) onChange?.(parsed);
        else setTextVal(formatTimeDisplay(value ?? ''));
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { const p = tryParseTime(textVal); if (p) { onChange?.(p); setOpen(false); } }
        if (e.key === 'Escape') setOpen(false);
    };
    const toggle = () => { if (!disabled) setOpen(o => !o); };

    const iconCls  = dark ? 'text-white/40 hover:text-white/70' : 'text-brand-blue/40 hover:text-brand-blue';
    const inputCls = dark ? 'text-white placeholder-white/30' : 'text-brand-blue placeholder-brand-blue/35';
    const labelCls = dark ? 'text-white/55' : 'text-brand-blue/70';

    // Popover theme tokens
    const popBg        = dark ? 'bg-brand-blue border border-white/12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.45)]'
                               : 'bg-white border-2 border-brand-blue/15 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.18)]';
    const ampmDivider  = dark ? 'border-b-2 border-white/8' : 'border-b-2 border-brand-blue/8';
    const ampmActive   = dark ? 'bg-brand-yellow text-brand-blue' : 'bg-brand-blue text-white';
    const ampmInactive = dark ? 'text-white/45 bg-white/5 hover:bg-white/10 hover:text-white' : 'text-brand-blue/45 bg-brand-bgLight/60 hover:bg-brand-blue/8 hover:text-brand-blue';
    const colDivider   = dark ? 'divide-x-2 divide-white/8' : 'divide-x-2 divide-brand-blue/8';
    const colHdr       = dark ? 'text-white/25 bg-white/5 border-b border-white/8' : 'text-brand-blue/30 bg-brand-bgLight/40 border-b border-brand-blue/8';
    const itemActive   = dark ? 'bg-brand-yellow text-brand-blue font-bold' : 'bg-brand-blue text-white font-bold';
    const itemDefault  = dark ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-brand-blue/65 hover:bg-brand-bgLight hover:text-brand-blue';

    return (
        <div className={className} ref={containerRef}>
            {label && <label className={`block text-xs font-extrabold uppercase tracking-widest mb-1.5 ${labelCls}`}>{label}</label>}
            <div className={wrapperClass(open, !!error, disabled, dark)} ref={anchorRef}>
                <button type="button" onMouseDown={e => { e.preventDefault(); toggle(); }} disabled={disabled}
                    className={`pl-3 py-2.5 shrink-0 transition-colors ${iconCls}`} aria-label="Open time picker">
                    <Clock size={14} />
                </button>
                <input
                    type="text"
                    value={textVal}
                    onChange={e => { setTextVal(e.target.value); setIsTyping(true); }}
                    onFocus={() => setIsTyping(true)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder="H:MM AM"
                    className={`flex-1 min-w-0 px-2 py-2.5 text-sm bg-transparent focus:outline-none ${inputCls} ${disabled ? 'cursor-not-allowed' : ''}`}
                />
                <button type="button" onMouseDown={e => { e.preventDefault(); toggle(); }} disabled={disabled}
                    className={`pr-2.5 py-2.5 shrink-0 transition-colors ${iconCls}`} aria-label="Toggle time picker">
                    <ChevronDown size={13} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {error && <p className="text-xs text-brand-wine mt-1 font-medium">{error}</p>}

            {open && createPortal(
                <div ref={popoverRef} style={anchorStyle} className={`w-48 rounded-tl-xl rounded-br-xl overflow-hidden ${popBg}`}>
                    {/* AM / PM toggle */}
                    <div className={`flex ${ampmDivider}`}>
                        {(['AM', 'PM'] as const).map(a => (
                            <button key={a} onMouseDown={e => { e.preventDefault(); pickAmpm(a); }}
                                className={`flex-1 py-2 text-xs font-extrabold tracking-widest uppercase transition-colors select-none ${selAmpm === a ? ampmActive : ampmInactive}`}>
                                {a}
                            </button>
                        ))}
                    </div>
                    {/* Hour + Minute columns */}
                    <div className={`flex ${colDivider}`}>
                        <div className="flex-1 flex flex-col min-w-0">
                            <p className={`text-[9px] font-extrabold uppercase tracking-widest text-center py-1.5 select-none ${colHdr}`}>Hr</p>
                            <div ref={hourColRef} className="overflow-y-auto" style={{ maxHeight: 160 }}>
                                {HOUR_OPTS.map(h => (
                                    <button key={h} onMouseDown={e => { e.preventDefault(); pickH(h); }}
                                        className={`w-full py-1.5 text-sm font-medium text-center transition-colors select-none ${selH === h ? itemActive : itemDefault}`}>
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                            <p className={`text-[9px] font-extrabold uppercase tracking-widest text-center py-1.5 select-none ${colHdr}`}>Min</p>
                            <div ref={minColRef} className="overflow-y-auto" style={{ maxHeight: 160 }}>
                                {MIN_OPTS.map(m => (
                                    <button key={m} onMouseDown={e => { e.preventDefault(); pickM(m); }}
                                        className={`w-full py-1.5 text-sm font-medium text-center transition-colors select-none ${selM === m ? itemActive : itemDefault}`}>
                                        :{m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

// ─── DateTimeInput ────────────────────────────────────────────────────────────

interface DateTimeInputProps {
    label?: string;
    dateValue?: string;
    timeValue?: string;
    onDateChange?: (v: string) => void;
    onTimeChange?: (v: string) => void;
    disabled?: boolean;
    dark?: boolean;
    className?: string;
}

export function DateTimeInput({ label, dateValue, timeValue, onDateChange, onTimeChange, disabled, dark, className = '' }: DateTimeInputProps) {
    return (
        <div className={className}>
            {label && (
                <label className={`block text-xs font-extrabold uppercase tracking-widest mb-1.5 ${dark ? 'text-white/55' : 'text-brand-blue/70'}`}>
                    {label}
                </label>
            )}
            <div className="flex gap-2">
                <DateInput value={dateValue} onChange={onDateChange} disabled={disabled} dark={dark} className="flex-1 min-w-0" />
                <TimeInput value={timeValue} onChange={onTimeChange} disabled={disabled} dark={dark} className="w-40 shrink-0" />
            </div>
        </div>
    );
}

// ─── DateRangeInput — single shared calendar ──────────────────────────────────

interface DateRangeInputProps {
    label?: string;
    startValue?: string;
    endValue?: string;
    onStartChange?: (v: string) => void;
    onEndChange?: (v: string) => void;
    dark?: boolean;
    className?: string;
}

export function DateRangeInput({ label, startValue, endValue, onStartChange, onEndChange, dark, className = '' }: DateRangeInputProps) {
    const [open,  setOpen]  = useState(false);
    const [phase, setPhase] = useState<'start' | 'end'>('start');

    const [startText, setStartText] = useState(() => formatDateDisplay(startValue ?? ''));
    const [endText,   setEndText]   = useState(() => formatDateDisplay(endValue   ?? ''));

    const containerRef = useRef<HTMLDivElement>(null);
    const anchorRef    = useRef<HTMLDivElement>(null);
    const popoverRef   = useRef<HTMLDivElement>(null);

    const today    = new Date();
    const initDate = parseDate(startValue ?? '') ?? today;
    const [viewYear,  setViewYear]  = useState(initDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initDate.getMonth());

    const anchorStyle = useAnchorStyle(anchorRef as { current: HTMLElement | null }, open);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setStartText(formatDateDisplay(startValue ?? '')); }, [startValue]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setEndText(formatDateDisplay(endValue   ?? '')); }, [endValue]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!containerRef.current?.contains(t) && !popoverRef.current?.contains(t)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
    const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

    const pickDay = (day: number) => {
        const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (phase === 'start') {
            onStartChange?.(iso);
            if (endValue && iso >= endValue) onEndChange?.('');
            setPhase('end');
        } else {
            if (startValue && iso < startValue) {
                // Clicked before start → restart selection
                onStartChange?.(iso);
                onEndChange?.('');
            } else {
                onEndChange?.(iso);
                setOpen(false);
            }
        }
    };

    const openForPhase = (p: 'start' | 'end') => {
        setPhase(p);
        const anchor = p === 'start' ? parseDate(startValue ?? '') : parseDate(endValue ?? '');
        if (anchor) { setViewYear(anchor.getFullYear()); setViewMonth(anchor.getMonth()); }
        setOpen(true);
    };

    const handleStartBlur = () => {
        const parsed = tryParseDate(startText);
        if (parsed) { onStartChange?.(parsed); if (endValue && parsed >= endValue) onEndChange?.(''); }
        else setStartText(formatDateDisplay(startValue ?? ''));
    };
    const handleEndBlur = () => {
        const parsed = tryParseDate(endText);
        if (parsed && (!startValue || parsed >= startValue)) onEndChange?.(parsed);
        else setEndText(formatDateDisplay(endValue ?? ''));
    };

    const phaseLabel = open ? (phase === 'start' ? 'Select start date' : 'Select end date') : undefined;

    const iconCls  = dark ? 'text-white/40' : 'text-brand-blue/40';
    const inputCls = dark ? 'text-white placeholder-white/30' : 'text-brand-blue placeholder-brand-blue/30';
    const sepCls   = dark ? 'text-white/30' : 'text-brand-blue/30';
    const chevCls  = dark ? 'text-white/40 hover:text-white/70' : 'text-brand-blue/40 hover:text-brand-blue';
    const labelCls = dark ? 'text-white/55' : 'text-brand-blue/70';

    return (
        <div className={className} ref={containerRef}>
            {label && <label className={`block text-xs font-extrabold uppercase tracking-widest mb-1.5 ${labelCls}`}>{label}</label>}
            <div className={wrapperClass(open, false, false, dark)} ref={anchorRef}>
                {/* Calendar icon */}
                <span className={`pl-3 py-2.5 shrink-0 ${iconCls}`}>
                    <Calendar size={14} />
                </span>
                {/* Start date */}
                <input
                    type="text"
                    value={startText}
                    onChange={e => setStartText(e.target.value)}
                    onFocus={() => openForPhase('start')}
                    onBlur={handleStartBlur}
                    onKeyDown={e => { if (e.key === 'Enter') handleStartBlur(); if (e.key === 'Escape') setOpen(false); }}
                    placeholder="Start"
                    className={`flex-1 min-w-0 px-2 py-2.5 text-sm bg-transparent focus:outline-none ${inputCls}`}
                />
                {/* Separator */}
                <span className={`text-xs font-bold shrink-0 select-none ${sepCls}`}>→</span>
                {/* End date */}
                <input
                    type="text"
                    value={endText}
                    onChange={e => setEndText(e.target.value)}
                    onFocus={() => openForPhase('end')}
                    onBlur={handleEndBlur}
                    onKeyDown={e => { if (e.key === 'Enter') handleEndBlur(); if (e.key === 'Escape') setOpen(false); }}
                    placeholder="End"
                    className={`flex-1 min-w-0 px-2 py-2.5 text-sm bg-transparent focus:outline-none ${inputCls}`}
                />
                {/* Toggle */}
                <button type="button"
                    onMouseDown={e => { e.preventDefault(); if (open) { setOpen(false); } else { openForPhase(startValue ? 'end' : 'start'); } }}
                    className={`pr-2.5 py-2.5 shrink-0 transition-colors ${chevCls}`}>
                    <ChevronDown size={13} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {open && createPortal(
                <div ref={popoverRef} style={anchorStyle}>
                    <CalendarGrid
                        viewYear={viewYear} viewMonth={viewMonth}
                        today={today} selectedStart={startValue} selectedEnd={endValue}
                        dark={dark} phaseLabel={phaseLabel}
                        onPrevMonth={prevMonth} onNextMonth={nextMonth} onPickDay={pickDay}
                    />
                </div>,
                document.body
            )}
        </div>
    );
}

// ─── TimeSlotPicker ───────────────────────────────────────────────────────────

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
