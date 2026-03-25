import { MousePointer, Layers, BarChart2, Users, Calendar, Star, X, Shield, CheckCircle, type LucideIcon } from 'lucide-react';
import { Button } from '@/design';
import { Card } from '@/design';
import { DashboardCard, InfoCard, DashboardSectionTitle } from '@/design';
import { Section, Meta, Box, Grid, Callout, Row } from './shared';

// ─── Buttons ──────────────────────────────────────────────────

function ButtonsSection() {
    return (
        <Section id="buttons" title="Buttons" icon={MousePointer}>
            <Callout>
                <strong>Geometric variants</strong> (geometric-primary / geometric-secondary) are for landing page CTAs — larger, bigger radius, stronger shadow.&nbsp;
                <strong>Regular variants</strong> (primary / secondary / outline) are for workspace UI — compact, tighter radius.&nbsp;
                <strong>Ghost</strong> for low-emphasis inline actions.&nbsp;
                <strong>White</strong> for dark-background contexts only.&nbsp;
                <strong>Destructive</strong> for irreversible actions.
            </Callout>

            <div className="space-y-3">
                {/* Landing CTAs */}
                <Box>
                    <Meta>Landing CTAs — geometric-primary · geometric-secondary</Meta>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div className="sm:col-span-2">
                                <p className="text-[10px] text-brand-blue/50 mb-2">lg — hero section</p>
                                <Row>
                                    <Button variant="geometric-primary" size="lg">Apply Now →</Button>
                                    <Button variant="geometric-secondary" size="lg">Learn More</Button>
                                </Row>
                            </div>
                            <div>
                                <p className="text-[10px] text-brand-blue/50 mb-2">sm / disabled</p>
                                <Row>
                                    <Button variant="geometric-primary" size="sm">Apply</Button>
                                    <Button variant="geometric-primary" size="sm" disabled>Disabled</Button>
                                </Row>
                            </div>
                        </div>
                    </div>
                </Box>

                {/* Workspace variants */}
                <Box>
                    <Meta>Workspace — primary · secondary · outline · ghost</Meta>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[10px] text-brand-blue/55 border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-left font-extrabold uppercase tracking-widest pb-3 w-20">Size</th>
                                    <th className="text-left font-extrabold uppercase tracking-widest pb-3">primary</th>
                                    <th className="text-left font-extrabold uppercase tracking-widest pb-3">secondary</th>
                                    <th className="text-left font-extrabold uppercase tracking-widest pb-3">outline</th>
                                    <th className="text-left font-extrabold uppercase tracking-widest pb-3">ghost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(['md', 'sm'] as const).map(sz => (
                                    <tr key={sz} className="border-t border-brand-blue/5">
                                        <td className="pt-3 pr-4 font-mono text-[10px] text-brand-blue/45 align-middle">{sz}</td>
                                        <td className="pt-3 pr-4 align-middle"><Button variant="primary" size={sz}>Save</Button></td>
                                        <td className="pt-3 pr-4 align-middle"><Button variant="secondary" size={sz}>Cancel</Button></td>
                                        <td className="pt-3 pr-4 align-middle"><Button variant="outline" size={sz}><Star size={11} aria-hidden={true as any} /> Export</Button></td>
                                        <td className="pt-3 pr-4 align-middle"><Button variant="ghost" size={sz}>View All</Button></td>
                                    </tr>
                                ))}
                                <tr className="border-t border-brand-blue/5">
                                    <td className="pt-3 pr-4 font-mono text-[10px] text-brand-blue/45 align-middle">dis.</td>
                                    <td className="pt-3 pr-4 align-middle"><Button variant="primary" size="md" disabled>Disabled</Button></td>
                                    <td className="pt-3 pr-4 align-middle"><Button variant="secondary" size="md" disabled>Disabled</Button></td>
                                    <td className="pt-3 pr-4 align-middle"><Button variant="outline" size="md" disabled>Disabled</Button></td>
                                    <td className="pt-3 pr-4 align-middle"><Button variant="ghost" size="md" disabled>Disabled</Button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Box>

                {/* Destructive + White */}
                <Grid cols={2} className="mb-3">
                    <Box>
                        <Meta>destructive — irreversible actions</Meta>
                        <div className="space-y-2">
                            <Row>
                                <Button variant="destructive" size="md">Delete Member</Button>
                                <Button variant="destructive" size="sm"><X size={12} aria-hidden={true as any} /> Remove</Button>
                            </Row>
                            <Row>
                                <Button variant="destructive" size="md" disabled>Disabled</Button>
                            </Row>
                        </div>
                    </Box>
                    <Box dark>
                        <Meta light>white — on brand-lightBlue background only</Meta>
                        <div className="space-y-2">
                            <Row>
                                <Button variant="white" size="md">Confirm</Button>
                                <Button variant="white" size="sm">Dismiss</Button>
                            </Row>
                            <Row>
                                <Button variant="white" size="md" disabled>Disabled</Button>
                            </Row>
                        </div>
                    </Box>
                </Grid>

                {/* Dark mode workspace buttons */}
                <Box dark>
                    <Meta light>Workspace buttons on dark — primary · secondary · outline · ghost</Meta>
                    <div className="space-y-3">
                        {(['md', 'sm'] as const).map(sz => (
                            <div key={sz} className="flex items-center gap-3 flex-wrap">
                                <span className="text-[10px] font-mono text-white/35 w-5">{sz}</span>
                                {/* primary → yellow on dark for contrast */}
                                <button className={`font-bold rounded-tl-lg rounded-br-lg bg-brand-yellow text-brand-blue shadow-[2px_2px_0px_0px_rgba(0,0,0,0.35)] hover:bg-white transition-colors ${sz === 'md' ? 'px-4 py-2 text-xs' : 'px-3 py-1.5 text-xs'}`}>Save</button>
                                {/* secondary → ghost white border */}
                                <button className={`font-bold rounded-tl-lg rounded-br-lg border border-white/30 text-white/80 hover:border-white/55 hover:text-white transition-colors ${sz === 'md' ? 'px-4 py-2 text-xs' : 'px-3 py-1.5 text-xs'}`}>Cancel</button>
                                {/* outline → same as secondary but more prominent */}
                                <button className={`font-bold rounded-tl-lg rounded-br-lg border-2 border-white/25 text-white/70 hover:border-white/45 hover:text-white transition-colors ${sz === 'md' ? 'px-4 py-2 text-xs' : 'px-3 py-1.5 text-xs'}`}>Export</button>
                                {/* ghost → no border */}
                                <button className={`font-bold rounded-tl-lg rounded-br-lg text-white/50 hover:text-white/80 transition-colors ${sz === 'md' ? 'px-4 py-2 text-xs' : 'px-3 py-1.5 text-xs'}`}>View All</button>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-white/40 mt-3 leading-relaxed">Dark primary → <code className="font-mono bg-white/10 px-1 rounded">bg-brand-yellow text-brand-blue</code>. Secondary/outline → <code className="font-mono bg-white/10 px-1 rounded">border-white/25–30</code>. Ghost → no border, muted text.</p>
                </Box>
            </div>
        </Section>
    );
}

// ─── Cards ────────────────────────────────────────────────────

function CardsSection() {
    return (
        <Section id="cards" title="Cards" icon={Layers}>
            <Callout>
                <strong>Card</strong> — content layout containers (landing page, directory, resource cards). Smaller radius (tl-xl br-xl).&nbsp;
                <strong>DashboardCard</strong> — workspace data sections (wraps tables, lists, charts). Larger radius (tl-2xl br-2xl).&nbsp;
                <strong>InfoCard</strong> — compact icon + label highlight. Supports a numeric <code className="font-mono text-[10px]">value</code>, a short <code className="font-mono text-[10px]">description</code>, a <code className="font-mono text-[10px]">badge</code>, or custom <code className="font-mono text-[10px]">children</code> — not just stats.
            </Callout>

            <DashboardSectionTitle>Card.tsx — layout containers</DashboardSectionTitle>
            <Grid cols={3} className="mb-4">
                {([
                    { v: 'minimal', desc: 'White bg · subtle border · small shadow' },
                    { v: 'subtle', desc: 'bgLight bg · thin border · no shadow' },
                    { v: 'bordered', desc: 'White bg · full border weight · deeper shadow' },
                ] as const).map(({ v, desc }) => (
                    <div key={v}>
                        <Meta>{v}</Meta>
                        <Card variant={v}>
                            <div className="p-5">
                                <p className="font-display font-bold text-brand-blue capitalize">{v}</p>
                                <p className="text-sm text-brand-blue/65 mt-1">{desc}</p>
                            </div>
                        </Card>
                    </div>
                ))}
                <div>
                    <Meta>minimal + interactive</Meta>
                    <Card variant="minimal" interactive>
                        <div className="p-5">
                            <p className="font-display font-bold text-brand-blue">Interactive</p>
                            <p className="text-sm text-brand-blue/65 mt-1">Hover: lift up-left, border darkens</p>
                        </div>
                    </Card>
                </div>
                <div>
                    <Meta>bordered + interactive</Meta>
                    <Card variant="bordered" interactive>
                        <div className="p-5">
                            <p className="font-display font-bold text-brand-blue">Interactive Bordered</p>
                            <p className="text-sm text-brand-blue/65 mt-1">Stronger border emphasis + hover lift</p>
                        </div>
                    </Card>
                </div>
            </Grid>

            {/* Dark card equivalents */}
            <Grid cols={2} className="mb-8">
                <Box dark>
                    <Meta light>Card content on dark surface</Meta>
                    <div className="rounded-tl-xl rounded-br-xl border-2 border-white/15 bg-white/8 p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]">
                        <p className="font-display font-extrabold text-[10px] uppercase tracking-widest text-brand-yellow mb-2">Featured Resource</p>
                        <p className="font-display font-bold text-white text-base mb-1.5">Quantum Leadership Guide</p>
                        <p className="text-sm text-white/65 leading-relaxed">A comprehensive overview of leadership principles for emerging youth leaders.</p>
                    </div>
                    <p className="text-[10px] text-white/45 mt-3">Dark card: <code className="font-mono bg-white/10 px-1 rounded">bg-white/8</code> · <code className="font-mono bg-white/10 px-1 rounded">border-white/15</code> · white text hierarchy mirrors light.</p>
                </Box>
                <Box dark>
                    <Meta light>Interactive card on dark — hover lift</Meta>
                    <div className="rounded-tl-xl rounded-br-xl border-2 border-white/15 bg-white/8 p-5 cursor-pointer hover:bg-white/12 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-8 h-8 bg-brand-yellow/20 border border-brand-yellow/40 rounded-tl-lg rounded-br-lg flex items-center justify-center">
                                <Star size={14} className="text-brand-yellow" aria-hidden="true" />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/35">Hover me</span>
                        </div>
                        <p className="font-display font-bold text-white text-sm">Interactive Dark Card</p>
                        <p className="text-xs text-white/60 mt-1">Lift: <code className="font-mono bg-white/10 px-0.5 rounded">hover:bg-white/12 -translate-x-0.5 -translate-y-0.5</code></p>
                    </div>
                </Box>
            </Grid>

            <DashboardSectionTitle>DashboardCard.tsx — workspace sections</DashboardSectionTitle>
            <Grid cols={2} className="mb-8">
                {([
                    { v: 'default', desc: 'Interactive — hover lifts up-left. Use for clickable workspace panels.' },
                    { v: 'static', desc: 'Non-interactive — no hover animation. Use when the card is a container, not a button.' },
                    { v: 'glass', desc: 'bg-white/90 + backdrop-blur. Use over background imagery.' },
                    { v: 'stat', desc: 'Same as default but softer shadow at rest. Wraps StatCard grids.' },
                ] as const).map(({ v, desc }) => (
                    <div key={v}>
                        <Meta>{v}</Meta>
                        <DashboardCard variant={v}>
                            <p className="font-display font-bold text-brand-blue capitalize">{v}</p>
                            <p className="text-sm text-brand-blue/65 mt-1">{desc}</p>
                        </DashboardCard>
                    </div>
                ))}
            </Grid>

            <DashboardSectionTitle>InfoCard — icon highlight card</DashboardSectionTitle>
            <Callout>
                <strong>blue</strong> — default (members, sessions, count).&nbsp;
                <strong>yellow</strong> — high-value or achievement.&nbsp;
                <strong>green</strong> — positive completion or growth.&nbsp;
                <strong>wine</strong> — alert or attention-needed.&nbsp;
                Trend <strong>↑</strong> uses <code className="font-mono text-[10px]">brand-green</code>.
                Trend <strong>↓</strong> uses <code className="font-mono text-[10px]">brand-wine</code> — a data signal, not destructive.
            </Callout>

            {/* Stat mode — numeric value + trend */}
            <div className="mb-5">
                <Meta>value prop — numeric stats with trend badges</Meta>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <InfoCard icon={Users} label="Total Members" value="128" color="blue" trend={{ direction: 'up', value: '+12%' }} />
                    <InfoCard icon={Star} label="Resources" value="99" color="yellow" trend={{ direction: 'up', value: '+4' }} />
                    <InfoCard icon={Calendar} label="Events" value="12" color="green" trend={{ direction: 'up', value: '+7%' }} />
                    <InfoCard icon={BarChart2} label="Pending" value="14" color="wine" trend={{ direction: 'down', value: '−5%' }} />
                </div>
            </div>

            {/* Description mode — non-numeric highlight */}
            <div className="mb-5">
                <Meta>description prop — short text highlights (status, context, labels)</Meta>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <InfoCard icon={Shield} label="System Status" description="All services operational" color="green" badge={<span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm border bg-brand-green/10 text-brand-green border-brand-green/30">Live</span>} />
                    <InfoCard icon={Calendar} label="Next Event" description="Spring Cohort Kickoff — Apr 5" color="blue" />
                    <InfoCard icon={CheckCircle} label="Onboarding" description="Phase 2 of 3 complete" color="yellow" />
                    <InfoCard icon={Users} label="Current Cohort" description="Q2 2026 — 18 members" color="gray" />
                </div>
            </div>

            {/* Trend badge variants */}
            <div className="mb-6">
                <Meta>Trend badge variants — up · down · neutral · none</Meta>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <InfoCard icon={BarChart2} label="Up trend" value="128" color="blue" trend={{ direction: 'up', value: '+12%' }} />
                    <InfoCard icon={Users} label="Down trend" value="42" color="wine" trend={{ direction: 'down', value: '−5%' }} />
                    <InfoCard icon={Calendar} label="Neutral" value="7" color="gray" trend={{ direction: 'neutral', value: 'flat' }} />
                    <InfoCard icon={Star} label="No trend" value="99" color="yellow" />
                </div>
            </div>

            {/* Dark mode */}
            <Box dark>
                <Meta light>Dark mode — info cards on brand-blue surface</Meta>
                <div className="grid grid-cols-2 gap-3">
                    {([
                        { Icon: Users, label: 'Total Members', value: '128', iconBg: 'bg-brand-lightBlue/15 border border-brand-lightBlue/25', iconColor: 'text-brand-lightBlue', trend: { dir: 'up' as const, val: '+12%' } },
                        { Icon: Star, label: 'Resources', value: '99', iconBg: 'bg-brand-yellow/15 border border-brand-yellow/25', iconColor: 'text-brand-yellow', trend: { dir: 'up' as const, val: '+4' } },
                        { Icon: Calendar, label: 'Events', value: '12', iconBg: 'bg-brand-green/15 border border-brand-green/25', iconColor: 'text-brand-green', trend: { dir: 'down' as const, val: '−3%' } },
                        { Icon: BarChart2, label: 'Pending', value: '7', iconBg: 'bg-brand-wine/15 border border-brand-wine/25', iconColor: 'text-brand-wine', trend: null },
                    ] as { Icon: LucideIcon; label: string; value: string; iconBg: string; iconColor: string; trend: { dir: 'up' | 'down'; val: string } | null }[]).map(({ Icon, label, value, iconBg, iconColor, trend }) => (
                        <div key={label} className="bg-white/8 border-2 border-white/12 rounded-tl-2xl rounded-br-2xl p-4 transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5">
                            <div className="flex items-start justify-between gap-2">
                                <div className={`p-2 rounded-tl-lg rounded-br-lg shrink-0 ${iconBg}`}>
                                    <Icon size={20} className={iconColor} aria-hidden="true" />
                                </div>
                                {trend && (
                                    <span className={`mt-0.5 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                                        trend.dir === 'up'
                                            ? 'bg-brand-green/20 text-brand-green border-brand-green/45'
                                            : 'bg-brand-wine/20 text-brand-wine border-brand-wine/45'
                                    }`}>
                                        {trend.dir === 'up' ? '↑' : '↓'} {trend.val}
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-display font-extrabold text-white mt-3 leading-none">{value}</p>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mt-1.5">{label}</p>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-white/40 mt-4 leading-relaxed">
                    Dark info card: <code className="font-mono bg-white/10 px-1 rounded">bg-white/8 border-white/12</code>. Icon bg: color at <code className="font-mono bg-white/10 px-1 rounded">/15 fill + /25 border</code>. Value always <code className="font-mono bg-white/10 px-1 rounded">text-white</code>.
                </p>
            </Box>
        </Section>
    );
}

// ─── Default export ────────────────────────────────────────────

export default function ComponentsSection() {
    return (
        <>
            <ButtonsSection />
            <CardsSection />
        </>
    );
}
