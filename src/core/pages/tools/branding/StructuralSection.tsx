import { Layout, Sparkles, BookOpen, Users, Lock, Star, Search } from 'lucide-react';
import { Button } from '@/design';
import { PageHeader, EmptyState, Skeleton } from '@/design';
import { DashboardSectionTitle } from '@/design';
import { Section, Meta, Box, Grid, Callout } from './shared';

// ─── Page Headers ─────────────────────────────────────────────

function HeadersSection() {
    return (
        <Section id="headers" title="Page Header" icon={Layout}>
            <Callout>
                <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">PageHeader</code> does not hardcode <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">mb-8</code>. Callers add their own spacing. Use <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">className="mb-6"</code> or <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">mb-8</code> as needed.
            </Callout>
            {/* Light variants */}
            <div className="space-y-4 mb-6">
                <div>
                    <Meta>card / lg (default) — most workspace pages</Meta>
                    <PageHeader title="Dashboard Overview"
                        subtitle="Track team performance, events, and resources."
                        variant="card" size="lg"
                        action={<Button variant="primary" size="sm"><Star size={14} aria-hidden={true as any} /> New Event</Button>} />
                </div>
                <div>
                    <Meta>card / sm — secondary or filter-heavy pages</Meta>
                    <PageHeader title="Resource Library"
                        subtitle="Browse and download shared learning materials."
                        variant="card" size="sm"
                        action={<Button variant="outline" size="sm">Upload</Button>} />
                </div>
                <Grid cols={2}>
                    <div>
                        <Meta>ghost / lg — inline heading without card chrome</Meta>
                        <PageHeader title="Weekly Hub"
                            subtitle="Your weekly schedule and commitments."
                            variant="ghost" size="lg" />
                    </div>
                    <div>
                        <Meta>ghost / sm — compact inline heading</Meta>
                        <PageHeader title="Committee Settings"
                            variant="ghost" size="sm" />
                    </div>
                </Grid>
            </div>

            {/* Dark variants — all four */}
            <Grid cols={2}>
                <Box dark>
                    <Meta light>card / lg — dark surface</Meta>
                    <div className="rounded-tl-2xl rounded-br-2xl bg-white/8 border-2 border-white/15 px-5 py-5 min-h-[130px] flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/65 mb-1">YQL Platform</p>
                                <h2 className="font-display font-extrabold text-2xl text-white leading-tight">Dashboard Overview</h2>
                                <p className="text-sm text-white/60 mt-1">Track team performance, events, and resources.</p>
                            </div>
                            <button className="flex-shrink-0 px-3 py-1.5 bg-brand-yellow text-brand-blue text-xs font-extrabold rounded-tl-lg rounded-br-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:bg-white transition-colors whitespace-nowrap">
                                + New Event
                            </button>
                        </div>
                    </div>
                    <p className="text-[10px] text-white/60 mt-2"><code className="font-mono bg-white/10 px-1 rounded">bg-white/8 border-white/15</code> card · yellow CTA · subtitle <code className="font-mono bg-white/10 px-1 rounded">text-white/60</code>.</p>
                </Box>
                <Box dark>
                    <Meta light>card / sm — dark surface</Meta>
                    <div className="rounded-tl-2xl rounded-br-2xl bg-white/8 border-2 border-white/15 px-5 py-3.5 min-h-[96px] flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/65 mb-0.5">Resource Library</p>
                                <h2 className="font-display font-extrabold text-lg text-white leading-tight">Resource Library</h2>
                                <p className="text-sm text-white/70 mt-0.5">Browse and download shared materials.</p>
                            </div>
                            <button className="flex-shrink-0 px-3 py-1.5 border border-white/25 text-white/75 text-xs font-bold rounded-tl-lg rounded-br-lg hover:border-white/45 hover:text-white transition-colors whitespace-nowrap">
                                Upload
                            </button>
                        </div>
                    </div>
                    <p className="text-[10px] text-white/60 mt-2">sm card: <code className="font-mono bg-white/10 px-1 rounded">min-h-[96px]</code>. Outline action: <code className="font-mono bg-white/10 px-1 rounded">border-white/25</code>.</p>
                </Box>
            </Grid>
            <Grid cols={2} className="mt-3">
                <Box dark>
                    <Meta light>ghost / lg — dark surface</Meta>
                    <div className="pb-4 border-b-2 border-white/10">
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/60 mb-1">Weekly Hub</p>
                        <h2 className="font-display font-extrabold text-2xl text-white">Weekly Hub</h2>
                        <p className="text-sm text-white/70 mt-1">Your weekly schedule and commitments.</p>
                    </div>
                    <p className="text-[10px] text-white/60 mt-3">Ghost on dark: no card chrome — use <code className="font-mono bg-white/10 px-1 rounded">border-b border-white/10</code> as section divider.</p>
                </Box>
                <Box dark>
                    <Meta light>ghost / sm — dark surface</Meta>
                    <div className="pb-3 border-b border-white/10">
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/60 mb-0.5">Committee Settings</p>
                        <h2 className="font-display font-extrabold text-base text-white">Committee Settings</h2>
                    </div>
                    <p className="text-[10px] text-white/60 mt-3">Ghost sm: compact heading, <code className="font-mono bg-white/10 px-1 rounded">text-base</code>. Use for sub-page headings inside panels.</p>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Empty States + Loading ───────────────────────────────────

function EmptyLoadingSection() {
    return (
        <Section id="empty" title="Empty States + Loading" icon={Sparkles}>
            <DashboardSectionTitle>Empty States</DashboardSectionTitle>
            <Grid cols={3} className="mb-4">
                <Box className="flex flex-col items-center justify-center min-h-[180px]">
                    <EmptyState icon={BookOpen} title="No resources yet"
                        description="Resources shared by your team will appear here."
                        action={<Button variant="primary" size="sm">Upload First</Button>} />
                </Box>
                <Box className="flex flex-col items-center justify-center min-h-[180px]">
                    <EmptyState icon={Users} title="No members found"
                        description="Try adjusting your search or filter." />
                </Box>
                <Box className="flex flex-col items-center justify-center min-h-[180px]">
                    <EmptyState icon={Lock} title="Access restricted"
                        description="You need a higher role to view this." />
                </Box>
            </Grid>

            {/* Dark empty states */}
            <Grid cols={2} className="mb-8">
                <Box dark className="flex flex-col items-center justify-center min-h-[180px]">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-white/10 border-2 border-white/20 rounded-tl-xl rounded-br-xl flex items-center justify-center mb-3">
                            <Search size={18} className="text-white/65" aria-hidden="true" />
                        </div>
                        <p className="font-display font-extrabold text-sm text-white mb-1">No results found</p>
                        <p className="text-xs text-white/65 max-w-[180px] leading-relaxed">Try adjusting your search or removing filters.</p>
                        <button className="mt-4 px-3 py-1.5 bg-white/10 border border-white/20 rounded-tl-lg rounded-br-lg text-xs font-bold text-white/75 hover:bg-white/15 hover:text-white transition-colors">
                            Clear filters
                        </button>
                    </div>
                </Box>
                <Box dark className="flex flex-col items-center justify-center min-h-[180px]">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-white/10 border-2 border-white/20 rounded-tl-xl rounded-br-xl flex items-center justify-center mb-3">
                            <Lock size={18} className="text-white/65" aria-hidden="true" />
                        </div>
                        <p className="font-display font-extrabold text-sm text-white mb-1">Access restricted</p>
                        <p className="text-xs text-white/65 max-w-[180px] leading-relaxed">You need a higher role to view this content.</p>
                    </div>
                    <p className="text-[10px] text-white/70 mt-4">Icon container: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10 border-white/20</code>. Title: <code className="font-mono bg-white/10 px-1 rounded">text-white</code>. Body: <code className="font-mono bg-white/10 px-1 rounded">text-white/65</code>.</p>
                </Box>
            </Grid>

            <DashboardSectionTitle>Loading Patterns</DashboardSectionTitle>
            <Grid cols={3} className="mb-8">
                <Box className="flex flex-col items-center justify-center gap-3 py-10 min-h-[160px]">
                    <Meta>Full-page / workspace</Meta>
                    <div
                        role="status" aria-label="Loading"
                        className="w-12 h-12 border-4 border-brand-blue/15 border-t-brand-blue rounded-full motion-safe:animate-spin"
                    />
                    <p className="text-xs font-extrabold uppercase tracking-widest text-brand-blue/65">Loading…</p>
                </Box>
                <Box className="flex flex-col items-center justify-center gap-3 py-10 min-h-[160px]">
                    <Meta>Auth gate / pulse block</Meta>
                    <div
                        role="status" aria-label="Loading"
                        className="w-10 h-10 rounded-tl-2xl rounded-br-2xl bg-brand-lightBlue border-4 border-brand-blue motion-safe:animate-pulse"
                    />
                    <p className="text-sm font-semibold text-brand-blue/65 tracking-wide">Loading…</p>
                </Box>
                <Box className="flex flex-col items-center justify-center gap-3 py-10 min-h-[160px]">
                    <Meta>Inline / button feedback</Meta>
                    <div className="flex items-center gap-2">
                        <div
                            role="status" aria-label="Saving"
                            className="w-4 h-4 border-2 border-brand-blue/20 border-t-brand-blue rounded-full motion-safe:animate-spin"
                        />
                        <span className="text-sm text-brand-blue/70 font-medium">Saving…</span>
                    </div>
                </Box>
            </Grid>

            {/* Dark loading */}
            <Grid cols={3} className="mb-8">
                <Box dark className="flex flex-col items-center justify-center gap-3 py-10 min-h-[160px]">
                    <Meta light>Spinner on dark</Meta>
                    <div
                        role="status" aria-label="Loading"
                        className="w-12 h-12 border-4 border-white/15 border-t-white rounded-full motion-safe:animate-spin"
                    />
                    <p className="text-xs font-extrabold uppercase tracking-widest text-white/65">Loading…</p>
                </Box>
                <Box dark className="flex flex-col items-center justify-center gap-3 py-10 min-h-[160px]">
                    <Meta light>Pulse block on dark</Meta>
                    <div
                        role="status" aria-label="Loading"
                        className="w-10 h-10 rounded-tl-2xl rounded-br-2xl bg-white/20 border-4 border-white/30 motion-safe:animate-pulse"
                    />
                    <p className="text-sm font-semibold text-white/65 tracking-wide">Loading…</p>
                </Box>
                <Box dark className="flex flex-col items-center justify-center gap-3 py-10 min-h-[160px]">
                    <Meta light>Inline on dark</Meta>
                    <div className="flex items-center gap-2">
                        <div
                            role="status" aria-label="Saving"
                            className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full motion-safe:animate-spin"
                        />
                        <span className="text-sm text-white/60 font-medium">Saving…</span>
                    </div>
                </Box>
            </Grid>

            <DashboardSectionTitle>Skeleton Loading</DashboardSectionTitle>
            <Callout>
                Skeletons replace content during initial page load — shaped to match the incoming content exactly. Use <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">motion-safe:animate-pulse</code>. Never use skeleton for user-triggered actions — use a spinner instead.
            </Callout>
            <Grid cols={3} className="mb-4">
                <Box>
                    <Meta>Text lines — light</Meta>
                    <Skeleton variant="line" lines={4} />
                </Box>
                <Box>
                    <Meta>Card skeleton — light</Meta>
                    <Skeleton variant="card" />
                </Box>
                <Box>
                    <Meta>List row skeleton — light</Meta>
                    <Skeleton variant="list" />
                </Box>
            </Grid>
            <Grid cols={3}>
                <Box dark>
                    <Meta light>Text lines — dark</Meta>
                    <Skeleton variant="line" lines={4} dark />
                </Box>
                <Box dark>
                    <Meta light>Card skeleton — dark</Meta>
                    <Skeleton variant="card" dark />
                </Box>
                <Box dark>
                    <Meta light>List row skeleton — dark</Meta>
                    <Skeleton variant="list" dark />
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Default export ────────────────────────────────────────────

export default function StructuralSection() {
    return (
        <>
            <HeadersSection />
            <EmptyLoadingSection />
        </>
    );
}
