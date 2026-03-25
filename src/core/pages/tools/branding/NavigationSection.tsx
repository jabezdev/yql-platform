import { useState } from 'react';
import { Layout, ChevronRight, MoreHorizontal, Search, Layers, Users, Calendar, BookOpen } from 'lucide-react';
import { SidebarItem, SidebarLabel, Breadcrumbs, Tabs, TabsList, TabsTrigger, Pagination, Avatar } from '@/design';
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
                            <SidebarLabel>Main</SidebarLabel>
                            {[
                                { icon: Layout, label: 'Dashboard', active: true },
                                { icon: Users, label: 'Directory', active: false },
                                { icon: Calendar, label: 'Calendar', active: false },
                                { icon: BookOpen, label: 'Resources', active: false },
                            ].map(({ icon: Icon, label, active }) => (
                                <SidebarItem key={label} icon={Icon} label={label} active={active} />
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
                    <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Directory' }, { label: 'Alice Johnson' }]} />
                </Box>
                <Box>
                    <Meta>Truncated — deep path</Meta>
                    <Breadcrumbs items={[{ label: 'Home' }, { label: '…' }, { label: 'Committee' }, { label: 'Meeting Notes — March 2026' }]} />
                </Box>
            </Grid>

            <Grid cols={2}>
                <Box dark>
                    <Meta light>Simple breadcrumb — dark</Meta>
                    <Breadcrumbs dark items={[{ label: 'Dashboard' }, { label: 'Directory' }, { label: 'Alice Johnson' }]} />
                    <p className="text-[10px] text-white/40 mt-3">Links: <code className="font-mono bg-white/10 px-1 rounded">text-white/55</code> → <code className="font-mono bg-white/10 px-1 rounded">text-white</code>. Current: <code className="font-mono bg-white/10 px-1 rounded">text-white font-bold</code>. Separator: <code className="font-mono bg-white/10 px-1 rounded">text-white/25</code>.</p>
                </Box>
                <Box dark>
                    <Meta light>Truncated — dark</Meta>
                    <Breadcrumbs dark items={[{ label: 'Home' }, { label: '…' }, { label: 'Committee' }, { label: 'Meeting Notes' }]} />
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Tabs ─────────────────────────────────────────────────────

function TabsSection() {
    const [uLineTab, setULineTab] = useState('Overview');
    const [pillTab, setPillTab] = useState('All');

    return (
        <Section id="tabs" title="Tabs" icon={Layers}>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Underline tabs — interactive</Meta>
                    <Tabs value={uLineTab} onValueChange={setULineTab} variant="underline" className="mb-4">
                        <TabsList>
                            {['Overview', 'Members', 'Events', 'Settings'].map((tab, i) => (
                                <TabsTrigger key={tab} value={tab} disabled={i === 3}>
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <p className="text-[10px] text-brand-blue/55">Active: <code className="font-mono bg-brand-bgLight px-1 rounded">border-brand-blue</code> + full opacity text. Disabled: /30 + pointer-events-none.</p>
                </Box>
                <Box>
                    <Meta>Pill tabs — interactive</Meta>
                    <Tabs value={pillTab} onValueChange={setPillTab} variant="pill" className="mb-4">
                        <TabsList>
                            {['All', 'Active', 'Pending', 'Archived'].map((tab) => (
                                <TabsTrigger key={tab} value={tab}>
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <p className="text-[10px] text-brand-blue/55">Active pill: white bg + subtle shadow + border. Container: brand-bgLight with large asymmetric radius.</p>
                </Box>
            </Grid>

            <Grid cols={2}>
                <Box dark>
                    <Meta light>Underline tabs — dark</Meta>
                    <Tabs value={uLineTab} onValueChange={setULineTab} variant="underline" dark className="mb-4">
                        <TabsList>
                            {['Overview', 'Members', 'Events', 'Settings'].map((tab, i) => (
                                <TabsTrigger key={tab} value={tab} disabled={i === 3}>
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <p className="text-[10px] text-white/40">Active: <code className="font-mono bg-white/10 px-1 rounded">border-white text-white</code>. Inactive: <code className="font-mono bg-white/10 px-1 rounded">text-white/45</code>. Disabled: <code className="font-mono bg-white/10 px-1 rounded">text-white/25</code>.</p>
                </Box>
                <Box dark>
                    <Meta light>Pill tabs — dark</Meta>
                    <Tabs value={pillTab} onValueChange={setPillTab} variant="pill" dark className="mb-4">
                        <TabsList>
                            {['All', 'Active', 'Pending', 'Archived'].map((tab) => (
                                <TabsTrigger key={tab} value={tab}>
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <p className="text-[10px] text-white/40">Container: <code className="font-mono bg-white/10 px-1 rounded">bg-white/8</code>. Active pill: <code className="font-mono bg-white/10 px-1 rounded">bg-white/20 border-white/25</code>. Inactive: <code className="font-mono bg-white/10 px-1 rounded">text-white/45</code>.</p>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Pagination ───────────────────────────────────────────────

function PaginationSection({ page, setPage }: { page: number; setPage: (p: number) => void }) {
    return (
        <Section id="pagination" title="Pagination" icon={MoreHorizontal}>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Standard pagination — interactive</Meta>
                    <Pagination page={page} totalPages={10} onPageChange={setPage} className="mb-4" />
                    <p className="text-xs text-brand-blue/55">Active: filled brand-blue + white text + ink shadow. Prev/Next: bordered. Ellipsis: plain text.</p>
                </Box>
                <Box dark>
                    <Meta light>Pagination — dark surface</Meta>
                    <Pagination page={page} totalPages={10} onPageChange={setPage} dark className="mb-4" />
                    <p className="text-[10px] text-white/40">Active: <code className="font-mono bg-white/10 px-1 rounded">bg-brand-yellow text-brand-blue</code>. Default: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10 border-white/15</code>.</p>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Search ───────────────────────────────────────────────────

function SearchSection({ searchOpen, setSearchOpen, searchVal, setSearchVal }: { searchOpen: boolean, setSearchOpen: (v: boolean) => void, searchVal: string, setSearchVal: (v: string) => void }) {
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
                                            <Avatar name={name} size="xs" />
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
                                    <Avatar name={name} size="xs" />
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
    const [page, setPage] = useState(2);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchVal, setSearchVal] = useState('');

    return (
        <>
            <NavigationSection />
            <BreadcrumbsSection />
            <TabsSection />
            <PaginationSection page={page} setPage={setPage} />
            <SearchSection searchOpen={searchOpen} setSearchOpen={setSearchOpen} searchVal={searchVal} setSearchVal={setSearchVal} />
        </>
    );
}
