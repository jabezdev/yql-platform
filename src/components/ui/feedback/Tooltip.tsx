import {
    useState,
    useRef,
    useEffect,
    useCallback,
    type ReactNode,
    type RefObject,
} from 'react';

// ── Placement ──────────────────────────────────────────────────

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

const PLACEMENT_CLS: Record<TooltipPlacement, string> = {
    top:    'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left:   'right-full mr-2 top-1/2 -translate-y-1/2',
    right:  'left-full ml-2 top-1/2 -translate-y-1/2',
};

// ── Tooltip (simple hover tip) ─────────────────────────────────

interface TooltipProps {
    /** The element that triggers the tooltip. */
    children: ReactNode;
    /** Tooltip text content. */
    content: ReactNode;
    placement?: TooltipPlacement;
    /**
     * When `true`, the tooltip uses an inverted colour scheme:
     * `bg-white text-brand-blue` — intended for use on dark surfaces.
     */
    dark?: boolean;
    className?: string;
}

/**
 * Hover tooltip. Wraps any element and shows a brand-styled tip on mouse enter.
 *
 * ```tsx
 * <Tooltip content="Edit member" placement="top">
 *   <button>…</button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
    children,
    content,
    placement = 'top',
    dark = false,
    className = '',
}: TooltipProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className={`relative inline-flex ${className}`}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onFocus={() => setVisible(true)}
            onBlur={() => setVisible(false)}
        >
            {children}
            {visible && (
                <div
                    className={`absolute ${PLACEMENT_CLS[placement]} pointer-events-none z-10`}
                    role="tooltip"
                >
                    <div
                        className={[
                            'text-[10px] font-medium px-2 py-1 rounded-tl-md rounded-br-md whitespace-nowrap',
                            'shadow-[2px_2px_0px_0px_rgba(10,22,48,0.4)]',
                            dark
                                ? 'bg-white text-brand-blue'
                                : 'bg-brand-blue text-white',
                        ].join(' ')}
                    >
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Popover (click-triggered, richer content) ──────────────────

interface PopoverProps {
    /** The element that toggles the popover. Receives `open` and `onToggle`. */
    trigger: (props: { open: boolean; onToggle: () => void }) => ReactNode;
    /** Popover panel content. */
    children: ReactNode;
    placement?: Extract<TooltipPlacement, 'top' | 'bottom'>;
    /**
     * Width of the panel. Defaults to `w-56`.
     */
    width?: string;
    /**
     * When `true`, renders the popover on a dark surface:
     * `bg-white/12 border-white/15 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.35)]`.
     */
    dark?: boolean;
    className?: string;
}

function useOutsideClick(ref: RefObject<HTMLElement | null>, cb: () => void) {
    useEffect(() => {
        function handle(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) cb();
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [ref, cb]);
}

/**
 * Click-triggered popover panel for richer content (user cards, menus, info panels).
 *
 * ```tsx
 * <Popover trigger={({ open, onToggle }) => (
 *   <button onClick={onToggle}>User Info {open ? '↑' : '↓'}</button>
 * )}>
 *   <p>Panel content</p>
 * </Popover>
 * ```
 */
export function Popover({
    trigger,
    children,
    placement = 'bottom',
    width = 'w-56',
    dark = false,
    className = '',
}: PopoverProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(false), []);

    useOutsideClick(ref, close);

    const panelPlacement = placement === 'top'
        ? 'bottom-full mb-1'
        : 'top-full mt-1';

    const panelCls = dark
        ? 'bg-white/12 border border-white/15 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.35)]'
        : 'bg-white border-2 border-brand-blue/15 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)]';

    return (
        <div ref={ref} className={`relative inline-block ${className}`}>
            {trigger({ open, onToggle: () => setOpen(o => !o) })}
            {open && (
                <div
                    className={[
                        'absolute left-0 z-10 overflow-hidden',
                        panelCls,
                        'rounded-tl-xl rounded-br-xl',
                        panelPlacement,
                        width,
                    ].join(' ')}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

export type { TooltipProps, PopoverProps };
