import { useState, useCallback } from 'react';
import { Copy, CheckCheck } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Copy hook
// ─────────────────────────────────────────────────────────────

export function useCopy() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const copy = useCallback((value: string, key: string) => {
        navigator.clipboard.writeText(value).catch(() => {});
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    }, []);
    return { copiedKey, copy };
}

export { Copy, CheckCheck };

// ─────────────────────────────────────────────────────────────
// Layout primitives
// ─────────────────────────────────────────────────────────────

export function Section({ id, title, icon: Icon, children }: {
    id: string; title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="mb-20 scroll-mt-28">
            <div className="flex items-center gap-3 mb-8 pb-3 border-b-2 border-brand-blue/10">
                <div className="w-9 h-9 bg-brand-yellow/20 border-2 border-brand-blue/15 rounded-tl-lg rounded-br-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-brand-blue/80" aria-hidden={true as any} />
                </div>
                <h2 className="text-xl font-display font-extrabold text-brand-blue [text-wrap:balance]">{title}</h2>
            </div>
            {children}
        </section>
    );
}

export function Meta({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
    return <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-3 ${light ? 'text-white/60' : 'text-brand-blue/55'}`}>{children}</p>;
}

export function Box({ children, className = '', dark = false }: { children: React.ReactNode; className?: string; dark?: boolean }) {
    return (
        <div className={`p-5 rounded-tl-xl rounded-br-xl border-2 ${dark ? 'bg-brand-blue border-brand-blue' : 'bg-white border-brand-blue/15 shadow-[2px_2px_0px_0px_rgba(57,103,153,0.08)]'} ${className}`}>
            {children}
        </div>
    );
}

export function Row({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`flex flex-wrap items-center gap-3 ${className}`}>{children}</div>;
}

export function Grid({ cols = 3, children, className = '' }: { cols?: number; children: React.ReactNode; className?: string }) {
    const map: Record<number, string> = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    };
    return <div className={`grid gap-4 ${map[cols]} ${className}`}>{children}</div>;
}

export function Callout({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'success' | 'warning' }) {
    const styles = {
        info: 'bg-brand-blue/5 border-brand-blue/15',
        success: 'bg-brand-green/8 border-brand-green/30',
        warning: 'bg-brand-wine/8 border-brand-wine/25',
    };
    return (
        <div className={`mb-5 p-4 border-2 rounded-tl-lg rounded-br-lg ${styles[variant]}`}>
            <p className="text-xs text-brand-blue/75 font-medium leading-relaxed">{children}</p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Navigation structure (used by the main BrandingPage header)
// ─────────────────────────────────────────────────────────────

export const NAV_GROUPS: { label: string; items: { id: string; label: string }[] }[] = [
    { label: 'Foundation', items: [
        { id: 'principles', label: 'Principles' },
        { id: 'logo', label: 'Logo' },
        { id: 'colors', label: 'Colors' },
        { id: 'typography', label: 'Typography' },
    ]},
    { label: 'Visual', items: [
        { id: 'iconography', label: 'Icons' },
        { id: 'spacing', label: 'Spacing' },
        { id: 'motif', label: 'Motif' },
        { id: 'motion', label: 'Motion' },
    ]},
    { label: 'Layout', items: [
        { id: 'layout', label: 'Layout' },
    ]},
    { label: 'Components', items: [
        { id: 'buttons', label: 'Buttons' },
        { id: 'cards', label: 'Cards' },
        { id: 'forms', label: 'Forms' },
        { id: 'badges', label: 'Badges' },
        { id: 'tables', label: 'Tables' },
        { id: 'progress', label: 'Progress' },
        { id: 'avatars', label: 'Avatars' },
        { id: 'profiles', label: 'Profiles' },
    ]},
    { label: 'Nav', items: [
        { id: 'navigation', label: 'Sidebar' },
        { id: 'breadcrumbs', label: 'Crumbs' },
        { id: 'tabs', label: 'Tabs' },
        { id: 'pagination', label: 'Pages' },
        { id: 'search', label: 'Search' },
    ]},
    { label: 'Overlays', items: [
        { id: 'modals', label: 'Modals' },
        { id: 'tooltips', label: 'Tooltips' },
        { id: 'toasts', label: 'Toasts' },
    ]},
    { label: 'Structure', items: [
        { id: 'headers', label: 'Headers' },
        { id: 'empty', label: 'Empty / Load' },
    ]},
    { label: 'Patterns', items: [
        { id: 'chat', label: 'Chat' },
        { id: 'copy', label: 'Copy' },
    ]},
];
