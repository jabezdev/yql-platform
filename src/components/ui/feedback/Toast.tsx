/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

// ── Variant config ─────────────────────────────────────────────

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

const VARIANT_CONFIG: Record<
    ToastVariant,
    { icon: typeof CheckCircle2; border: string; iconCls: string }
> = {
    success: { icon: CheckCircle2, border: 'border-brand-green/40',     iconCls: 'text-brand-green' },
    warning: { icon: AlertTriangle, border: 'border-brand-yellow/50',   iconCls: 'text-brand-yellow' },
    error:   { icon: AlertCircle,  border: 'border-brand-red/40',       iconCls: 'text-brand-red' },
    info:    { icon: Info,         border: 'border-brand-lightBlue/40', iconCls: 'text-brand-lightBlue' },
};

const VARIANT_CONFIG_DARK: Record<
    ToastVariant,
    { icon: typeof CheckCircle2; bg: string; border: string; iconCls: string }
> = {
    success: { icon: CheckCircle2, bg: 'bg-brand-green/15',  border: 'border-brand-green/50',  iconCls: 'text-brand-green' },
    warning: { icon: AlertTriangle, bg: 'bg-brand-yellow/12', border: 'border-brand-yellow/55', iconCls: 'text-brand-yellow' },
    error:   { icon: AlertCircle,  bg: 'bg-brand-red/15',    border: 'border-brand-red/55',    iconCls: 'text-brand-red' },
    info:    { icon: Info,         bg: 'bg-white/10',        border: 'border-white/25',        iconCls: 'text-white/65' },
};

const ALERT_VARIANT_CONFIG: Record<
    ToastVariant,
    { icon: typeof CheckCircle2; bg: string; border: string; iconCls: string; labelCls: string }
> = {
    success: { icon: CheckCircle2, bg: 'bg-brand-green/8',      border: 'border-brand-green/25',     iconCls: 'text-brand-green',     labelCls: 'text-brand-green' },
    warning: { icon: AlertTriangle, bg: 'bg-brand-yellow/10',   border: 'border-brand-yellow/35',    iconCls: 'text-brand-yellow',    labelCls: 'text-brand-blue' },
    error:   { icon: AlertCircle,  bg: 'bg-brand-red/8',        border: 'border-brand-red/25',       iconCls: 'text-brand-red',       labelCls: 'text-brand-red' },
    info:    { icon: Info,         bg: 'bg-brand-lightBlue/8',  border: 'border-brand-lightBlue/25', iconCls: 'text-brand-lightBlue', labelCls: 'text-brand-lightBlue' },
};

const ALERT_VARIANT_CONFIG_DARK: Record<
    ToastVariant,
    { icon: typeof CheckCircle2; bg: string; border: string; iconCls: string; labelCls: string }
> = {
    success: { icon: CheckCircle2, bg: 'bg-brand-green/15',  border: 'border-brand-green/45',  iconCls: 'text-brand-green',  labelCls: 'text-brand-green' },
    warning: { icon: AlertTriangle, bg: 'bg-brand-yellow/12', border: 'border-brand-yellow/50', iconCls: 'text-brand-yellow', labelCls: 'text-brand-yellow' },
    error:   { icon: AlertCircle,  bg: 'bg-brand-red/15',    border: 'border-brand-red/50',    iconCls: 'text-brand-red',    labelCls: 'text-brand-red' },
    info:    { icon: Info,         bg: 'bg-white/8',          border: 'border-white/20',        iconCls: 'text-white/60',     labelCls: 'text-white' },
};

// ── Toast (transient, positioned fixed) ───────────────────────

interface ToastProps {
    variant?: ToastVariant;
    title: string;
    message?: string;
    onDismiss?: () => void;
    /**
     * When `true`, uses dark-surface colour tokens:
     * colored fill at `/12–15` + border at `/50–55`.
     */
    dark?: boolean;
    className?: string;
}

/**
 * Transient notification. Position it with:
 *   `fixed bottom-4 right-4 z-50`
 * or manage via `useToast()` which handles that automatically.
 */
export function Toast({
    variant = 'info',
    title,
    message,
    onDismiss,
    dark = false,
    className = '',
}: ToastProps) {
    if (dark) {
        const { icon: Icon, bg, border, iconCls } = VARIANT_CONFIG_DARK[variant];
        return (
            <div
                role="status"
                aria-live="polite"
                className={[
                    'flex items-start gap-3 p-3 border rounded-tl-xl rounded-br-xl',
                    bg,
                    border,
                    className,
                ].join(' ')}
            >
                <Icon size={14} className={`${iconCls} flex-shrink-0 mt-0.5`} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{title}</p>
                    {message && (
                        <p className="text-[11px] text-white/65 leading-snug mt-0.5">{message}</p>
                    )}
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        aria-label="Dismiss"
                        className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
                    >
                        <X size={12} aria-hidden="true" />
                    </button>
                )}
            </div>
        );
    }

    const { icon: Icon, border, iconCls } = VARIANT_CONFIG[variant];
    return (
        <div
            role="status"
            aria-live="polite"
            className={[
                'flex items-start gap-3 p-3 bg-white border-2 rounded-tl-xl rounded-br-xl',
                'shadow-[3px_3px_0px_0px_rgba(57,103,153,0.1)]',
                border,
                className,
            ].join(' ')}
        >
            <Icon size={14} className={`${iconCls} flex-shrink-0 mt-0.5`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-blue">{title}</p>
                {message && (
                    <p className="text-[11px] text-brand-blue/65 leading-snug mt-0.5">{message}</p>
                )}
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    aria-label="Dismiss"
                    className="text-brand-blue/30 hover:text-brand-blue/60 transition-colors flex-shrink-0"
                >
                    <X size={12} aria-hidden="true" />
                </button>
            )}
        </div>
    );
}

// ── Alert (inline, persistent) ─────────────────────────────────

interface AlertProps {
    variant?: ToastVariant;
    /** Bold prefix label (e.g. "Warning"). Defaults to the variant name if omitted. */
    label?: string;
    message: string;
    /**
     * When `true`, uses dark-surface colour tokens:
     * colored fill at `/12–15`, border at `/45–50`, body `text-white/75`.
     */
    dark?: boolean;
    className?: string;
}

/**
 * Inline, persistent alert. Lives in the document flow — use for form errors,
 * system notices, or contextual warnings that don't disappear on their own.
 */
export function Alert({ variant = 'info', label, message, dark = false, className = '' }: AlertProps) {
    const cfg = dark ? ALERT_VARIANT_CONFIG_DARK[variant] : ALERT_VARIANT_CONFIG[variant];
    const { icon: Icon, bg, border, iconCls, labelCls } = cfg;
    const displayLabel = label ?? (variant.charAt(0).toUpperCase() + variant.slice(1));
    const bodyTextCls = dark ? 'text-white/75' : 'text-brand-blue/75';

    return (
        <div
            role="alert"
            className={[
                'flex items-start gap-2.5 px-3 py-2.5 border-2 rounded-tl-lg rounded-br-lg',
                bg,
                border,
                className,
            ].join(' ')}
        >
            <Icon size={13} className={`${iconCls} flex-shrink-0 mt-0.5`} aria-hidden="true" />
            <p className={`text-xs ${bodyTextCls} leading-relaxed`}>
                <strong className={labelCls}>{displayLabel}:</strong>{' '}
                {message}
            </p>
        </div>
    );
}

// ── useToast ───────────────────────────────────────────────────

export interface ToastItem {
    id: string;
    variant: ToastVariant;
    title: string;
    message?: string;
}

/**
 * Imperative toast hook. Maintains a queue (max 5). New toasts stack upward.
 *
 * ```tsx
 * const { toasts, toast, dismiss } = useToast();
 * toast({ variant: 'success', title: 'Saved!', message: 'Your changes were saved.' });
 * // Render <ToastStack toasts={toasts} onDismiss={dismiss} /> at the root.
 * ```
 */
export function useToast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const toast = useCallback((item: Omit<ToastItem, 'id'>, durationMs = 4000) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev.slice(-4), { ...item, id }]);
        if (durationMs > 0) setTimeout(() => dismiss(id), durationMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, toast, dismiss };
}

// ── ToastStack ─────────────────────────────────────────────────

interface ToastStackProps {
    toasts: ToastItem[];
    onDismiss: (id: string) => void;
}

/**
 * Drop this at the root of your app (e.g. inside `<App>`) paired with `useToast()`.
 *
 * ```tsx
 * const { toasts, toast, dismiss } = useToast();
 * return (
 *   <>
 *     <Router />
 *     <ToastStack toasts={toasts} onDismiss={dismiss} />
 *   </>
 * );
 * ```
 */
export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
    if (toasts.length === 0) return null;
    return (
        <div
            aria-live="polite"
            aria-label="Notifications"
            className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-72 max-w-[calc(100vw-2rem)]"
        >
            {toasts.map(t => (
                <Toast
                    key={t.id}
                    variant={t.variant}
                    title={t.title}
                    message={t.message}
                    onDismiss={() => onDismiss(t.id)}
                />
            ))}
        </div>
    );
}

export type { ToastProps, AlertProps };

// No-op to avoid unused warning
void (null as unknown as ReactNode);
