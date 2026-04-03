import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

// ── Shared: focus trap + Escape close ─────────────────────────

function useFocusTrap(ref: React.RefObject<HTMLElement | null>, open: boolean) {
    useEffect(() => {
        if (!open || !ref.current) return;
        const el = ref.current;
        const focusable = el.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];

        first?.focus();

        function onKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
            } else {
                if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
            }
        }
        el.addEventListener('keydown', onKeyDown);
        return () => el.removeEventListener('keydown', onKeyDown);
    }, [open, ref]);
}

function useEscapeClose(open: boolean, onClose: () => void) {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);
}

// ── Modal ──────────────────────────────────────────────────────

interface ModalProps {
    open: boolean;
    onClose: () => void;
    /** Dialog title shown in the header bar. */
    title: string;
    children: ReactNode;
    /**
     * Content for the footer (action buttons). When omitted, no footer is rendered.
     */
    footer?: ReactNode;
    /**
     * Maximum width of the modal panel. Defaults to `max-w-sm`.
     */
    maxWidth?: string;
    /**
     * When `true`, renders the modal on a dark surface:
     * `bg-white/12 border-white/20` panel, dark header/footer.
     */
    dark?: boolean;
    className?: string;
}

/**
 * Centred modal dialog. Traps focus, closes on Escape and backdrop click.
 * Sits at `z-40`. Toasts (`z-50`) appear above it.
 *
 * ```tsx
 * <Modal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Confirm Action"
 *   footer={
 *     <>
 *       <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
 *       <Button variant="destructive" size="sm">Remove</Button>
 *     </>
 *   }
 * >
 *   <p className="text-xs text-brand-blue/70">Are you sure?</p>
 * </Modal>
 * ```
 */
export function Modal({
    open,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'max-w-sm',
    dark = false,
    className = '',
}: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    useFocusTrap(panelRef, open);
    useEscapeClose(open, onClose);

    if (!open) return null;

    const panelCls = dark
        ? 'bg-[#1a2d40] border border-white/10 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.45)]'
        : 'bg-white border-2 border-brand-blue/15 shadow-[6px_6px_0px_0px_rgba(10,22,48,0.25)]';
    const headerBorderCls = dark ? 'border-white/5' : 'border-brand-blue/8';
    const titleCls = dark ? 'text-white' : 'text-brand-blue';
    const closeCls = dark
        ? 'text-white/35 hover:text-white/70 transition-colors'
        : 'text-brand-blue/40 hover:text-brand-blue transition-colors';
    const footerCls = dark
        ? 'border-white/5 bg-[#0d1825]'
        : 'border-brand-blue/8 bg-brand-bgLight';

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className={[
                    'relative w-full overflow-hidden',
                    'rounded-tl-2xl rounded-br-2xl',
                    panelCls,
                    maxWidth,
                    className,
                ].join(' ')}
            >
                {/* Header */}
                <div className={`px-5 py-4 border-b ${headerBorderCls} flex items-center justify-between`}>
                    <p
                        id="modal-title"
                        className={`font-display font-extrabold text-sm ${titleCls}`}
                    >
                        {title}
                    </p>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className={closeCls}
                    >
                        <X size={14} aria-hidden="true" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className={`px-5 py-3 border-t ${footerCls} flex items-center justify-end gap-2`}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Drawer ─────────────────────────────────────────────────────

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    /** Panel title shown in the header bar. */
    title: string;
    children: ReactNode;
    /** Footer content (action buttons). */
    footer?: ReactNode;
    /**
     * Maximum width of the drawer panel. Defaults to `max-w-sm`.
     */
    maxWidth?: string;
    /** Side the drawer slides from. Currently only `'right'`. */
    side?: 'right';
    /**
     * When `true`, renders the drawer on a dark surface:
     * `bg-white/10 border-l border-white/15`.
     */
    dark?: boolean;
    className?: string;
}

/**
 * Full-height side drawer. Slides in from the right. Sits at `z-30` (below modals).
 * Traps focus, closes on Escape and backdrop click.
 *
 * ```tsx
 * <Drawer open={open} onClose={() => setOpen(false)} title="Member Details">
 *   <p>Panel content</p>
 * </Drawer>
 * ```
 */
export function Drawer({
    open,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'max-w-sm',
    dark = false,
    className = '',
}: DrawerProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    useFocusTrap(panelRef, open);
    useEscapeClose(open, onClose);

    if (!open) return null;

    const panelCls = dark
        ? 'bg-[#0d1825] border-l border-white/10'
        : 'bg-white border-l-2 border-brand-blue/15';
    const headerBorderCls = dark ? 'border-white/5' : 'border-brand-blue/8';
    const titleCls = dark ? 'text-white' : 'text-brand-blue';
    const closeCls = dark
        ? 'text-white/35 hover:text-white/70 transition-colors'
        : 'text-brand-blue/40 hover:text-brand-blue transition-colors';
    const footerCls = dark
        ? 'border-white/5 bg-[#1a2d40]'
        : 'border-brand-blue/8 bg-brand-bgLight';

    return (
        <div
            className="fixed inset-0 z-30 flex"
            aria-modal="true"
            role="dialog"
            aria-labelledby="drawer-title"
        >
            {/* Backdrop */}
            <div
                className="flex-1 bg-brand-blue/70 backdrop-blur-sm"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Panel — slides from right */}
            <div
                ref={panelRef}
                className={[
                    'h-full flex flex-col',
                    'w-full',
                    panelCls,
                    maxWidth,
                    className,
                ].join(' ')}
            >
                {/* Header */}
                <div className={`px-5 py-4 border-b ${headerBorderCls} flex items-center justify-between flex-shrink-0`}>
                    <p
                        id="drawer-title"
                        className={`font-display font-extrabold text-sm ${titleCls}`}
                    >
                        {title}
                    </p>
                    <button
                        onClick={onClose}
                        aria-label="Close drawer"
                        className={closeCls}
                    >
                        <X size={14} aria-hidden="true" />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className={`px-5 py-4 border-t ${footerCls} flex items-center justify-end gap-2 flex-shrink-0`}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export type { ModalProps, DrawerProps };
