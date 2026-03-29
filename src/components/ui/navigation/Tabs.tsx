import { createContext, useContext, type ReactNode } from 'react';

// ── Context ────────────────────────────────────────────────────

interface TabsCtx {
    value: string;
    onChange: (v: string) => void;
    variant: 'underline' | 'pill';
    dark: boolean;
}

const TabsContext = createContext<TabsCtx | null>(null);

function useTabsCtx(caller: string): TabsCtx {
    const ctx = useContext(TabsContext);
    if (!ctx) throw new Error(`<${caller}> must be used inside <Tabs>`);
    return ctx;
}

// ── Tabs (root) ────────────────────────────────────────────────

interface TabsProps {
    /** Controlled value — the active tab's value string. */
    value: string;
    onValueChange: (v: string) => void;
    /** Visual style of the tab bar. */
    variant?: 'underline' | 'pill';
    /**
     * When `true`, applies dark-surface colour tokens to the tab bar.
     * Use when rendering tabs on a `bg-brand-blue` or similar dark background.
     */
    dark?: boolean;
    children: ReactNode;
    className?: string;
}

export function Tabs({
    value,
    onValueChange,
    variant = 'underline',
    dark = false,
    children,
    className = '',
}: TabsProps) {
    return (
        <TabsContext.Provider value={{ value, onChange: onValueChange, variant, dark }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

// ── TabsList ───────────────────────────────────────────────────

interface TabsListProps {
    children: ReactNode;
    className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
    const { variant, dark } = useTabsCtx('TabsList');

    if (variant === 'pill') {
        return (
            <div
                role="tablist"
                className={[
                    'flex gap-1.5 flex-wrap p-1 rounded-tl-xl rounded-br-xl',
                    dark ? 'bg-white/8' : 'bg-brand-bgLight',
                    className,
                ].join(' ')}
            >
                {children}
            </div>
        );
    }

    // underline
    return (
        <div
            role="tablist"
            className={[
                'border-b-2 flex gap-0',
                dark ? 'border-white/15' : 'border-brand-blue/10',
                className,
            ].join(' ')}
        >
            {children}
        </div>
    );
}

// ── TabsTrigger ────────────────────────────────────────────────

interface TabsTriggerProps {
    /** Must match the `value` passed to `<Tabs>` to control selection. */
    value: string;
    children: ReactNode;
    disabled?: boolean;
    className?: string;
}

export function TabsTrigger({
    value,
    children,
    disabled = false,
    className = '',
}: TabsTriggerProps) {
    const { value: activeValue, onChange, variant, dark } = useTabsCtx('TabsTrigger');
    const isActive = value === activeValue;

    const handleClick = () => {
        if (!disabled) onChange(value);
    };

    if (variant === 'pill') {
        const activeCls = dark
            ? 'bg-white/20 text-white border border-white/25 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]'
            : 'bg-white text-brand-blue shadow-[2px_2px_0px_0px_rgba(57,103,153,0.1)] border border-brand-blue/15';
        const inactiveCls = dark
            ? (disabled ? 'text-white/25 cursor-not-allowed' : 'text-white/45 hover:text-white hover:bg-white/10')
            : (disabled ? 'text-brand-blue/30 cursor-not-allowed' : 'text-brand-blue/55 hover:text-brand-blue hover:bg-white/60');
        return (
            <button
                role="tab"
                aria-selected={isActive}
                disabled={disabled}
                onClick={handleClick}
                className={[
                    'px-3 py-1.5 text-xs font-bold rounded-tl-lg rounded-br-lg transition-all whitespace-nowrap',
                    isActive ? activeCls : inactiveCls,
                    className,
                ].join(' ')}
            >
                {children}
            </button>
        );
    }

    // underline
    const activeUnderlineCls = dark
        ? 'border-white text-white'
        : 'border-brand-blue text-brand-blue';
    const inactiveUnderlineCls = dark
        ? (disabled ? 'border-transparent text-white/25 cursor-not-allowed' : 'border-transparent text-white/45 hover:text-white hover:border-white/35')
        : (disabled ? 'border-transparent text-brand-blue/30 cursor-not-allowed' : 'border-transparent text-brand-blue/50 hover:text-brand-blue/75 hover:border-brand-blue/30');
    return (
        <button
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={handleClick}
            className={[
                'px-4 py-2.5 text-xs font-bold border-b-2 -mb-0.5 transition-all whitespace-nowrap',
                isActive ? activeUnderlineCls : inactiveUnderlineCls,
                className,
            ].join(' ')}
        >
            {children}
        </button>
    );
}

// ── TabsContent ────────────────────────────────────────────────

interface TabsContentProps {
    /** Rendered only when this value matches the active tab. */
    value: string;
    children: ReactNode;
    className?: string;
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
    const { value: activeValue } = useTabsCtx('TabsContent');
    if (value !== activeValue) return null;
    return (
        <div role="tabpanel" className={className}>
            {children}
        </div>
    );
}

export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps };
