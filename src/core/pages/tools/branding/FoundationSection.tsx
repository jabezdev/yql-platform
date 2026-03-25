import { tokens } from '@/design';
import { Hash, Palette, Type, Zap, Check, X } from 'lucide-react';
import { Section, Meta, Box, Grid, Callout, useCopy, Copy, CheckCheck } from './shared';

// ─── Principles ───────────────────────────────────────────────

function PrinciplesSection() {
    return (
        <Section id="principles" title="Design Principles" icon={Zap}>
            <p className="text-sm text-brand-blue/70 leading-relaxed mb-8 max-w-2xl [text-wrap:balance]">
                These four principles guide every visual and interaction decision in the YQL platform. When in doubt, return to these.
            </p>
            <Grid cols={2}>
                {[
                    { n: '01', title: 'Geometric Identity', body: 'The diagonal corner cut (top-left + bottom-right) is our visual signature. It signals structure, precision, and purpose. Never apply standard rounded corners to brand surfaces — asymmetric radius is non-negotiable.' },
                    { n: '02', title: 'Blue as Foundation', body: 'Brand-blueDark (#396799) is the primary ink for all text, borders, and fills. Yellow is the accent that draws attention. Blue holds the system together — never let yellow or wine dominate a surface.' },
                    { n: '03', title: 'Hierarchy Through Weight', body: 'font-extrabold for headings and labels, font-medium for body. Opacity communicates tier — 100% for primary, 70–80% for body, 55% for tertiary metadata. Never go below /55 for readable text on white.' },
                    { n: '04', title: 'Purposeful Restraint', body: 'Shadows are reserved for interactive elements. Animation is functional, not decorative. Every border, shadow, and color choice must have a reason. If you can remove it without losing meaning, remove it.' },
                ].map(({ n, title, body }) => (
                    <div key={n} className="p-6 bg-white border-2 border-brand-blue/15 rounded-tl-2xl rounded-br-2xl shadow-[2px_2px_0px_0px_rgba(57,103,153,0.08)] flex flex-col">
                        <p className="font-display font-extrabold text-[10px] uppercase tracking-widest text-brand-yellow mb-3">{n}</p>
                        <h3 className="font-display font-extrabold text-lg text-brand-blue mb-2 [text-wrap:balance]">{title}</h3>
                        <p className="text-sm text-brand-blue/70 leading-relaxed mt-auto">{body}</p>
                    </div>
                ))}
            </Grid>
        </Section>
    );
}

// ─── Logo ─────────────────────────────────────────────────────

function LogoSection() {
    return (
        <Section id="logo" title="Logo &amp; Brand Identity" icon={Hash}>
            <Callout>
                Two assets: <strong>YQL_LOGO.svg</strong> (dark, for light backgrounds) and <strong>YQL_LOGO_WHITE.svg</strong> (white, for dark backgrounds). Always use the SVG — never rasterise or recreate the logo in code.
            </Callout>

            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>YQL_LOGO.svg — on light backgrounds</Meta>
                    <div className="flex flex-col items-center justify-center py-6 bg-white rounded-tl-lg rounded-br-lg border border-brand-blue/8 mb-3">
                        <img src="/YQL_LOGO.svg" alt="YQL Logo" className="h-16 w-auto" />
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono text-brand-blue/55">src="/YQL_LOGO.svg" · default usage</p>
                        <a href="/YQL_LOGO.svg" download="YQL_LOGO.svg"
                            className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-lightBlue hover:text-brand-darkBlue transition-colors px-2 py-1 border border-brand-blue/15 rounded hover:bg-brand-blue/5">
                            ↓ SVG
                        </a>
                    </div>
                </Box>
                <Box dark>
                    <Meta light>YQL_LOGO_WHITE.svg — on brand-lightBlue backgrounds</Meta>
                    <div className="flex flex-col items-center justify-center py-6 rounded-tl-lg rounded-br-lg border border-white/10 mb-3">
                        <img src="/YQL_LOGO_WHITE.svg" alt="YQL Logo" className="h-16 w-auto" />
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono text-white/45">src="/YQL_LOGO_WHITE.svg" · dark bg only</p>
                        <a href="/YQL_LOGO_WHITE.svg" download="YQL_LOGO_WHITE.svg"
                            className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-white/70 hover:text-white transition-colors px-2 py-1 border border-white/20 rounded hover:bg-white/10">
                            ↓ SVG
                        </a>
                    </div>
                </Box>
            </Grid>

            <Box className="mb-4">
                <Meta>Size scale — as used across the platform</Meta>
                <div className="flex items-end gap-8 flex-wrap">
                    {[
                        { h: 'h-6', px: '24px', where: 'Chat top bar' },
                        { h: 'h-10', px: '40px', where: 'Sidebar · Navbar' },
                        { h: 'h-16', px: '64px', where: 'Login · Register · Footer' },
                    ].map(({ h, px, where }) => (
                        <div key={px} className="flex flex-col items-center gap-3">
                            <img src="/YQL_LOGO.svg" alt="YQL Logo" className={`${h} w-auto`} />
                            <div className="text-center">
                                <p className="text-[10px] font-mono font-bold text-brand-blue">{h} · {px}</p>
                                <p className="text-[10px] text-brand-blue/50">{where}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Box>

            <Grid cols={2}>
                <Box>
                    <Meta>Clearspace — minimum breathing room</Meta>
                    <div className="flex items-center justify-center py-4 mb-3">
                        <div className="relative p-6 border-2 border-dashed border-brand-blue/20 rounded">
                            <img src="/YQL_LOGO.svg" alt="YQL Logo" className="h-10 w-auto" />
                            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-brand-blue/40">min 16px</span>
                            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-brand-blue/40" style={{ writingMode: 'vertical-rl' }}>min 16px</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-brand-blue/65 leading-relaxed">Maintain at least <strong>16px clearspace</strong> on all sides.</p>
                </Box>
                <Box>
                    <Meta>Do / Don't</Meta>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-green mb-2">✓ Do</p>
                            <div className="space-y-1.5 text-[11px] text-brand-blue/70">
                                <p>Use SVG files only — never PNG screenshots</p>
                                <p>Match variant to background (dark vs white)</p>
                                <p>Respect minimum 16px clearspace</p>
                                <p>Use <code className="font-mono text-[10px] bg-brand-bgLight px-0.5 rounded">w-auto</code> to preserve aspect ratio</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-red mb-2">✗ Don't</p>
                            <div className="space-y-1.5 text-[11px] text-brand-blue/70">
                                <p>Don't use dark logo on dark backgrounds</p>
                                <p>Don't set both h- and w- (distorts ratio)</p>
                                <p>Don't rotate, recolor, or add effects</p>
                                <p>Don't recreate the logo in CSS or code</p>
                            </div>
                        </div>
                    </div>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Colors ───────────────────────────────────────────────────

function ColorsSection() {
    const { copiedKey, copy } = useCopy();
    return (
        <Section id="colors" title="Color System" icon={Palette}>
            <Meta>Blue Scale — 3 tokens, darkest → lightest</Meta>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {[
                    { token: 'brand-darkBlue', hex: tokens.colors.darkBlue, usage: 'Hover + press states on buttons and interactive elements' },
                    { token: 'brand-blue', hex: tokens.colors.blue, usage: 'Primary: all text, borders, fills, nav active state' },
                    { token: 'brand-lightBlue', hex: tokens.colors.lightBlue, usage: 'Secondary: icons, links, info fills, role labels' },
                ].map(({ token, hex, usage }) => (
                    <div key={token} className="rounded-tl-xl rounded-br-xl overflow-hidden border-2 border-brand-blue/15 flex flex-col">
                        <div className="h-16 relative group flex-shrink-0" style={{ backgroundColor: hex }}>
                            <button onClick={() => copy(hex, token + '-hex')} aria-label={`Copy ${hex}`}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 bg-white/20 hover:bg-white/40 rounded flex items-center justify-center focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                                {copiedKey === token + '-hex' ? <CheckCheck size={10} className="text-white" aria-hidden={true as any} /> : <Copy size={10} className="text-white" aria-hidden={true as any} />}
                            </button>
                        </div>
                        <div className="p-3 bg-white flex flex-col flex-1">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                <p className="text-[10px] font-mono font-bold text-brand-blue leading-tight">{token}</p>
                                <button onClick={() => copy(token, token + '-name')} aria-label={`Copy ${token}`}
                                    className="text-brand-blue/45 hover:text-brand-blue/70 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-blue rounded flex-shrink-0">
                                    {copiedKey === token + '-name' ? <CheckCheck size={10} aria-hidden={true as any} /> : <Copy size={10} aria-hidden={true as any} />}
                                </button>
                            </div>
                            <p className="text-[10px] font-mono text-brand-blue/50 mb-1.5">{hex}</p>
                            <p className="text-[10px] text-brand-blue/65 leading-tight mt-auto">{usage}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <Meta>Accent Colors</Meta>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                            { token: 'brand-yellow', hex: tokens.colors.yellow, usage: 'Primary accent, highlights' },
                            { token: 'brand-red', hex: tokens.colors.red, usage: 'Destructive actions' },
                            { token: 'brand-wine', hex: tokens.colors.wine, usage: 'Form error states' },
                            { token: 'brand-green', hex: tokens.colors.green, usage: 'Success indicators' },
                        ].map(({ token, hex, usage }) => (
                            <div key={token} className="rounded-tl-lg rounded-br-lg overflow-hidden border-2 border-brand-blue/15 flex flex-col">
                                <div className="h-10 relative group flex-shrink-0" style={{ backgroundColor: hex }}>
                                    <button onClick={() => copy(hex, token)} aria-label={`Copy ${hex}`}
                                        className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/10 transition-opacity focus-visible:opacity-100 focus-visible:outline-none">
                                        {copiedKey === token ? <CheckCheck size={10} className="text-white" aria-hidden={true as any} /> : <Copy size={10} className="text-white" aria-hidden={true as any} />}
                                    </button>
                                </div>
                                <div className="p-2 bg-white flex flex-col flex-1">
                                    <p className="text-[9px] font-mono font-bold text-brand-blue leading-tight mb-1">{token.replace('brand-', '')}</p>
                                    <p className="text-[10px] text-brand-blue/60 leading-tight mt-auto">{usage}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <Meta>Neutrals</Meta>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { token: 'brand-gray', hex: tokens.colors.gray, usage: 'Section labels, muted text' },
                            { token: 'brand-bgLight', hex: tokens.colors.bgLight, usage: 'Page bg, card hover bg' },
                            { token: 'white', hex: tokens.colors.white, usage: 'Card surfaces, inputs, modals' },
                        ].map(({ token, hex, usage }) => (
                            <div key={token} className="rounded-tl-lg rounded-br-lg overflow-hidden border-2 border-brand-blue/15 flex flex-col">
                                <div className="h-10 border-b border-brand-blue/10 flex-shrink-0" style={{ backgroundColor: hex }} />
                                <div className="p-2 bg-white flex flex-col flex-1">
                                    <p className="text-[9px] font-mono font-bold text-brand-blue leading-tight mb-1">{token.replace('brand-', '')}</p>
                                    <p className="text-[10px] text-brand-blue/60 leading-tight mt-auto">{usage}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Meta>Color Combination Guide — contrast ratios</Meta>
            <Box className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { bg: tokens.colors.blue, text: tokens.colors.white, bgLabel: 'brand-blue', textLabel: 'white', ok: true, ratio: '4.6:1', level: 'AA' },
                        { bg: tokens.colors.blue, text: tokens.colors.yellow, bgLabel: 'brand-blue', textLabel: 'brand-yellow (icons)', ok: true, ratio: '3.4:1', level: 'AA Large' },
                        { bg: tokens.colors.white, text: tokens.colors.blue, bgLabel: 'white', textLabel: 'brand-blue', ok: true, ratio: '4.6:1', level: 'AA' },
                        { bg: tokens.colors.bgLight, text: tokens.colors.blue, bgLabel: 'brand-bgLight', textLabel: 'brand-blue', ok: true, ratio: '4.4:1', level: 'AA' },
                        { bg: tokens.colors.yellow, text: tokens.colors.blue, bgLabel: 'brand-yellow', textLabel: 'brand-blue', ok: true, ratio: '3.5:1', level: 'AA Large' },
                        { bg: tokens.colors.blue, text: tokens.colors.blue, bgLabel: 'brand-blue', textLabel: 'brand-blue ← WRONG', ok: false, ratio: '1:1', level: 'FAIL' },
                    ].map(({ bg, text, bgLabel, textLabel, ok, ratio, level }) => (
                        <div key={bgLabel + textLabel} className={`rounded-tl-lg rounded-br-lg overflow-hidden border-2 ${ok ? 'border-brand-blue/15' : 'border-brand-red/60'}`}>
                            <div className="h-10 flex items-center justify-center px-3" style={{ backgroundColor: bg }}>
                                <span className="text-xs font-bold" style={{ color: text }}>Sample Text</span>
                            </div>
                            <div className="p-2.5 bg-white">
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-mono text-brand-blue/55 truncate">bg: {bgLabel}</p>
                                        <p className="text-[9px] font-mono text-brand-blue/55 truncate">text: {textLabel}</p>
                                    </div>
                                    {ok ? <Check size={12} className="text-brand-green flex-shrink-0 mt-0.5" aria-hidden={true as any} /> : <X size={12} className="text-brand-red flex-shrink-0 mt-0.5" aria-hidden={true as any} />}
                                </div>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${ok ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'}`}>
                                    {ratio}&nbsp;·&nbsp;{level}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Box>

            <Meta>brand-blue opacity scale</Meta>
            <Box>
                <div className="flex flex-wrap gap-4">
                    {[
                        { n: 10, use: 'dividers, subtle bg' },
                        { n: 15, use: 'card borders' },
                        { n: 25, use: 'input borders' },
                        { n: 55, use: 'metadata labels ★ min for text' },
                        { n: 70, use: 'secondary text' },
                        { n: 80, use: 'body text preferred' },
                        { n: 100, use: 'headings, labels' },
                    ].map(({ n, use }) => (
                        <div key={n} className="flex flex-col items-center gap-1.5">
                            <div className="w-10 h-10 rounded-tl-lg rounded-br-lg" style={{ backgroundColor: `rgba(57,103,153,${n / 100})` }} />
                            <p className="text-[10px] font-mono text-brand-blue/65">/{n}</p>
                            <p className="text-[10px] text-brand-blue/55 text-center max-w-[64px] leading-tight">{use}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-brand-blue/10">
                    <p className="text-xs text-brand-blue/75"><strong className="text-brand-blue">Rule:</strong> Never use opacity below /55 for text content. Values /10–/25 are structural only (borders, backgrounds).</p>
                </div>
            </Box>
        </Section>
    );
}

// ─── Typography ───────────────────────────────────────────────

function TypographySection() {
    return (
        <Section id="typography" title="Typography" icon={Type}>
            <Callout>
                <strong>font-display</strong> (Space Grotesk) for headings, labels, stat values, badges, and anything that needs authority or identity.&nbsp;
                <strong>font-sans</strong> (Inter) for all body copy, paragraphs, inputs, and supporting text.&nbsp;
                <strong>font-mono</strong> for code snippets and token references only.&nbsp;
                Never mix display and sans within a single label or heading element.
            </Callout>

            {/* Font family showcase — light */}
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>font-display · Space Grotesk</Meta>
                    <p className="text-[10px] font-mono text-brand-blue/55 mb-4">Headings · labels · badges · stat values</p>
                    <p className="font-display font-extrabold text-5xl text-brand-blue leading-none mb-3">Aa</p>
                    <p className="font-display font-extrabold text-2xl text-brand-blue mb-2">Young Quantum Leader</p>
                    <p className="font-display font-bold text-base text-brand-blue/75">Dashboard Overview</p>
                    <p className="font-display font-extrabold text-[10px] uppercase tracking-widest text-brand-blue/55 mt-2">SECTION · BADGE · META</p>
                </Box>
                <Box>
                    <Meta>font-sans · Inter</Meta>
                    <p className="text-[10px] font-mono text-brand-blue/55 mb-4">Body · paragraphs · inputs · descriptions</p>
                    <p className="font-sans font-bold text-5xl text-brand-blue leading-none mb-3">Aa</p>
                    <p className="font-sans font-medium text-base text-brand-blue leading-relaxed mb-2">Join the premier youth leadership program.</p>
                    <p className="font-sans text-sm text-brand-blue/70 leading-relaxed">Secondary body copy for descriptions and supporting information.</p>
                </Box>
            </Grid>

            {/* Dark mode typography */}
            <Grid cols={2} className="mb-6">
                <Box dark>
                    <Meta light>font-display on dark background</Meta>
                    <p className="font-display font-extrabold text-5xl text-white leading-none mb-3">Aa</p>
                    <p className="font-display font-extrabold text-2xl text-white mb-2">Young Quantum Leader</p>
                    <p className="font-display font-bold text-base text-white/75">Dashboard Overview</p>
                    <p className="font-display font-extrabold text-[10px] uppercase tracking-widest text-white/55 mt-2">SECTION · BADGE · META</p>
                </Box>
                <Box dark>
                    <Meta light>font-sans on dark background</Meta>
                    <p className="font-sans font-bold text-5xl text-white leading-none mb-3">Aa</p>
                    <p className="font-sans font-medium text-base text-white leading-relaxed mb-2">Join the premier youth leadership program.</p>
                    <p className="font-sans text-sm text-white/70 leading-relaxed">Secondary body copy for descriptions and supporting information.</p>
                </Box>
            </Grid>

            {/* Weight scale */}
            <Box className="mb-4">
                <Meta>Weight scale — Space Grotesk · Inter</Meta>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                        <p className="text-[10px] font-mono text-brand-blue/55 mb-3">Space Grotesk · font-display</p>
                        <div className="space-y-3">
                            {([
                                { w: 'font-medium', label: 'Medium · 500', use: 'Body, inputs' },
                                { w: 'font-bold', label: 'Bold · 700', use: 'Section headings' },
                                { w: 'font-extrabold', label: 'Extrabold · 800', use: 'Page titles, stats, labels' },
                            ] as const).map(({ w, label, use }) => (
                                <div key={w} className="flex items-baseline justify-between border-b border-brand-blue/5 pb-2.5 last:border-0 last:pb-0">
                                    <p className={`font-display ${w} text-xl text-brand-blue`}>Quantum</p>
                                    <div className="text-right">
                                        <p className="text-[10px] font-mono text-brand-blue/55">{label}</p>
                                        <p className="text-[10px] text-brand-blue/40">{use}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-mono text-brand-blue/55 mb-3">Inter · font-sans</p>
                        <div className="space-y-3">
                            {([
                                { w: 'font-medium', label: 'Medium · 500', use: 'Body text, descriptions' },
                                { w: 'font-bold', label: 'Bold · 700', use: 'Button labels, emphasis' },
                                { w: 'font-extrabold', label: 'Extrabold · 800', use: 'Uppercase meta labels' },
                            ] as const).map(({ w, label, use }) => (
                                <div key={w} className="flex items-baseline justify-between border-b border-brand-blue/5 pb-2.5 last:border-0 last:pb-0">
                                    <p className={`font-sans ${w} text-xl text-brand-blue`}>Quantum</p>
                                    <div className="text-right">
                                        <p className="text-[10px] font-mono text-brand-blue/55">{label}</p>
                                        <p className="text-[10px] text-brand-blue/40">{use}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Box>

            {/* Type scale */}
            <Box className="mb-4">
                <Meta>Scale Reference — font-display font-extrabold text-brand-blue</Meta>
                <div>
                    {[
                        { cls: 'text-5xl', label: '3rem / 48px', ctx: 'Hero h2' },
                        { cls: 'text-4xl', label: '2.25rem / 36px', ctx: 'Page title lg' },
                        { cls: 'text-3xl', label: '1.875rem / 30px', ctx: 'Section heading / stat' },
                        { cls: 'text-2xl', label: '1.5rem / 24px', ctx: 'Card heading' },
                        { cls: 'text-xl', label: '1.25rem / 20px', ctx: 'Subheading' },
                        { cls: 'text-lg', label: '1.125rem / 18px', ctx: 'Large body / label' },
                        { cls: 'text-base', label: '1rem / 16px', ctx: 'Standard body' },
                        { cls: 'text-sm', label: '0.875rem / 14px', ctx: 'Secondary text' },
                        { cls: 'text-xs', label: '0.75rem / 12px', ctx: 'Caption / meta' },
                    ].map(({ cls, label, ctx }) => (
                        <div key={cls} className="grid grid-cols-2 items-center py-2.5 border-b border-brand-blue/5 last:border-0">
                            <div className="flex flex-col items-end pr-5 border-r border-brand-blue/8">
                                <span className="text-[10px] font-mono text-brand-blue/55 leading-snug">{label}</span>
                                <span className="text-[10px] text-brand-blue/45 leading-snug">{ctx}</span>
                            </div>
                            <div className="pl-5 min-w-0 overflow-hidden">
                                <p className={`font-display font-extrabold text-brand-blue leading-none ${cls}`}>Quantum</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Box>

            {/* Special patterns */}
            <Box>
                <Meta>Special patterns — uppercase labels · mono code · line height</Meta>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b border-brand-blue/5">
                        <div className="flex-shrink-0 min-w-[140px]">
                            <p className="font-sans font-extrabold text-[10px] uppercase tracking-widest text-brand-blue/55">Section Label</p>
                        </div>
                        <code className="text-[10px] font-mono text-brand-blue/45 leading-relaxed">font-sans font-extrabold text-[10px] uppercase tracking-widest text-brand-blue/55</code>
                    </div>
                    <div className="flex items-center gap-4 pb-4 border-b border-brand-blue/5">
                        <div className="flex-shrink-0 min-w-[140px]">
                            <p className="font-display font-extrabold text-[10px] uppercase tracking-widest text-brand-yellow">Accent Label</p>
                        </div>
                        <code className="text-[10px] font-mono text-brand-blue/45 leading-relaxed">font-display font-extrabold text-[10px] uppercase tracking-widest text-brand-yellow</code>
                    </div>
                    <div className="flex items-center gap-4 pb-4 border-b border-brand-blue/5">
                        <div className="flex-shrink-0 min-w-[140px]">
                            <code className="font-mono text-sm text-brand-lightBlue bg-brand-bgLight border border-brand-blue/10 px-2 py-1 rounded">brand-blue</code>
                        </div>
                        <code className="text-[10px] font-mono text-brand-blue/45">font-mono text-sm — token references, inline code</code>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 min-w-[140px]">
                            <p className="text-sm text-brand-blue/70 leading-relaxed">Body copy uses<br />leading-relaxed<br />for readability.</p>
                        </div>
                        <div>
                            <code className="text-[10px] font-mono text-brand-blue/45 block">leading-relaxed (1.625) — body paragraphs</code>
                            <code className="text-[10px] font-mono text-brand-blue/45 block mt-1">leading-tight — headings, badges, stat values</code>
                            <code className="text-[10px] font-mono text-brand-blue/45 block mt-1">leading-none — large display numbers (stat values)</code>
                        </div>
                    </div>
                </div>
            </Box>
        </Section>
    );
}

// ─── Export ───────────────────────────────────────────────────

export default function FoundationSection() {
    return (
        <>
            <PrinciplesSection />
            <LogoSection />
            <ColorsSection />
            <TypographySection />
        </>
    );
}
