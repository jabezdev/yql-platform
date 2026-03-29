import { useState, useEffect } from 'react';
import { NAV_GROUPS } from './branding/shared';
import FoundationSection from './branding/FoundationSection';
import VisualSection from './branding/VisualSection';
import LayoutSection from './branding/LayoutSection';
import ComponentsSection from './branding/ComponentsSection';
import FormsSection from './branding/FormsSection';
import DisplaySection from './branding/DisplaySection';
import NavSection from './branding/NavigationSection';
import OverlaysSection from './branding/OverlaysSection';
import StructuralSection from './branding/StructuralSection';
import PatternsSection from './branding/PatternsSection';
import ProfilesSection from './branding/ProfilesSection';

export default function BrandingPage() {
    const [active, setActive] = useState('principles');
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        const allIds = NAV_GROUPS.flatMap(g => g.items.map(i => i.id));
        const observers: IntersectionObserver[] = [];
        allIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActive(id); },
                { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach(o => o.disconnect());
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActive(id);
    };

    const activeGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === active))?.label ?? '';

    return (
        <div className="min-h-screen bg-brand-bgLight" style={{ fontSize: '112.5%' }}>

            {/* Skip link */}
            <a href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-blue focus:text-white focus:rounded-tl-xl focus:rounded-br-xl focus:text-sm focus:font-bold">
                Skip to main content
            </a>

            {/* ── Sticky header ── */}
            <header className="sticky top-0 z-50 bg-white border-b-2 border-brand-blue/10 shadow-[0_2px_0_0_rgba(57,103,153,0.06)]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/YQL_LOGO.svg" alt="YQL Logo" className="h-7 w-auto flex-shrink-0" />
                        <div>
                            <p className="text-[9px] font-extrabold uppercase tracking-widest text-brand-blue/70 leading-none">YQL Platform</p>
                            <h1 className="text-base font-display font-extrabold text-brand-blue leading-tight">Design System</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-1 bg-brand-yellow/20 border border-brand-yellow/40 rounded-sm text-brand-blue hidden sm:inline">
                            v1&nbsp;·&nbsp;/branding
                        </span>
                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setMobileNavOpen(o => !o)}
                            aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
                            aria-expanded={mobileNavOpen}
                            className="sm:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-tl-lg rounded-br-lg border-2 border-brand-blue/15 text-brand-blue hover:bg-brand-bgLight transition-colors"
                        >
                            <span className={`block w-4 h-0.5 bg-brand-blue rounded-full transition-all duration-200 ${mobileNavOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <span className={`block w-4 h-0.5 bg-brand-blue rounded-full transition-all duration-200 ${mobileNavOpen ? 'opacity-0' : ''}`} />
                            <span className={`block w-4 h-0.5 bg-brand-blue rounded-full transition-all duration-200 ${mobileNavOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Mobile nav overlay */}
                {mobileNavOpen && (
                    <div className="sm:hidden border-t border-brand-blue/10 bg-white max-h-[70vh] overflow-y-auto">
                        {NAV_GROUPS.map(({ label: groupLabel, items }) => (
                            <div key={groupLabel} className="border-b border-brand-blue/8 last:border-0">
                                <p className="px-4 pt-3 pb-1 text-[9px] font-extrabold uppercase tracking-widest text-brand-blue/40">{groupLabel}</p>
                                <div className="px-2 pb-2 flex flex-wrap gap-1">
                                    {items.map(({ id, label }) => (
                                        <button key={id}
                                            onClick={() => { scrollTo(id); setMobileNavOpen(false); }}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-tl-lg rounded-br-lg transition-all ${active === id
                                                ? 'bg-brand-blue text-white'
                                                : 'text-brand-blue/75 hover:text-brand-blue hover:bg-brand-bgLight'}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Desktop nav */}
                <nav aria-label="Design system sections" className="hidden sm:block">
                    {/* Primary row — group tabs */}
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 border-b border-brand-blue/10">
                        <div className="flex gap-0">
                            {NAV_GROUPS.map(({ label: groupLabel, items }) => {
                                const isActive = groupLabel === activeGroup;
                                return (
                                    <button key={groupLabel} onClick={() => scrollTo(items[0].id)}
                                        className={`px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-inset ${isActive
                                            ? 'border-brand-blue text-brand-blue'
                                            : 'border-transparent text-brand-blue/65 hover:text-brand-blue hover:border-brand-blue/40'}`}>
                                        {groupLabel}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* Secondary row — items in the active group */}
                    <div className="bg-brand-bgLight border-b border-brand-blue/8">
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 overflow-x-auto no-scrollbar">
                            <div className="flex gap-0 min-w-max">
                                {(NAV_GROUPS.find(g => g.label === activeGroup)?.items ?? []).map(({ id, label }) => (
                                    <button key={id} onClick={() => scrollTo(id)}
                                        className={`px-3 py-1.5 text-[11px] font-bold border-b-2 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-inset ${active === id
                                            ? 'border-brand-blue text-brand-blue'
                                            : 'border-transparent text-brand-blue/65 hover:text-brand-blue hover:border-brand-blue/35'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <FoundationSection />
                <VisualSection />
                <LayoutSection />
                <ComponentsSection />
                <FormsSection />
                <ProfilesSection />
                <DisplaySection />
                <NavSection />
                <OverlaysSection />
                <StructuralSection />
                <PatternsSection />

                {/* Footer */}
                <div className="border-t-2 border-brand-blue/10 pt-6 pb-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/YQL_LOGO.svg" alt="YQL Logo" className="h-5 w-auto" />
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/70">YQL Design System v1</p>
                    </div>
                    <p className="text-[10px] font-mono text-brand-blue/60">{new Date().toISOString().split('T')[0]}</p>
                </div>
            </main>
        </div>
    );
}
