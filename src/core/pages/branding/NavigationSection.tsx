import { useState } from 'react';
import { Layout, ChevronRight, ChevronLeft, MoreHorizontal, Search, Layers, Users, Calendar, BookOpen } from 'lucide-react';
import { UserAvatar } from '../../components/chat/shared/UserAvatar';
import { Section, Meta, Box, Grid, Callout } from './shared';

// ─── Navigation / Sidebar ─────────────────────────────────────

function NavigationSection() {
    return (
        <Section id="navigation" title="Navigation &amp; Sidebar" icon={Layout}>
            <Callout>
                The sidebar background is <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">bg-brand-blue</code>. Active items get a <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">border-l-2 border-brand-yellow</code> indicator. Items use <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">rounded-tl-lg rounded-br-lg</code> for hover and active states.
            </Callout>
            <Grid cols={2}>
                <Box>
                    <Meta>Sidebar anatomy</Meta>
                    <div className="bg-brand-blue rounded-tl-xl rounded-br-xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
                            <img src="/YQL_LOGO_WHITE.svg" alt="YQL Logo" className="h-7 w-auto flex-shrink-0" />
                            <div>
                                <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/50 leading-none">YQL Platform</p>
                                <p className="text-sm font-display font-extrabold text-white leading-tight">Workspace</p>
                            </div>
                        </div>
                        <div className="p-2 space-y-0.5">
                            <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/30 px-3 py-1.5">Main</p>
                            {[
                                { icon: Layout, label: 'Dashboard', active: true },
                                { icon: Users, label: 'Directory', active: false },
                                { icon: Calendar, label: 'Calendar', active: false },
                                { icon: BookOpen, label: 'Resources', active: false },
                            ].map(({ icon: Icon, label, active }) => (
                                <div key={label} className={`flex items-center gap-2.5 px-3 py-2 rounded-tl-lg rounded-br-lg cursor-pointer transition-colors ${active ? 'bg-white/15 border-l-2 border-brand-yellow pl-[10px]' : 'hover:bg-white/8 border-l-2 border-transparent'}`}>
                                    <Icon size={15} className={active ? 'text-brand-yellow' : 'text-white/55'} aria-hidden="true" />
                                    <span className={`text-sm font-medium ${active ? 'text-white font-bold' : 'text-white/65'}`}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Box>
                <Box>
                    <Meta>States reference</Meta>
                    <div className="space-y-2">
                        {[
                            { label: 'Default', bg: 'transparent', border: 'border-transparent', textCls: 'text-white/65', note: 'Resting' },
                            { label: 'Hover', bg: 'bg-white/8', border: 'border-transparent', textCls: 'text-white/85', note: 'Mouse over' },
                            { label: 'Active', bg: 'bg-white/15', border: 'border-brand-yellow', textCls: 'text-white font-bold', note: 'Current page' },
                            { label: 'Disabled', bg: 'transparent', border: 'border-transparent', textCls: 'text-white/30', note: 'No permission' },
                        ].map(({ label, bg, border, textCls, note }) => (
                            <div key={label} className="bg-brand-blue rounded-tl-lg rounded-br-lg p-2.5">
                                <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-tl-md rounded-br-md ${bg} border-l-2 ${border}`}>
                                    <Layout size={13} aria-hidden="true" className={`${textCls} flex-shrink-0`} />
                                    <span className={`text-sm ${textCls}`}>{label}</span>
                                </div>
                                <p className="text-[10px] text-white/35 mt-1 pl-3">{note}</p>
                            </div>
                        ))}
                    </div>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Breadcrumbs ──────────────────────────────────────────────

function BreadcrumbsSection() {
    return (
        <Section id="breadcrumbs" title="Breadcrumbs" icon={ChevronRight}>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Simple breadcrumb</Meta>
                    <nav aria-label="Breadcrumb">
                        <ol className="flex items-center gap-1 flex-wrap">
                            {['Dashboard', 'Directory', 'Alice Johnson'].map((crumb, i, arr) => (
                                <li key={crumb} className="flex items-center gap-1">
                                    {i < arr.length - 1 ? (
                                        <>
                                            <button className="text-xs text-brand-lightBlue hover:text-brand-blue font-medium transition-colors">{crumb}</button>
                                            <ChevronRight size={12} className="text-brand-blue/30" aria-hidden="true" />
                                        </>
                                    ) : (
                                        <span className="text-xs font-bold text-brand-blue" aria-current="page">{crumb}</span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                </Box>
                <Box>
                    <Meta>Truncated — deep path</Meta>
                    <nav aria-label="Breadcrumb">
                        <ol className="flex items-center gap-1 flex-wrap">
                            <li className="flex items-center gap-1">
                                <button className="text-xs text-brand-lightBlue hover:text-brand-blue font-medium transition-colors">Home</button>
                                <ChevronRight size={12} className="text-brand-blue/30" aria-hidden="true" />
                            </li>
                            <li className="flex items-center gap-1">
                                <span className="text-xs text-brand-blue/40 px-1">…</span>
                                <ChevronRight size={12} className="text-brand-blue/30" aria-hidden="true" />
                            </li>
                            <li className="flex items-center gap-1">
                                <button className="text-xs text-brand-lightBlue hover:text-brand-blue font-medium transition-colors">Committee</button>
                                <ChevronRight size={12} className="text-brand-blue/30" aria-hidden="true" />
                            </li>
                            <li className="flex items-center">
                                <span className="text-xs font-bold text-brand-blue" aria-current="page">Meeting Notes — March 2026</span>
                            </li>
                        </ol>
                    </nav>
                </Box>
            </Grid>

            <Grid cols={2}>
                <Box dark>
                    <Meta light>Simple breadcrumb — dark</Meta>
                    <nav aria-label="Breadcrumb">
                        <ol className="flex items-center gap-1 flex-wrap">
                            {['Dashboard', 'Directory', 'Alice Johnson'].map((crumb, i, arr) => (
                                <li key={crumb} className="flex items-center gap-1">
                                    {i < arr.length - 1 ? (
                                        <>
                                            <button className="text-xs text-white/55 hover:text-white font-medium transition-colors">{crumb}</button>
                                            <ChevronRight size={12} className="text-white/25" aria-hidden="true" />
                                        </>
                                    ) : (
                                        <span className="text-xs font-bold text-white" aria-current="page">{crumb}</span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                    <p className="text-[10px] text-white/40 mt-3">Links: <code className="font-mono bg-white/10 px-1 rounded">text-white/55</code> → <code className="font-mono bg-white/10 px-1 rounded">text-white</code>. Current: <code className="font-mono bg-white/10 px-1 rounded">text-white font-bold</code>. Separator: <code className="font-mono bg-white/10 px-1 rounded">text-white/25</code>.</p>
                </Box>
                <Box dark>
                    <Meta light>Truncated — dark</Meta>
                    <nav aria-label="Breadcrumb">
                        <ol className="flex items-center gap-1 flex-wrap">
                            <li className="flex items-center gap-1">
                                <button className="text-xs text-white/55 hover:text-white font-medium transition-colors">Home</button>
                                <ChevronRight size={12} className="text-white/25" aria-hidden="true" />
                            </li>
                            <li className="flex items-center gap-1">
                                <span className="text-xs text-white/35 px-1">…</span>
                                <ChevronRight size={12} className="text-white/25" aria-hidden="true" />
                            </li>
                            <li className="flex items-center gap-1">
                                <button className="text-xs text-white/55 hover:text-white font-medium transition-colors">Committee</button>
                                <ChevronRight size={12} className="text-white/25" aria-hidden="true" />
                            </li>
                            <li className="flex items-center">
                                <span className="text-xs font-bold text-white" aria-current="page">Meeting Notes</span>
                            </li>
                        </ol>
                    </nav>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Tabs ─────────────────────────────────────────────────────

function TabsSection() {
    const [uLineTab, setULineTab] = useState(0);
    const [pillTab, setPillTab] = useState(0);

    return (
        <Section id="tabs" title="Tabs" icon={Layers}>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Underline tabs — interactive</Meta>
                    <div className="border-b-2 border-brand-blue/10 flex gap-0 mb-4">
                        {['Overview', 'Members', 'Events', 'Settings'].map((tab, i) => (
                            <button key={tab} disabled={i === 3}
                                onClick={() => i !== 3 && setULineTab(i)}
                                className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-0.5 transition-all whitespace-nowrap
                                    ${i === uLineTab ? 'border-brand-blue text-brand-blue'
                                        : i === 3 ? 'border-transparent text-brand-blue/30 cursor-not-allowed'
                                        : 'border-transparent text-brand-blue/50 hover:text-brand-blue/75 hover:border-brand-blue/30'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-brand-blue/55">Active: <code className="font-mono bg-brand-bgLight px-1 rounded">border-brand-blue</code> + full opacity text. Disabled: /30 + pointer-events-none.</p>
                </Box>
                <Box>
                    <Meta>Pill tabs — interactive</Meta>
                    <div className="flex gap-1.5 flex-wrap mb-4 p-1 bg-brand-bgLight rounded-tl-xl rounded-br-xl">
                        {['All', 'Active', 'Pending', 'Archived'].map((tab, i) => (
                            <button key={tab} onClick={() => setPillTab(i)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-tl-lg rounded-br-lg transition-all whitespace-nowrap
                                ${i === pillTab
                                    ? 'bg-white text-brand-blue shadow-[2px_2px_0px_0px_rgba(57,103,153,0.1)] border border-brand-blue/15'
                                    : 'text-brand-blue/55 hover:text-brand-blue hover:bg-white/60'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-brand-blue/55">Active pill: white bg + subtle shadow + border. Container: brand-bgLight with large asymmetric radius.</p>
                </Box>
            </Grid>

            <Grid cols={2}>
                <Box dark>
                    <Meta light>Underline tabs — dark</Meta>
                    <div className="border-b border-white/15 flex gap-0 mb-4">
                        {['Overview', 'Members', 'Events', 'Settings'].map((tab, i) => (
                            <button key={tab} disabled={i === 3}
                                onClick={() => i !== 3 && setULineTab(i)}
                                className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-all whitespace-nowrap
                                    ${i === uLineTab ? 'border-white text-white'
                                        : i === 3 ? 'border-transparent text-white/25 cursor-not-allowed'
                                        : 'border-transparent text-white/45 hover:text-white/75 hover:border-white/30'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-white/40">Active: <code className="font-mono bg-white/10 px-1 rounded">border-white text-white</code>. Inactive: <code className="font-mono bg-white/10 px-1 rounded">text-white/45</code>. Disabled: <code className="font-mono bg-white/10 px-1 rounded">text-white/25</code>.</p>
                </Box>
                <Box dark>
                    <Meta light>Pill tabs — dark</Meta>
                    <div className="flex gap-1.5 flex-wrap mb-4 p-1 bg-white/8 rounded-tl-xl rounded-br-xl">
                        {['All', 'Active', 'Pending', 'Archived'].map((tab, i) => (
                            <button key={tab} onClick={() => setPillTab(i)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-tl-lg rounded-br-lg transition-all whitespace-nowrap
                                ${i === pillTab
                                    ? 'bg-white/20 text-white border border-white/25 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]'
                                    : 'text-white/45 hover:text-white/75 hover:bg-white/10'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-white/40">Container: <code className="font-mono bg-white/10 px-1 rounded">bg-white/8</code>. Active pill: <code className="font-mono bg-white/10 px-1 rounded">bg-white/20 border-white/25</code>. Inactive: <code className="font-mono bg-white/10 px-1 rounded">text-white/45</code>.</p>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Pagination ───────────────────────────────────────────────

function PaginationSection() {
    const [page, setPage] = useState(2);
    const PAGES = [1, 2, 3, null, 8, 9, 10] as (number | null)[];

    return (
        <Section id="pagination" title="Pagination" icon={MoreHorizontal}>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Standard pagination — interactive</Meta>
                    <div className="flex items-center gap-1 flex-wrap mb-4">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-tl-lg rounded-br-lg border-2 border-brand-blue/15 bg-white text-brand-blue/50 hover:text-brand-blue hover:border-brand-blue/30 transition-all" aria-label="Previous page">
                            <ChevronLeft size={14} aria-hidden="true" />
                        </button>
                        {PAGES.map((p, i) => (
                            p === null ? (
                                <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-brand-blue/40 text-xs">…</span>
                            ) : (
                                <button key={p} onClick={() => setPage(p)} aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined}
                                    className={`w-8 h-8 flex items-center justify-center rounded-tl-lg rounded-br-lg border-2 text-xs font-bold transition-all
                                        ${p === page
                                            ? 'bg-brand-blue border-brand-blue text-white shadow-[2px_2px_0px_0px_rgba(10,22,48,0.4)]'
                                            : 'border-brand-blue/15 bg-white text-brand-blue/65 hover:text-brand-blue hover:border-brand-blue/30'}`}>
                                    {p}
                                </button>
                            )
                        ))}
                        <button onClick={() => setPage(p => Math.min(10, p + 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-tl-lg rounded-br-lg border-2 border-brand-blue/15 bg-white text-brand-blue/50 hover:text-brand-blue hover:border-brand-blue/30 transition-all" aria-label="Next page">
                            <ChevronRight size={14} aria-hidden="true" />
                        </button>
                    </div>
                    <p className="text-xs text-brand-blue/55">Active: filled brand-blue + white text + ink shadow. Prev/Next: bordered. Ellipsis: plain text.</p>
                </Box>
                <Box dark>
                    <Meta light>Pagination — dark surface</Meta>
                    <div className="flex items-center gap-1 flex-wrap mb-4">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-tl-lg rounded-br-lg border border-white/20 bg-white/10 text-white/45 hover:text-white/75 hover:border-white/30 transition-all" aria-label="Previous page">
                            <ChevronLeft size={14} aria-hidden="true" />
                        </button>
                        {PAGES.map((p, i) => (
                            p === null ? (
                                <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-white/35 text-xs">…</span>
                            ) : (
                                <button key={p} onClick={() => setPage(p)} aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined}
                                    className={`w-8 h-8 flex items-center justify-center rounded-tl-lg rounded-br-lg border text-xs font-bold transition-all
                                        ${p === page
                                            ? 'bg-brand-yellow border-brand-yellow text-brand-blue shadow-[2px_2px_0px_0px_rgba(0,0,0,0.35)]'
                                            : 'border-white/15 bg-white/10 text-white/55 hover:text-white/80 hover:border-white/25'}`}>
                                    {p}
                                </button>
                            )
                        ))}
                        <button onClick={() => setPage(p => Math.min(10, p + 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-tl-lg rounded-br-lg border border-white/20 bg-white/10 text-white/45 hover:text-white/75 hover:border-white/30 transition-all" aria-label="Next page">
                            <ChevronRight size={14} aria-hidden="true" />
                        </button>
                    </div>
                    <p className="text-[10px] text-white/40">Active: <code className="font-mono bg-white/10 px-1 rounded">bg-brand-yellow text-brand-blue</code>. Default: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10 border-white/15</code>.</p>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Search ───────────────────────────────────────────────────

function SearchSection() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchVal, setSearchVal] = useState('');

    return (
        <Section id="search" title="Search" icon={Search}>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Search bar + result dropdown — light</Meta>
                    <div className="relative">
                        <div className={`flex items-center gap-2 px-3 py-2.5 border-2 rounded-tl-lg rounded-br-lg bg-white transition-[border-color,box-shadow] duration-150 ${searchOpen ? 'border-brand-lightBlue ring-2 ring-brand-blue/20' : 'border-brand-blue/25'}`}>
                            <Search size={14} className="text-brand-blue/40 flex-shrink-0" aria-hidden="true" />
                            <input
                                type="search"
                                placeholder="Search members, events, resources…"
                                value={searchVal}
                                onChange={e => setSearchVal(e.target.value)}
                                onFocus={() => setSearchOpen(true)}
                                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                                className="flex-1 bg-transparent text-sm text-brand-blue placeholder-brand-blue/35 outline-none"
                                aria-label="Search" aria-autocomplete="list" aria-controls="search-result-list"
                                aria-expanded={searchOpen}
                            />
                            <kbd className="text-[9px] font-mono text-brand-blue/30 bg-brand-bgLight px-1.5 py-0.5 rounded border border-brand-blue/10 hidden sm:inline">⌘K</kbd>
                        </div>
                        {searchOpen && (
                            <div id="search-result-list" role="listbox"
                                className="absolute top-full mt-1 w-full bg-white border-2 border-brand-blue/15 rounded-tl-xl rounded-br-xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] overflow-hidden z-10">
                                <div className="px-3 pt-2.5 pb-1">
                                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-brand-blue/40">Members</p>
                                </div>
                                {['Alice Johnson', 'Aiden Lee', 'Amara Obi']
                                    .filter(n => !searchVal || n.toLowerCase().includes(searchVal.toLowerCase()))
                                    .map((name, i) => (
                                        <div key={name} role="option" aria-selected={i === 0}
                                            className={`flex items-center gap-2.5 px-3 py-2 transition-colors cursor-pointer ${i === 0 ? 'bg-brand-bgLight' : 'hover:bg-brand-bgLight'}`}>
                                            <UserAvatar name={name} size="xs" />
                                            <span className="text-sm text-brand-blue/80">{name}</span>
                                        </div>
                                    ))}
                                <div className="px-3 py-2 border-t border-brand-blue/8">
                                    <p className="text-xs text-brand-lightBlue font-medium">See all results →</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Box>
                <Box dark>
                    <Meta light>Search — dark surface</Meta>
                    <div>
                        <div className="flex items-center gap-2 px-3 py-2.5 border border-white/20 rounded-tl-lg rounded-br-lg bg-white/10 ring-2 ring-white/15 mb-1">
                            <Search size={14} className="text-white/40 flex-shrink-0" aria-hidden="true" />
                            <span className="flex-1 text-sm text-white/35">Search members, events…</span>
                            <kbd className="text-[9px] font-mono text-white/25 bg-white/8 px-1.5 py-0.5 rounded border border-white/15 hidden sm:inline">⌘K</kbd>
                        </div>
                        <div className="bg-white/10 border border-white/15 rounded-tl-xl rounded-br-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                            <div className="px-3 pt-2.5 pb-1">
                                <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/35">Members</p>
                            </div>
                            {['Alice Johnson', 'Aiden Lee'].map((name, i) => (
                                <div key={name} className={`flex items-center gap-2.5 px-3 py-2 ${i === 0 ? 'bg-white/10' : ''}`}>
                                    <UserAvatar name={name} size="xs" />
                                    <span className="text-sm text-white/70">{name}</span>
                                </div>
                            ))}
                            <div className="px-3 py-2 border-t border-white/10">
                                <p className="text-xs text-white/45 font-medium">See all results →</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-white/40 mt-3">Input: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10 border-white/20</code>. Focused ring: <code className="font-mono bg-white/10 px-1 rounded">ring-white/15</code>. Dropdown: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10 border-white/15</code>. Selected row: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10</code>.</p>
                    </div>
                </Box>
            </Grid>
            <Callout>
                Search is composed from the <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">Input</code> component + a positioned <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">role="listbox"</code> dropdown. Show <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">⌘K</code> shortcut hint on sm+. Group results by entity type with section headers.
            </Callout>
        </Section>
    );
}

// ─── Default export ────────────────────────────────────────────

export default function NavSection() {
    return (
        <>
            <NavigationSection />
            <BreadcrumbsSection />
            <TabsSection />
            <PaginationSection />
            <SearchSection />
        </>
    );
}
