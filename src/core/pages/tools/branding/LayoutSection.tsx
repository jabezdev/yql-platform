import { Monitor } from 'lucide-react';
import { Section, Meta, Box, Grid, Callout } from './shared';

export default function LayoutSection() {
    return (
        <Section id="layout" title="Layout System" icon={Monitor}>
            <Callout>
                All pages use <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">max-w-6xl mx-auto px-4 sm:px-6</code> as the content wrapper. Sidebar is always left. Content fills remaining space. Never exceed the max-w-6xl column.
            </Callout>
            <Grid cols={2} className="mb-6">
                <Box>
                    <Meta>Breakpoints — Tailwind defaults</Meta>
                    <div className="space-y-2">
                        {[
                            { prefix: 'sm', px: '640px', use: 'Single → two column, mobile nav collapses' },
                            { prefix: 'md', px: '768px', use: 'Sidebar becomes fixed, no longer stacked' },
                            { prefix: 'lg', px: '1024px', use: 'Full desktop layout, 3+ columns unlock' },
                            { prefix: 'xl', px: '1280px', use: 'Max content width expansion' },
                            { prefix: '2xl', px: '1536px', use: 'Rarely used — ultra-wide only' },
                        ].map(({ prefix, px, use }) => (
                            <div key={prefix} className="flex items-center gap-3 pb-2 border-b border-brand-blue/5 last:border-0 last:pb-0">
                                <code className="font-mono text-[10px] text-brand-lightBlue bg-brand-bgLight px-1.5 py-0.5 rounded w-8 text-center flex-shrink-0">{prefix}:</code>
                                <span className="font-mono text-[10px] text-brand-blue/55 w-14 flex-shrink-0">{px}</span>
                                <span className="text-[11px] text-brand-blue/65">{use}</span>
                            </div>
                        ))}
                    </div>
                </Box>
                <Box>
                    <Meta>Z-Index Stack</Meta>
                    <div className="space-y-1.5">
                        {[
                            { z: '0',   name: 'Default',   use: 'Normal content flow' },
                            { z: '10',  name: 'Elevated',  use: 'Hover cards, anchored popovers' },
                            { z: '20',  name: 'Sticky',    use: 'Sticky header / sidebar' },
                            { z: '30',  name: 'Drawer',    use: 'Side panel drawers' },
                            { z: '40',  name: 'Modal',     use: 'Dialog overlays + backdrop' },
                            { z: '50',  name: 'Toast',     use: 'Notification toasts (top of stack)' },
                            { z: '100', name: 'Skip link', use: 'Accessibility skip-nav link' },
                        ].map(({ z, name, use }) => (
                            <div key={z} className="flex items-center gap-3 pb-1.5 border-b border-brand-blue/5 last:border-0 last:pb-0">
                                <code className="font-mono text-[10px] text-brand-lightBlue bg-brand-bgLight px-1.5 py-0.5 rounded w-10 text-center flex-shrink-0">z-{z}</code>
                                <span className="text-[11px] font-semibold text-brand-blue/75 w-16 flex-shrink-0">{name}</span>
                                <span className="text-[11px] text-brand-blue/55">{use}</span>
                            </div>
                        ))}
                    </div>
                </Box>
            </Grid>

            <Grid cols={2}>
                <Box>
                    <Meta>Workspace Layout — light</Meta>
                    <div className="rounded-tl-lg rounded-br-lg overflow-hidden border border-brand-blue/15">
                        <div className="flex" style={{ height: 200 }}>
                            <div className="w-24 sm:w-28 bg-brand-blue flex-shrink-0 flex flex-col p-3 gap-2">
                                <div className="w-full h-6 bg-brand-yellow/20 rounded-tl-md rounded-br-md flex items-center px-2 gap-1.5">
                                    <div className="w-3 h-3 bg-brand-yellow rounded-tl-sm rounded-br-sm flex-shrink-0" />
                                    <div className="h-2 flex-1 bg-white/20 rounded-sm" />
                                </div>
                                {[true, false, false, false, false].map((isActive, i) => (
                                    <div key={i} className={`w-full h-5 rounded-sm flex items-center px-1.5 gap-1 ${isActive ? 'bg-white/15 border-l-2 border-brand-yellow' : 'bg-white/5'}`}>
                                        <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${isActive ? 'bg-brand-yellow/60' : 'bg-white/20'}`} />
                                        <div className={`h-1.5 flex-1 rounded-sm ${isActive ? 'bg-white/50' : 'bg-white/15'}`} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 bg-brand-bgLight p-3 flex flex-col gap-2 min-w-0">
                                <div className="w-full h-8 bg-white border border-brand-blue/10 rounded-tl-lg rounded-br-lg flex items-center px-3 gap-2 flex-shrink-0">
                                    <div className="flex-1 h-2 bg-brand-blue/10 rounded-sm" />
                                    <div className="w-12 h-5 bg-brand-blue/15 rounded-tl-md rounded-br-md" />
                                </div>
                                <div className="grid grid-cols-3 gap-2 flex-shrink-0">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-12 bg-white border border-brand-blue/10 rounded-tl-lg rounded-br-lg" />
                                    ))}
                                </div>
                                <div className="flex-1 bg-white border border-brand-blue/10 rounded-tl-lg rounded-br-lg" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 border-t border-brand-blue/10 divide-x divide-brand-blue/10">
                            <div className="p-2.5 text-center">
                                <p className="text-[9px] font-mono text-brand-blue/45">Sidebar</p>
                                <p className="text-[10px] font-bold text-brand-blue">256px · 320px expanded</p>
                            </div>
                            <div className="p-2.5 text-center">
                                <p className="text-[9px] font-mono text-brand-blue/45">Content</p>
                                <p className="text-[10px] font-bold text-brand-blue">max-w-6xl · px-4 sm:px-6</p>
                            </div>
                        </div>
                    </div>
                </Box>
                <Box dark>
                    <Meta light>Workspace Layout — dark</Meta>
                    <div className="rounded-tl-lg rounded-br-lg overflow-hidden border border-white/15">
                        <div className="flex" style={{ height: 200 }}>
                            {/* Sidebar — slightly darker than bg-brand-blue surface */}
                            <div className="w-24 sm:w-28 bg-black/25 flex-shrink-0 flex flex-col p-3 gap-2">
                                <div className="w-full h-6 bg-brand-yellow/15 rounded-tl-md rounded-br-md flex items-center px-2 gap-1.5">
                                    <div className="w-3 h-3 bg-brand-yellow rounded-tl-sm rounded-br-sm flex-shrink-0" />
                                    <div className="h-2 flex-1 bg-white/15 rounded-sm" />
                                </div>
                                {[true, false, false, false, false].map((isActive, i) => (
                                    <div key={i} className={`w-full h-5 rounded-sm flex items-center px-1.5 gap-1 ${isActive ? 'bg-white/20 border-l-2 border-brand-yellow' : 'bg-white/5'}`}>
                                        <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${isActive ? 'bg-brand-yellow/70' : 'bg-white/15'}`} />
                                        <div className={`h-1.5 flex-1 rounded-sm ${isActive ? 'bg-white/55' : 'bg-white/10'}`} />
                                    </div>
                                ))}
                            </div>
                            {/* Content area */}
                            <div className="flex-1 bg-white/5 p-3 flex flex-col gap-2 min-w-0">
                                <div className="w-full h-8 bg-white/12 border border-white/15 rounded-tl-lg rounded-br-lg flex items-center px-3 gap-2 flex-shrink-0">
                                    <div className="flex-1 h-2 bg-white/15 rounded-sm" />
                                    <div className="w-12 h-5 bg-brand-yellow/30 rounded-tl-md rounded-br-md" />
                                </div>
                                <div className="grid grid-cols-3 gap-2 flex-shrink-0">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-12 bg-white/10 border border-white/12 rounded-tl-lg rounded-br-lg" />
                                    ))}
                                </div>
                                <div className="flex-1 bg-white/10 border border-white/12 rounded-tl-lg rounded-br-lg" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 border-t border-white/10 divide-x divide-white/10">
                            <div className="p-2.5 text-center">
                                <p className="text-[9px] font-mono text-white/35">Sidebar</p>
                                <p className="text-[10px] font-bold text-white">bg-black/25 overlay</p>
                            </div>
                            <div className="p-2.5 text-center">
                                <p className="text-[9px] font-mono text-white/35">Content</p>
                                <p className="text-[10px] font-bold text-white">bg-white/5 surface</p>
                            </div>
                        </div>
                    </div>
                </Box>
            </Grid>
        </Section>
    );
}
