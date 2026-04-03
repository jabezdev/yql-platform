/**
 * SidebarItem — navigation item for the `bg-brand-blue` sidebar.
 *
 * Encapsulates the `sidebar.*` token set from `@/design/tokens` so callers
 * never hand-roll the active/default/disabled colour logic.
 *
 * ```tsx
 * <SidebarItem icon={Home} label="Dashboard" active />
 * <SidebarItem icon={Users} label="Members" onClick={() => navigate('/members')} />
 * <SidebarItem icon={Settings} label="Settings" disabled />
 *
 * // Section label (no icon, non-interactive)
 * <SidebarLabel>Workspace</SidebarLabel>
 * ```
 *
 * Import via: import { SidebarItem, SidebarLabel } from '@/design'
 */

import { type ReactNode } from 'react';

// ── SidebarItem ────────────────────────────────────────────────

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    /** When true, renders the active state: white fill + yellow left border. */
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    /** Slot for a badge/chip rendered to the right of the label (e.g. unread count). */
    badge?: ReactNode;
    className?: string;
}

/**
 * Sidebar navigation item. Must be placed on a `bg-brand-blue` surface.
 *
 * Active state: `bg-white/15 border-l-2 border-brand-yellow text-white font-bold`.
 * Default state: `text-white/65 hover:bg-white/8 hover:text-white/85`.
 * Disabled state: `text-white/30 pointer-events-none`.
 */
export function SidebarItem({
    icon: Icon,
    label,
    active = false,
    disabled = false,
    onClick,
    badge,
    className = '',
}: SidebarItemProps) {
    const stateCls = disabled
        ? 'text-white/30 pointer-events-none'
        : active
        ? 'bg-white/15 border-l-2 border-brand-yellow text-white font-bold'
        : 'text-white/65 hover:bg-white/8 hover:text-white/85 cursor-pointer';

    const iconCls = active ? 'text-brand-yellow flex-shrink-0' : 'text-white/55 flex-shrink-0';

    return (
        <button
            type="button"
            onClick={!disabled ? onClick : undefined}
            aria-disabled={disabled}
            aria-current={active ? 'page' : undefined}
            className={[
                'flex items-center gap-2.5 w-full px-3 py-2',
                'rounded-tl-lg rounded-br-lg transition-colors duration-150',
                'text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                stateCls,
                className,
            ].join(' ')}
        >
            <Icon size={16} className={iconCls} aria-hidden="true" />
            <span className="flex-1 truncate">{label}</span>
            {badge && <span className="flex-shrink-0">{badge}</span>}
        </button>
    );
}

// ── SidebarLabel ───────────────────────────────────────────────

interface SidebarLabelProps {
    children: ReactNode;
    className?: string;
}

/**
 * Section heading inside the sidebar.
 * Renders as a small caps label — non-interactive.
 *
 * ```tsx
 * <SidebarLabel>Workspace</SidebarLabel>
 * ```
 */
export function SidebarLabel({ children, className = '' }: SidebarLabelProps) {
    return (
        <p
            className={[
                'px-3 pt-5 pb-1',
                'text-[9px] font-extrabold uppercase tracking-widest text-white/30',
                className,
            ].join(' ')}
        >
            {children}
        </p>
    );
}

export type { SidebarItemProps, SidebarLabelProps };
