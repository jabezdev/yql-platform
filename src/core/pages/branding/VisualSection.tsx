import { Star, Ruler, Square, Sparkles, Users, Calendar, BookOpen, BarChart2, Search, Lock, FileText, Layers, Tag, Layout, Zap, Bell, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Section, Meta, Box, Grid, Callout, Row } from './shared';

// ─── Iconography ──────────────────────────────────────────────

function IconographySection() {
    return (
        <Section id="iconography" title="Iconography" icon={Star}>
            <Callout>
                All icons come from <strong>Lucide React</strong>. Always pass <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">aria-hidden="true"</code> when an icon is decorative. Icon color follows CSS <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">currentColor</code> — set via <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">className</code>, never inline style.
            </Callout>
            {(() => {
                const SIZES = [
                    { size: 12, use: 'Inline metadata, badge dots, compact chips' },
                    { size: 16, use: 'Default — button icons, nav icons, table actions' },
                    { size: 20, use: 'Section icons, feature cards, empty state indicators' },
                    { size: 24, use: 'Page-level indicators, large empty states' },
                ];
                const RULES = [
                    { rule: 'Decorative icons must have aria-hidden="true"', code: 'aria-hidden="true"' },
                    { rule: 'Icon-only buttons must have aria-label', code: 'aria-label="Delete member"' },
                    { rule: 'Color via className, not inline style', code: 'className="text-brand-lightBlue"' },
                    { rule: 'strokeWidth stays at default (2) — never override', code: null },
                    { rule: 'Never use an icon for an unmapped concept — use the canonical map', code: null },
                ];
                return (
                    <Grid cols={2} className="mb-6">
                        <Box>
                            <Meta>Size Scale — light</Meta>
                            <div className="space-y-3">
                                {SIZES.map(({ size, use }) => (
                                    <div key={size} className="flex items-center gap-3 pb-3 border-b border-brand-blue/5 last:border-0 last:pb-0">
                                        <div className="w-10 flex items-center justify-center flex-shrink-0">
                                            <Sparkles size={size} className="text-brand-blue/70" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <code className="font-mono text-[10px] text-brand-lightBlue bg-brand-bgLight px-1.5 py-0.5 rounded">size={size}</code>
                                            <p className="text-[10px] text-brand-blue/65 mt-0.5">{use}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Box>
                        <Box dark>
                            <Meta light>Size Scale — dark</Meta>
                            <div className="space-y-3">
                                {SIZES.map(({ size, use }) => (
                                    <div key={size} className="flex items-center gap-3 pb-3 border-b border-white/8 last:border-0 last:pb-0">
                                        <div className="w-10 flex items-center justify-center flex-shrink-0">
                                            <Sparkles size={size} className="text-white/70" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <code className="font-mono text-[10px] text-brand-yellow bg-white/10 px-1.5 py-0.5 rounded">size={size}</code>
                                            <p className="text-[10px] text-white/55 mt-0.5">{use}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Box>
                        <Box>
                            <Meta>Rules — light</Meta>
                            <div className="space-y-2.5">
                                {RULES.map(({ rule, code }, i) => (
                                    <div key={i} className="pb-2.5 border-b border-brand-blue/5 last:border-0 last:pb-0">
                                        <p className="text-xs text-brand-blue/70">{rule}</p>
                                        {code && <code className="font-mono text-[10px] text-brand-lightBlue bg-brand-bgLight px-1.5 py-0.5 rounded mt-1 inline-block">{code}</code>}
                                    </div>
                                ))}
                            </div>
                        </Box>
                        <Box dark>
                            <Meta light>Rules — dark</Meta>
                            <div className="space-y-2.5">
                                {RULES.map(({ rule, code }, i) => (
                                    <div key={i} className="pb-2.5 border-b border-white/8 last:border-0 last:pb-0">
                                        <p className="text-xs text-white/65">{rule}</p>
                                        {code && <code className="font-mono text-[10px] text-brand-yellow bg-white/10 px-1.5 py-0.5 rounded mt-1 inline-block">{code}</code>}
                                    </div>
                                ))}
                            </div>
                        </Box>
                    </Grid>
                );
            })()}

            {(() => {
                const ICONS = [
                    { icon: Users, label: 'Users / Members', name: 'Users' },
                    { icon: Calendar, label: 'Events / Schedule', name: 'Calendar' },
                    { icon: BookOpen, label: 'Resources / Docs', name: 'BookOpen' },
                    { icon: BarChart2, label: 'Stats / Analytics', name: 'BarChart2' },
                    { icon: Search, label: 'Search', name: 'Search' },
                    { icon: Lock, label: 'Restricted / Auth', name: 'Lock' },
                    { icon: Star, label: 'Featured / Highlight', name: 'Star' },
                    { icon: FileText, label: 'Forms / Input', name: 'FileText' },
                    { icon: Layers, label: 'Sections / Stacked', name: 'Layers' },
                    { icon: Tag, label: 'Labels / Status', name: 'Tag' },
                    { icon: Layout, label: 'Layout / Structure', name: 'Layout' },
                    { icon: Zap, label: 'Quick action / CTA', name: 'Zap' },
                    { icon: Bell, label: 'Notifications', name: 'Bell' },
                    { icon: MessageCircle, label: 'Chat / Comments', name: 'MessageCircle' },
                    { icon: CheckCircle2, label: 'Success / Done', name: 'CheckCircle2' },
                    { icon: AlertCircle, label: 'Error / Alert', name: 'AlertCircle' },
                ];
                return (
                    <Grid cols={2}>
                        <Box>
                            <Meta>Canonical Icon Map — light</Meta>
                            <div className="grid grid-cols-2 gap-2">
                                {ICONS.map(({ icon: Icon, label, name }) => (
                                    <div key={name} className="flex items-center gap-2.5 p-2 rounded-tl-lg rounded-br-lg hover:bg-brand-bgLight transition-colors">
                                        <div className="w-8 h-8 bg-brand-bgLight rounded-tl-md rounded-br-md flex items-center justify-center flex-shrink-0">
                                            <Icon size={16} className="text-brand-blue/70" aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-mono font-bold text-brand-blue leading-tight">{name}</p>
                                            <p className="text-[10px] text-brand-blue/55 leading-tight truncate">{label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Box>
                        <Box dark>
                            <Meta light>Canonical Icon Map — dark</Meta>
                            <div className="grid grid-cols-2 gap-2">
                                {ICONS.map(({ icon: Icon, label, name }) => (
                                    <div key={name} className="flex items-center gap-2.5 p-2 rounded-tl-lg rounded-br-lg hover:bg-white/8 transition-colors">
                                        <div className="w-8 h-8 bg-white/10 rounded-tl-md rounded-br-md flex items-center justify-center flex-shrink-0">
                                            <Icon size={16} className="text-white/75" aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-mono font-bold text-white/85 leading-tight">{name}</p>
                                            <p className="text-[10px] text-white/50 leading-tight truncate">{label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-white/40 mt-4">Icon fill: <code className="font-mono bg-white/10 px-1 rounded">text-white/75</code>. Container: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10</code>. Active/accent state: <code className="font-mono bg-white/10 px-1 rounded">text-brand-yellow</code>.</p>
                        </Box>
                    </Grid>
                );
            })()}
        </Section>
    );
}

// ─── Spacing ───────────────────────────────────────────────────

function SpacingSection() {
    return (
        <Section id="spacing" title="Spacing System" icon={Ruler}>
            <Callout>
                Base unit is <strong>4px</strong>. All spacing is a multiple of 4. Use Tailwind's scale — no arbitrary pixel values for spacing. Starred entries are the most commonly used in this system.
            </Callout>
            {(() => {
                const PADS = [
                    { cls: 'p-1', px: '4px',  star: false },
                    { cls: 'p-2', px: '8px',  star: false },
                    { cls: 'p-3', px: '12px', star: true  },
                    { cls: 'p-4', px: '16px', star: false },
                    { cls: 'p-5', px: '20px', star: true  },
                    { cls: 'p-6', px: '24px', star: true  },
                ];
                const GAPS = [
                    { cls: 'gap-2', note: '8px — tight pairs' },
                    { cls: 'gap-3', note: '12px — default ★', star: true },
                    { cls: 'gap-4', note: '16px — card grids' },
                    { cls: 'gap-6', note: '24px — sub-groups' },
                    { cls: 'gap-8', note: '32px — major sections' },
                ];
                return (
                    <Grid cols={2} className="mb-6">
                        <Box>
                            <Meta>Padding samples — light</Meta>
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {PADS.map(({ cls, px, star }) => (
                                    <div key={cls} className="flex flex-col gap-1.5">
                                        <div className={`${cls} bg-brand-blue/8 border border-brand-blue/15 rounded-tl-md rounded-br-md`}>
                                            <div className="bg-brand-lightBlue/30 rounded-sm h-4" />
                                        </div>
                                        <div>
                                            <code className={`font-mono text-[10px] block ${star ? 'text-brand-blue font-bold' : 'text-brand-blue/55'}`}>{cls}</code>
                                            <span className="text-[9px] text-brand-blue/35">{px}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/45 mb-2.5">Gap</p>
                            <div className="space-y-2.5">
                                {GAPS.map(({ cls, note, star }) => (
                                    <div key={cls} className="flex items-center gap-3">
                                        <code className={`font-mono text-[10px] w-12 flex-shrink-0 ${star ? 'font-bold text-brand-blue' : 'text-brand-blue/55'}`}>{cls}</code>
                                        <div className={`flex items-center ${cls}`}>
                                            {[...Array(4)].map((_, i) => <div key={i} className="w-4 h-4 bg-brand-blue/20 rounded-sm flex-shrink-0" />)}
                                        </div>
                                        <span className="text-[10px] text-brand-blue/45">{note}</span>
                                    </div>
                                ))}
                            </div>
                        </Box>
                        <Box dark>
                            <Meta light>Padding samples — dark</Meta>
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {PADS.map(({ cls, px, star }) => (
                                    <div key={cls} className="flex flex-col gap-1.5">
                                        <div className={`${cls} bg-white/10 border border-white/15 rounded-tl-md rounded-br-md`}>
                                            <div className="bg-white/35 rounded-sm h-4" />
                                        </div>
                                        <div>
                                            <code className={`font-mono text-[10px] block ${star ? 'text-brand-yellow font-bold' : 'text-white/45'}`}>{cls}</code>
                                            <span className="text-[9px] text-white/30">{px}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mb-2.5">Gap</p>
                            <div className="space-y-2.5">
                                {GAPS.map(({ cls, note, star }) => (
                                    <div key={cls} className="flex items-center gap-3">
                                        <code className={`font-mono text-[10px] w-12 flex-shrink-0 ${star ? 'font-bold text-brand-yellow' : 'text-white/45'}`}>{cls}</code>
                                        <div className={`flex items-center ${cls}`}>
                                            {[...Array(4)].map((_, i) => <div key={i} className="w-4 h-4 bg-white/25 rounded-sm flex-shrink-0" />)}
                                        </div>
                                        <span className="text-[10px] text-white/40">{note}</span>
                                    </div>
                                ))}
                            </div>
                        </Box>
                    </Grid>
                );
            })()}

            <Grid cols={2}>
                <Box>
                    <Meta>Common Padding Patterns</Meta>
                    <div className="space-y-2">
                        {[
                            { cls: 'p-3', use: 'Tight chips, compact badges' },
                            { cls: 'p-4', use: 'Callout blocks, note boxes' },
                            { cls: 'p-5', use: 'Standard card body padding' },
                            { cls: 'p-6', use: 'Spacious card or panel sections' },
                            { cls: 'px-6 py-3', use: 'Sticky header row' },
                            { cls: 'px-6 py-12', use: 'Page content wrapper' },
                        ].map(({ cls, use }) => (
                            <div key={cls} className="flex items-center justify-between border-b border-brand-blue/5 pb-2 last:border-0 last:pb-0">
                                <code className="font-mono text-[10px] text-brand-lightBlue bg-brand-bgLight px-1.5 py-0.5 rounded flex-shrink-0">{cls}</code>
                                <span className="text-[11px] text-brand-blue/65 ml-3 text-right">{use}</span>
                            </div>
                        ))}
                    </div>
                </Box>
                <Box>
                    <Meta>Common Gap Patterns</Meta>
                    <div className="space-y-2">
                        {[
                            { cls: 'gap-2', use: 'Tight icon + label pairs' },
                            { cls: 'gap-3', use: 'Default row/grid gap' },
                            { cls: 'gap-4', use: 'Grid items (cards, swatches)' },
                            { cls: 'gap-6', use: 'Section sub-groups' },
                            { cls: 'gap-8', use: 'Large spaced sections' },
                            { cls: 'mb-20', use: 'Between major sections' },
                        ].map(({ cls, use }) => (
                            <div key={cls} className="flex items-center justify-between border-b border-brand-blue/5 pb-2 last:border-0 last:pb-0">
                                <code className="font-mono text-[10px] text-brand-lightBlue bg-brand-bgLight px-1.5 py-0.5 rounded flex-shrink-0">{cls}</code>
                                <span className="text-[11px] text-brand-blue/65 ml-3 text-right">{use}</span>
                            </div>
                        ))}
                    </div>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Motif ─────────────────────────────────────────────────────

function MotifSection() {
    return (
        <Section id="motif" title="Geometric Motif" icon={Square}>
            <Meta>Corner System — top-left + bottom-right only</Meta>
            <Box className="mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                        { cls: 'rounded-tl-lg rounded-br-lg', label: 'tl-lg · br-lg', usage: 'Inputs · avatars · small chips · nav hover' },
                        { cls: 'rounded-tl-xl rounded-br-xl', label: 'tl-xl · br-xl', usage: 'Buttons · small cards · active nav' },
                        { cls: 'rounded-tl-2xl rounded-br-2xl', label: 'tl-2xl · br-2xl', usage: 'Dashboard cards · page headers' },
                        { cls: 'rounded-tl-3xl rounded-br-3xl', label: 'tl-3xl · br-3xl', usage: 'Hero elements · large feature blocks' },
                    ].map(({ cls, label, usage }) => (
                        <div key={label} className="flex flex-col items-center gap-2">
                            <div className={`w-16 h-16 ${cls} bg-brand-yellow border-2 border-brand-blue`} />
                            <p className="text-[10px] font-mono text-brand-blue/65 text-center">{label}</p>
                            <p className="text-[10px] text-brand-blue/55 text-center leading-tight">{usage}</p>
                        </div>
                    ))}
                </div>
            </Box>

            <Meta>Shadow System — offset isometric lift</Meta>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Light surface shadows</Meta>
                    <p className="text-xs text-brand-blue/70 font-medium mb-5 leading-relaxed">
                        Shadows go <strong className="text-brand-blue">down-right</strong>. On hover, elements lift <strong className="text-brand-blue">up-left</strong> by the same amount. Shadow offset px = translate px.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'No shadow', cls: '', desc: 'Static elements' },
                            { label: 'Subtle', cls: 'shadow-[2px_2px_0px_0px_rgba(57,103,153,0.08)]', desc: 'Static cards' },
                            { label: 'Default', cls: 'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)]', desc: 'Interactive at rest' },
                            { label: 'Hover', cls: 'shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] -translate-x-[2px] -translate-y-[2px]', desc: 'Lifted on hover' },
                            { label: 'Press', cls: 'shadow-none translate-x-[4px] translate-y-[4px]', desc: 'Pressed / active' },
                            { label: 'Dark ink', cls: 'shadow-[4px_4px_0px_0px_rgba(10,22,48,0.55)]', desc: 'Primary buttons' },
                        ].map(({ label, cls, desc }) => (
                            <div key={label} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-tl-xl rounded-br-xl bg-white border-2 border-brand-blue ${cls}`} />
                                <p className="text-[10px] font-bold text-brand-blue/70 text-center leading-tight">{label}</p>
                                <p className="text-[10px] text-brand-blue/50 text-center leading-tight">{desc}</p>
                            </div>
                        ))}
                    </div>
                </Box>
                <Box dark>
                    <Meta light>Dark surface shadows</Meta>
                    <p className="text-xs text-white/65 font-medium mb-5 leading-relaxed">
                        Replace blue-tinted shadows with <code className="font-mono text-[10px] bg-white/10 px-0.5 rounded">rgba(0,0,0,…)</code>. Higher opacity (0.3–0.5) needed for visibility. Lift directions unchanged.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'No shadow', cls: '', desc: 'Static elements' },
                            { label: 'Subtle', cls: 'shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]', desc: 'Static cards' },
                            { label: 'Default', cls: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.35)]', desc: 'Interactive at rest' },
                            { label: 'Hover', cls: 'shadow-[6px_6px_0px_0px_rgba(0,0,0,0.35)] -translate-x-[2px] -translate-y-[2px]', desc: 'Lifted on hover' },
                            { label: 'Press', cls: 'shadow-none translate-x-[4px] translate-y-[4px]', desc: 'Pressed / active' },
                            { label: 'Yellow CTA', cls: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.45)]', desc: 'Yellow buttons' },
                        ].map(({ label, cls, desc }) => (
                            <div key={label} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-tl-xl rounded-br-xl bg-white/15 border border-white/30 ${cls}`} />
                                <p className="text-[10px] font-bold text-white/70 text-center leading-tight">{label}</p>
                                <p className="text-[10px] text-white/45 text-center leading-tight">{desc}</p>
                            </div>
                        ))}
                    </div>
                </Box>
            </Grid>

            <Grid cols={2}>
                <div className="p-4 bg-brand-blue/5 border-2 border-brand-blue/15 rounded-tl-lg rounded-br-lg">
                    <p className="text-xs font-bold text-brand-blue mb-1">Rule of Thumb — light surfaces</p>
                    <p className="text-xs text-brand-blue/70">
                        <strong>Has shadow</strong> → element is interactive.&nbsp;
                        <strong>No shadow</strong> → element is static.&nbsp;
                        Shadow offset px = translate px on hover.
                    </p>
                </div>
                <div className="p-4 bg-brand-blue border-2 border-white/10 rounded-tl-lg rounded-br-lg">
                    <p className="text-xs font-bold text-white mb-1">Rule of Thumb — dark surfaces</p>
                    <p className="text-xs text-white/65">
                        Replace <code className="font-mono text-[10px] bg-white/10 px-0.5 rounded">rgba(57,103,153,…)</code> shadows with <code className="font-mono text-[10px] bg-white/10 px-0.5 rounded">rgba(0,0,0,0.3–0.5)</code>. Hover lift and press directions stay the same.
                    </p>
                </div>
            </Grid>
        </Section>
    );
}

// ─── Motion ────────────────────────────────────────────────────

function MotionSection() {
    return (
        <Section id="motion" title="Motion &amp; Animation" icon={Sparkles}>
            <Callout>
                All animations must respect <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">prefers-reduced-motion</code>. Use the <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">motion-safe:</code> Tailwind variant or a CSS <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">@media (prefers-reduced-motion: reduce)</code> block. Only animate <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">transform</code> and <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">opacity</code> — never <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">transition: all</code>.
            </Callout>
            <Grid cols={2} className="mb-6">
                <Box>
                    <Meta>Duration Scale</Meta>
                    <div className="space-y-2.5">
                        {[
                            { name: 'duration-75', ms: '75ms', use: 'Micro: tooltip open, badge pop' },
                            { name: 'duration-150', ms: '150ms', use: 'Default: hover state, button press' },
                            { name: 'duration-200', ms: '200ms', use: 'Subtle enter: dropdown, popover' },
                            { name: 'duration-300', ms: '300ms', use: 'Layout shifts, slide-in panels' },
                            { name: 'duration-500', ms: '500ms', use: 'Full-page transitions (rare)' },
                        ].map(({ name, ms, use }) => (
                            <div key={name} className="flex items-center gap-3 pb-2.5 border-b border-brand-blue/5 last:border-0 last:pb-0">
                                <code className="font-mono text-[10px] text-brand-lightBlue bg-brand-bgLight px-1.5 py-0.5 rounded w-28 flex-shrink-0">{name}</code>
                                <span className="font-mono text-[10px] text-brand-blue/65 w-10 flex-shrink-0">{ms}</span>
                                <span className="text-[11px] text-brand-blue/70">{use}</span>
                            </div>
                        ))}
                    </div>
                </Box>
                <Box>
                    <Meta>Easing Curves</Meta>
                    <div className="space-y-3">
                        {[
                            { name: 'ease-out', css: 'cubic-bezier(0,0,0.2,1)', use: 'Elements entering the screen' },
                            { name: 'ease-in', css: 'cubic-bezier(0.4,0,1,1)', use: 'Elements leaving the screen' },
                            { name: 'ease-in-out', css: 'cubic-bezier(0.4,0,0.2,1)', use: 'Position transforms, lifts' },
                            { name: 'linear', css: 'linear', use: 'Spinners and infinite loops only' },
                        ].map(({ name, css, use }) => (
                            <div key={name} className="pb-3 border-b border-brand-blue/5 last:border-0 last:pb-0">
                                <code className="font-mono text-[10px] text-brand-lightBlue bg-brand-bgLight px-1.5 py-0.5 rounded">{name}</code>
                                <p className="text-[10px] font-mono text-brand-blue/50 mt-1">{css}</p>
                                <p className="text-[10px] text-brand-blue/70 mt-0.5">{use}</p>
                            </div>
                        ))}
                    </div>
                </Box>
            </Grid>

            <Box>
                <Meta>What to Animate</Meta>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-green mb-2">✓ Compositor-Friendly</p>
                        <div className="space-y-1.5 text-xs text-brand-blue/70">
                            <p><code className="font-mono text-[10px] bg-brand-bgLight px-1 rounded">transform</code> — translate, scale, rotate</p>
                            <p><code className="font-mono text-[10px] bg-brand-bgLight px-1 rounded">opacity</code> — fade in/out</p>
                            <p>Combined opacity + translate (slide-fade pattern)</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-wine mb-2">✗ Never Animate</p>
                        <div className="space-y-1.5 text-xs text-brand-blue/70">
                            <p><code className="font-mono text-[10px] bg-brand-bgLight px-1 rounded">width</code> / <code className="font-mono text-[10px] bg-brand-bgLight px-1 rounded">height</code> — causes layout reflow</p>
                            <p><code className="font-mono text-[10px] bg-brand-bgLight px-1 rounded">background-color</code> alone</p>
                            <p><code className="font-mono text-[10px] bg-brand-bgLight px-1 rounded">transition: all</code> — too broad, risky</p>
                        </div>
                    </div>
                </div>
            </Box>
        </Section>
    );
}

// ─── Default export ────────────────────────────────────────────

export default function VisualSection() {
    return (
        <>
            <IconographySection />
            <SpacingSection />
            <MotifSection />
            <MotionSection />
        </>
    );
}
