import { Tag, BarChart2, TrendingUp, Image } from 'lucide-react';
import { StatusBadge, TrendBadge, ProgressBar, StepIndicator, Avatar } from '@/design';
import { Section, Meta, Box, Grid, Callout, Row } from './shared';

// ─── Badges ───────────────────────────────────────────────────

function BadgesSection() {
    return (
        <Section id="badges" title="Badges" icon={Tag}>
            <Callout>
                <strong>sm</strong> — inline metadata inside cards, tables, list items. Very compact.&nbsp;
                <strong>md</strong> — standalone status display in headers, drawers, profile views.
            </Callout>

            <Box className="mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <Meta>sm — inline / metadata usage</Meta>
                        <p className="text-xs text-brand-blue/65 mb-3">Sits alongside other content in tight spaces</p>
                        <div className="space-y-2">
                            {[
                                { v: 'success' as const, label: 'Active' },
                                { v: 'warning' as const, label: 'Pending' },
                                { v: 'error' as const, label: 'Rejected' },
                                { v: 'info' as const, label: 'Info' },
                                { v: 'neutral' as const, label: 'Draft' },
                            ].map(({ v, label }) => (
                                <div key={v} className="flex items-center gap-3">
                                    <StatusBadge status={label} variant={v} size="sm" />
                                    <span className="text-sm text-brand-blue/65">Member Name · Role · Committee</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Meta>md — standalone status display</Meta>
                        <p className="text-xs text-brand-blue/65 mb-3">Primary status indicator with breathing room</p>
                        <div className="space-y-3 flex flex-col items-start">
                            <StatusBadge status="Active" variant="success" size="md" />
                            <StatusBadge status="Pending Review" variant="warning" size="md" />
                            <StatusBadge status="Application Rejected" variant="error" size="md" />
                            <StatusBadge status="Stage 3 — Interview" variant="info" size="md" />
                            <StatusBadge status="Draft" variant="neutral" size="md" />
                        </div>
                    </div>
                </div>
            </Box>

            <Grid cols={2}>
                <Box>
                    <Meta>Trend badges — used in StatCard</Meta>
                    <Row>
                        <TrendBadge direction="up" value="+12%" />
                        <TrendBadge direction="down" value="−5%" />
                        <TrendBadge direction="flat" value="flat" />
                    </Row>
                </Box>
                <Box dark>
                    <Meta light>Trend badges — dark surface</Meta>
                    <Row>
                        <TrendBadge direction="up" value="+12%" dark />
                        <TrendBadge direction="down" value="−5%" dark />
                        <TrendBadge direction="flat" value="flat" dark />
                    </Row>
                    <p className="text-[10px] text-white/60 mt-4">Trend on dark: <code className="font-mono bg-white/10 px-1 rounded">/25</code> fill + <code className="font-mono bg-white/10 px-1 rounded">/55</code> border for higher contrast. Neutral: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10 text-white/65</code>.</p>
                </Box>
            </Grid>

            <Grid cols={2} className="mt-4">
                <Box>
                    <Meta>Status badges — sm + md (light)</Meta>
                    <div className="space-y-2.5">
                        {[
                            { label: 'Active', bg: 'bg-brand-green/10', text: 'text-brand-green', border: 'border-brand-green/25' },
                            { label: 'Pending', bg: 'bg-brand-yellow/15', text: 'text-brand-blue', border: 'border-brand-yellow/35' },
                            { label: 'Rejected', bg: 'bg-brand-red/10', text: 'text-brand-red', border: 'border-brand-red/25' },
                            { label: 'Draft', bg: 'bg-brand-bgLight', text: 'text-brand-blue/65', border: 'border-brand-blue/15' },
                        ].map(({ label, bg, text, border }) => (
                            <div key={label} className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${bg} ${text} ${border}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </Box>
                <Box dark>
                    <Meta light>Status badges — dark surface</Meta>
                    <div className="space-y-2.5">
                        {[
                            { label: 'Active', bg: 'bg-brand-green/25', text: 'text-brand-green', border: 'border-brand-green/55' },
                            { label: 'Pending', bg: 'bg-brand-yellow/20', text: 'text-brand-yellow', border: 'border-brand-yellow/50' },
                            { label: 'Rejected', bg: 'bg-brand-red/25', text: 'text-brand-red', border: 'border-brand-red/55' },
                            { label: 'Draft', bg: 'bg-white/10', text: 'text-white/65', border: 'border-white/25' },
                        ].map(({ label, bg, text, border }) => (
                            <div key={label} className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${bg} ${text} ${border}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                                    {label}
                                </span>
                                <span className="text-xs text-white/65">on brand-blue</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-white/60 mt-3">Dark: <code className="font-mono bg-white/10 px-1 rounded">/25</code> fill, <code className="font-mono bg-white/10 px-1 rounded">/55</code> border for stronger contrast. Pending text flips to <code className="font-mono bg-white/10 px-1 rounded">text-brand-yellow</code>.</p>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Tables ───────────────────────────────────────────────────

function TablesSection() {
    return (
        <Section id="tables" title="Tables" icon={BarChart2}>
            <Callout>
                Tables use semantic <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">&lt;thead&gt;</code> / <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">&lt;tbody&gt;</code>. Column headers are uppercase + tracked. Default row padding: <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">px-3 py-3</code>. Rows show hover bg on <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">group-hover</code>.
            </Callout>
            <Box className="mb-4">
                <Meta>Default density — member directory pattern</Meta>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-brand-blue/10">
                                {['Name', 'Role', 'Committee', 'Status', ''].map(col => (
                                    <th key={col} className="px-3 py-3 text-left text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/70 whitespace-nowrap">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Alice Johnson', role: 'Lead', committee: 'Technical', status: 'Active', badge: 'success' as const },
                                { name: 'Bob Chen', role: 'Member', committee: 'Creative', status: 'Pending', badge: 'warning' as const },
                                { name: 'Carlos Ramirez', role: 'Admin', committee: 'Operations', status: 'Active', badge: 'success' as const },
                            ].map((row, i) => (
                                <tr key={i} className="border-b border-brand-blue/5 hover:bg-brand-bgLight transition-colors group">
                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-2">
                                            <Avatar name={row.name} size="xs" />
                                            <span className="text-sm font-medium text-brand-blue">{row.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-brand-blue/65">{row.role}</td>
                                    <td className="px-3 py-3 text-sm text-brand-blue/65">{row.committee}</td>
                                    <td className="px-3 py-3"><StatusBadge status={row.status} variant={row.badge} size="sm" /></td>
                                    <td className="px-3 py-3">
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-brand-lightBlue hover:text-brand-blue">View →</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Box>

            <Grid cols={2}>
                <Box>
                    <Meta>Sort indicator</Meta>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-brand-blue cursor-pointer hover:text-brand-blue/80 mb-3">
                        Name <span>↑</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/65 cursor-pointer hover:text-brand-blue/70">
                        Role <span className="text-brand-blue/25">↕</span>
                    </div>
                    <p className="text-[10px] text-brand-blue/70 mt-3">Active: full opacity + ↑/↓. Inactive: /45 + ↕ ghost.</p>
                </Box>
                <Box dark>
                    <Meta light>Table row — on dark background</Meta>
                    <div className="overflow-hidden rounded-tl-lg rounded-br-lg border border-white/10">
                        <div className="border-b border-white/10 grid grid-cols-3 px-3 py-2">
                            {['Name', 'Role', 'Status'].map(col => (
                                <p key={col} className="text-[9px] font-extrabold uppercase tracking-widest text-white/60">{col}</p>
                            ))}
                        </div>
                        {[
                            { name: 'Alice Johnson', role: 'Lead', badge: { label: 'Active', cls: 'bg-brand-green/20 text-brand-green border-brand-green/40' } },
                            { name: 'Bob Chen', role: 'Member', badge: { label: 'Pending', cls: 'bg-brand-yellow/20 text-brand-yellow border-brand-yellow/40' } },
                        ].map((row, i) => (
                            <div key={i} className="grid grid-cols-3 items-center px-3 py-2.5 border-b border-white/8 last:border-0 hover:bg-white/5 transition-colors">
                                <span className="text-xs font-medium text-white/80 truncate">{row.name.split(' ')[0]}</span>
                                <span className="text-xs text-white/65">{row.role}</span>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border w-fit ${row.badge.cls}`}>{row.badge.label}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-white/60 mt-2">Header: <code className="font-mono bg-white/10 px-1 rounded">text-white/60</code>. Body: <code className="font-mono bg-white/10 px-1 rounded">text-white/80</code>. Hover: <code className="font-mono bg-white/10 px-1 rounded">bg-white/5</code>.</p>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Progress ─────────────────────────────────────────────────

function ProgressSection() {
    return (
        <Section id="progress" title="Progress" icon={TrendingUp}>
            <Callout>
                Progress bars show discrete completion — not indeterminate state (use a spinner for that). Always include numeric value and accessible <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">aria-valuenow</code>. Step indicators track multi-step flows.
            </Callout>

            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Linear Progress Bar</Meta>
                    <div className="space-y-4">
                        {[
                            { label: 'Application Complete', value: 100, color: 'green' as const },
                            { label: 'Profile Setup', value: 75, color: 'lightBlue' as const },
                            { label: 'Committee Training', value: 40, color: 'yellow' as const },
                            { label: 'Orientation', value: 10, color: 'wine' as const },
                        ].map(({ label, value, color }) => (
                            <ProgressBar key={label} value={value} label={label} color={color} />
                        ))}
                    </div>
                </Box>
                <Box dark>
                    <Meta light>Progress bars on dark background</Meta>
                    <div className="space-y-4">
                        {[
                            { label: 'Application', value: 100, color: 'green' as const },
                            { label: 'Profile', value: 75, color: 'yellow' as const },
                            { label: 'Training', value: 40, color: 'lightBlue' as const },
                            { label: 'Orientation', value: 10, color: 'white' as const },
                        ].map(({ label, value, color }) => (
                            <ProgressBar key={label} value={value} label={label} color={color} dark />
                        ))}
                    </div>
                    <p className="text-[10px] text-white/60 mt-3">Track: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10</code>. Fill colors stay the same — green/yellow/blue pop on dark.</p>
                </Box>
            </Grid>

            <Box>
                <Meta>Step Indicator — multi-step flow</Meta>
                <StepIndicator 
                    steps={['Application', 'Review', 'Interview', 'Decision']} 
                    current={2} 
                />
                <p className="text-[10px] text-brand-blue/70 mt-4">Completed: filled brand-blue. Current: brand-yellow. Future: white fill, /20 border.</p>
            </Box>
        </Section>
    );
}

// ─── Avatars ──────────────────────────────────────────────────

function AvatarsSection() {
    return (
        <Section id="avatars" title="User Avatars" icon={Image}>
            <Grid cols={2}>
                <Box>
                    <Meta>Sizes — Avatar component</Meta>
                    <Row className="mb-6 items-end">
                        {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
                            <div key={size} className="flex flex-col items-center gap-2">
                                <Avatar name="Alice Johnson" size={size} />
                                <p className="text-[10px] font-mono text-brand-blue/60">{size}</p>
                                <p className="text-[10px] text-brand-blue/70">{
                                    { xs: 'w-6 h-6', sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16' }[size]
                                }</p>
                            </div>
                        ))}
                    </Row>
                    <Meta>Deterministic color — unique per name hash</Meta>
                    <Row className="flex-wrap">
                        {['Alice Johnson', 'Bob Chen', 'Carlos Ramirez', 'Diana Liu', 'Ethan Park', 'Farah Ahmad'].map(name => (
                            <div key={name} className="flex items-center gap-2">
                                <Avatar name={name} size="sm" />
                                <p className="text-xs text-brand-blue/70">{name.split(' ')[0]}</p>
                            </div>
                        ))}
                    </Row>
                </Box>
                <Box dark>
                    <Meta light>Avatars on dark background</Meta>
                    <p className="text-[10px] text-white/65 mb-4">White border ring ensures separation from the dark surface.</p>
                    <Row className="mb-5">
                        {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
                            <div key={size} className="flex flex-col items-center gap-2">
                                <Avatar name="Alice Johnson" size={size} border />
                                <p className="text-[9px] font-mono text-white/60">{size}</p>
                            </div>
                        ))}
                    </Row>
                    <Row className="flex-wrap">
                        {['Alice Johnson', 'Bob Chen', 'Carlos Ramirez', 'Diana Liu'].map(name => (
                            <Avatar key={name} name={name} size="md" border />
                        ))}
                    </Row>
                    <p className="text-[10px] text-white/65 mt-4">Component applies <code className="font-mono bg-white/10 px-1 rounded">ring-2 ring-white/30</code> automatically on dark surfaces.</p>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Default export ────────────────────────────────────────────

export default function DisplaySection() {
    return (
        <>
            <BadgesSection />
            <TablesSection />
            <ProgressSection />
            <AvatarsSection />
        </>
    );
}
