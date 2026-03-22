import { useState } from 'react';
import { PanelRight, MessageCircle, Bell, X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { UserAvatar } from '../../components/chat/shared/UserAvatar';
import { Section, Meta, Box, Grid, Callout } from './shared';

// ─── Modals & Drawers ─────────────────────────────────────────

function ModalsSection() {
    return (
        <Section id="modals" title="Modals &amp; Drawers" icon={PanelRight}>
            <Callout>
                Modals use <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">bg-black/50</code> backdrop + center alignment. Drawers slide from the right. Both trap focus, close on Escape, and sit at <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">z-40</code>. Toasts sit at <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">z-50</code> above them.
            </Callout>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Modal anatomy — light</Meta>
                    <div className="relative bg-brand-bgLight rounded-tl-lg rounded-br-lg overflow-hidden" style={{ height: 280 }}>
                        <div className="absolute inset-0 bg-brand-blue/30 flex items-center justify-center p-4">
                            <div className="w-full max-w-xs bg-white rounded-tl-2xl rounded-br-2xl border-2 border-brand-blue/15 shadow-[6px_6px_0px_0px_rgba(10,22,48,0.25)] overflow-hidden">
                                <div className="px-5 py-4 border-b border-brand-blue/8 flex items-center justify-between">
                                    <p className="font-display font-extrabold text-sm text-brand-blue">Confirm Action</p>
                                    <button className="text-brand-blue/40 hover:text-brand-blue transition-colors" aria-label="Close modal"><X size={14} aria-hidden="true" /></button>
                                </div>
                                <div className="px-5 py-4">
                                    <p className="text-xs text-brand-blue/70 leading-relaxed">Are you sure you want to remove this member? This action cannot be undone.</p>
                                </div>
                                <div className="px-5 py-3 border-t border-brand-blue/8 bg-brand-bgLight flex items-center justify-end gap-2">
                                    <Button variant="secondary" size="sm">Cancel</Button>
                                    <Button variant="destructive" size="sm">Remove</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-brand-blue/55 mt-2"><code className="font-mono bg-brand-bgLight px-1 rounded">rounded-tl-2xl rounded-br-2xl</code> · header + body + footer · X closes · footer bg-brand-bgLight</p>
                </Box>
                <Box>
                    <Meta>Right-side drawer anatomy — light</Meta>
                    <div className="relative bg-brand-bgLight rounded-tl-lg rounded-br-lg overflow-hidden" style={{ height: 280 }}>
                        <div className="absolute inset-0 flex">
                            <div className="flex-1 bg-brand-blue/20" />
                            <div className="w-48 bg-white border-l-2 border-brand-blue/15 flex flex-col">
                                <div className="px-4 py-3 border-b border-brand-blue/8 flex items-center justify-between">
                                    <p className="font-display font-extrabold text-xs text-brand-blue">Member Details</p>
                                    <button className="text-brand-blue/40 hover:text-brand-blue transition-colors" aria-label="Close drawer"><X size={12} aria-hidden="true" /></button>
                                </div>
                                <div className="flex-1 p-4 space-y-2">
                                    {[70, 90, 60, 80].map((w, i) => (
                                        <div key={i} className={`h-3 rounded-sm bg-brand-blue/${i === 0 ? '15' : '8'}`} style={{ width: `${w}%` }} />
                                    ))}
                                </div>
                                <div className="px-4 py-3 border-t border-brand-blue/8 flex gap-2">
                                    <div className="flex-1 h-7 bg-brand-blue rounded-tl-lg rounded-br-lg" />
                                    <div className="w-16 h-7 bg-brand-bgLight border border-brand-blue/15 rounded-tl-lg rounded-br-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-brand-blue/55 mt-2">Full-height panel, slides from right · <code className="font-mono bg-brand-bgLight px-1 rounded">border-l-2</code> · <code className="font-mono bg-brand-bgLight px-1 rounded">z-30</code></p>
                </Box>
            </Grid>

            <Grid cols={2}>
                <Box dark>
                    <Meta light>Modal — dark surface</Meta>
                    <div className="relative rounded-tl-lg rounded-br-lg overflow-hidden bg-white/5" style={{ height: 280 }}>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                            <div className="w-full max-w-xs bg-white/12 rounded-tl-2xl rounded-br-2xl border border-white/20 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.45)] overflow-hidden">
                                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                                    <p className="font-display font-extrabold text-sm text-white">Confirm Action</p>
                                    <button className="text-white/35 hover:text-white/70 transition-colors" aria-label="Close modal"><X size={14} aria-hidden="true" /></button>
                                </div>
                                <div className="px-5 py-4">
                                    <p className="text-xs text-white/65 leading-relaxed">Are you sure you want to remove this member?</p>
                                </div>
                                <div className="px-5 py-3 border-t border-white/10 bg-white/5 flex items-center justify-end gap-2">
                                    <button className="px-3 py-1.5 text-xs font-bold rounded-tl-lg rounded-br-lg border border-white/20 text-white/70 hover:text-white transition-colors">Cancel</button>
                                    <button className="px-3 py-1.5 text-xs font-bold rounded-tl-lg rounded-br-lg bg-brand-red/80 border border-brand-red/60 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)]">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-white/40 mt-2">Dark modal: <code className="font-mono bg-white/10 px-1 rounded">bg-white/12 border-white/20</code>. Cancel: ghost <code className="font-mono bg-white/10 px-1 rounded">border-white/20</code>. Destructive retains red.</p>
                </Box>
                <Box dark>
                    <Meta light>Drawer — dark surface</Meta>
                    <div className="relative rounded-tl-lg rounded-br-lg overflow-hidden bg-white/5" style={{ height: 280 }}>
                        <div className="absolute inset-0 flex">
                            <div className="flex-1 bg-black/25" />
                            <div className="w-48 bg-white/10 border-l border-white/15 flex flex-col">
                                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                                    <p className="font-display font-extrabold text-xs text-white">Member Details</p>
                                    <button className="text-white/35 hover:text-white/70 transition-colors" aria-label="Close drawer"><X size={12} aria-hidden="true" /></button>
                                </div>
                                <div className="flex-1 p-4 space-y-2">
                                    {[70, 90, 60, 80].map((w, i) => (
                                        <div key={i} className={`h-3 rounded-sm ${i === 0 ? 'bg-white/20' : 'bg-white/10'}`} style={{ width: `${w}%` }} />
                                    ))}
                                </div>
                                <div className="px-4 py-3 border-t border-white/10 flex gap-2">
                                    <div className="flex-1 h-7 bg-brand-yellow rounded-tl-lg rounded-br-lg" />
                                    <div className="w-16 h-7 bg-white/10 border border-white/20 rounded-tl-lg rounded-br-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-white/40 mt-2">Dark drawer: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10 border-l border-white/15</code>. Content rows: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10–20</code>. Primary CTA: <code className="font-mono bg-white/10 px-1 rounded">bg-brand-yellow</code>.</p>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Tooltips & Popovers ──────────────────────────────────────

function TooltipsSection() {
    const [popoverOpen, setPopoverOpen] = useState(false);

    return (
        <Section id="tooltips" title="Tooltips &amp; Popovers" icon={MessageCircle}>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Tooltip — light surface (dark tooltip)</Meta>
                    <div className="grid grid-cols-2 gap-4 py-6">
                        {[
                            { label: 'Top', cls: 'bottom-full mb-2 left-1/2 -translate-x-1/2' },
                            { label: 'Bottom', cls: 'top-full mt-2 left-1/2 -translate-x-1/2' },
                        ].map(({ label, cls }) => (
                            <div key={label} className="flex items-center justify-center py-6">
                                <div className="relative inline-block">
                                    <button className="px-3 py-1.5 text-xs font-bold bg-brand-bgLight border-2 border-brand-blue/15 rounded-tl-lg rounded-br-lg text-brand-blue/70">
                                        Hover
                                    </button>
                                    <div className={`absolute ${cls} pointer-events-none z-10`}>
                                        <div className="bg-brand-blue text-white text-[10px] font-medium px-2 py-1 rounded-tl-md rounded-br-md whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(10,22,48,0.4)]">
                                            {label} tooltip
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-brand-blue/65"><code className="font-mono bg-brand-bgLight px-1 rounded">bg-brand-blue</code> · white text · asymmetric radius · <code className="font-mono bg-brand-bgLight px-1 rounded">duration-75</code>. Also supports Right/Left placements.</p>
                </Box>
                <Box dark>
                    <Meta light>Tooltip — dark surface (inverted)</Meta>
                    <div className="grid grid-cols-2 gap-4 py-6">
                        {[
                            { label: 'Top', cls: 'bottom-full mb-2 left-1/2 -translate-x-1/2' },
                            { label: 'Bottom', cls: 'top-full mt-2 left-1/2 -translate-x-1/2' },
                        ].map(({ label, cls }) => (
                            <div key={label} className="flex items-center justify-center py-6">
                                <div className="relative inline-block">
                                    <button className="px-3 py-1.5 text-xs font-bold bg-white/10 border border-white/20 rounded-tl-lg rounded-br-lg text-white/65">
                                        Hover
                                    </button>
                                    <div className={`absolute ${cls} pointer-events-none z-10`}>
                                        <div className="bg-white text-brand-blue text-[10px] font-medium px-2 py-1 rounded-tl-md rounded-br-md whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,0.35)]">
                                            {label} tooltip
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-white/40">On dark surfaces, invert the tooltip: <code className="font-mono bg-white/10 px-1 rounded">bg-white text-brand-blue</code>. Shadow: <code className="font-mono bg-white/10 px-1 rounded">rgba(0,0,0,0.35)</code>.</p>
                </Box>
            </Grid>

            <Grid cols={2}>
                <Box>
                    <Meta>Popover — light surface</Meta>
                    <div className="relative inline-block">
                        <button
                            onClick={() => setPopoverOpen(o => !o)}
                            className={`px-3 py-1.5 text-xs font-bold border-2 rounded-tl-lg rounded-br-lg transition-colors mb-2 ${popoverOpen ? 'bg-brand-blue text-white border-brand-blue' : 'bg-brand-bgLight border-brand-blue/15 text-brand-blue/70 hover:border-brand-blue/30'}`}
                        >
                            User Info {popoverOpen ? '↑' : '↓'}
                        </button>
                        {popoverOpen && (
                            <div className="absolute top-full left-0 w-56 bg-white border-2 border-brand-blue/15 rounded-tl-xl rounded-br-xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] overflow-hidden z-10">
                                <div className="p-3 flex items-center gap-2.5 border-b border-brand-blue/8">
                                    <UserAvatar name="Alice Johnson" size="sm" />
                                    <div>
                                        <p className="text-xs font-bold text-brand-blue">Alice Johnson</p>
                                        <p className="text-[10px] text-brand-blue/55">Technical Committee Lead</p>
                                    </div>
                                </div>
                                <div className="p-3 space-y-1.5">
                                    <p className="text-[10px] text-brand-blue/55 font-mono">alice@example.com</p>
                                    <p className="text-[10px] text-brand-green font-bold">● Active</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-brand-blue/65 mt-3">Popover: white bg · <code className="font-mono text-[10px] bg-brand-bgLight px-1 rounded">rounded-tl-xl rounded-br-xl</code> · structured content (user cards, menus, info panels).</p>
                </Box>
                <Box dark>
                    <Meta light>Popover — dark surface</Meta>
                    <div className="inline-block mb-4">
                        <div className="px-3 py-1.5 text-xs font-bold bg-white/10 border border-white/20 rounded-tl-lg rounded-br-lg text-white/65 mb-4 inline-block">
                            User Info ↓
                        </div>
                        <div className="w-56 bg-white/12 border border-white/15 rounded-tl-xl rounded-br-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.35)]">
                            <div className="p-3 flex items-center gap-2.5 border-b border-white/10">
                                <UserAvatar name="Alice Johnson" size="sm" />
                                <div>
                                    <p className="text-xs font-bold text-white">Alice Johnson</p>
                                    <p className="text-[10px] text-white/55">Technical Committee Lead</p>
                                </div>
                            </div>
                            <div className="p-3 space-y-1.5">
                                <p className="text-[10px] text-white/45 font-mono">alice@example.com</p>
                                <p className="text-[10px] text-brand-green font-bold">● Active</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-white/40">Dark popover: <code className="font-mono bg-white/10 px-1 rounded">bg-white/12 border-white/15</code>. Title: <code className="font-mono bg-white/10 px-1 rounded">text-white</code>. Sub: <code className="font-mono bg-white/10 px-1 rounded">text-white/55</code>. Shadow: <code className="font-mono bg-white/10 px-1 rounded">rgba(0,0,0,0.35)</code>.</p>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Toasts & Alerts ──────────────────────────────────────────

function ToastsSection() {
    return (
        <Section id="toasts" title="Toasts &amp; Alerts" icon={Bell}>
            <Callout>
                Toasts are transient, positioned <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">fixed bottom-4 right-4 z-50</code>. Alerts are inline and persistent. Both share the same 4-variant system: success · warning · error · info.
            </Callout>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Toast stack — light</Meta>
                    <div className="space-y-2">
                        {[
                            { icon: CheckCircle2, label: 'Success', msg: 'Changes saved successfully.', border: 'border-brand-green/40', iconCls: 'text-brand-green' },
                            { icon: AlertTriangle, label: 'Warning', msg: 'Session expires in 5 minutes.', border: 'border-brand-yellow/50', iconCls: 'text-brand-yellow' },
                            { icon: AlertCircle, label: 'Error', msg: 'Failed to save. Please try again.', border: 'border-brand-red/40', iconCls: 'text-brand-red' },
                            { icon: Info, label: 'Info', msg: 'New resources are available.', border: 'border-brand-lightBlue/40', iconCls: 'text-brand-lightBlue' },
                        ].map(({ icon: Icon, label, msg, border, iconCls }) => (
                            <div key={label} className={`flex items-start gap-3 p-3 bg-white border-2 ${border} rounded-tl-xl rounded-br-xl shadow-[3px_3px_0px_0px_rgba(57,103,153,0.1)]`}>
                                <Icon size={14} className={`${iconCls} flex-shrink-0 mt-0.5`} aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-brand-blue">{label}</p>
                                    <p className="text-[11px] text-brand-blue/65 leading-snug">{msg}</p>
                                </div>
                                <button className="text-brand-blue/30 hover:text-brand-blue/60 transition-colors flex-shrink-0" aria-label="Dismiss"><X size={12} aria-hidden="true" /></button>
                            </div>
                        ))}
                    </div>
                </Box>
                <Box>
                    <Meta>Inline alerts — persistent (light)</Meta>
                    <div className="space-y-2">
                        {[
                            { icon: CheckCircle2, label: 'Success', msg: 'Application submitted.', bg: 'bg-brand-green/8', border: 'border-brand-green/25', iconCls: 'text-brand-green', labelCls: 'text-brand-green' },
                            { icon: AlertTriangle, label: 'Warning', msg: 'Complete your profile before the deadline.', bg: 'bg-brand-yellow/10', border: 'border-brand-yellow/35', iconCls: 'text-brand-yellow', labelCls: 'text-brand-blue' },
                            { icon: AlertCircle, label: 'Error', msg: 'Some fields have validation errors.', bg: 'bg-brand-red/8', border: 'border-brand-red/25', iconCls: 'text-brand-red', labelCls: 'text-brand-red' },
                            { icon: Info, label: 'Info', msg: 'Review period closes March 31.', bg: 'bg-brand-lightBlue/8', border: 'border-brand-lightBlue/25', iconCls: 'text-brand-lightBlue', labelCls: 'text-brand-lightBlue' },
                        ].map(({ icon: Icon, label, msg, bg, border, iconCls, labelCls }) => (
                            <div key={label} className={`flex items-start gap-2.5 px-3 py-2.5 ${bg} border-2 ${border} rounded-tl-lg rounded-br-lg`}>
                                <Icon size={13} className={`${iconCls} flex-shrink-0 mt-0.5`} aria-hidden="true" />
                                <p className="text-xs text-brand-blue/75 leading-relaxed"><strong className={labelCls}>{label}:</strong> {msg}</p>
                            </div>
                        ))}
                    </div>
                </Box>
            </Grid>

            {/* Dark toasts */}
            <Grid cols={2}>
                <Box dark>
                    <Meta light>Toast stack — dark surface</Meta>
                    <div className="space-y-2">
                        {[
                            { icon: CheckCircle2, label: 'Success', msg: 'Changes saved successfully.', bg: 'bg-brand-green/15', border: 'border-brand-green/50', iconCls: 'text-brand-green' },
                            { icon: AlertTriangle, label: 'Warning', msg: 'Session expires in 5 minutes.', bg: 'bg-brand-yellow/12', border: 'border-brand-yellow/55', iconCls: 'text-brand-yellow' },
                            { icon: AlertCircle, label: 'Error', msg: 'Failed to save. Try again.', bg: 'bg-brand-red/15', border: 'border-brand-red/55', iconCls: 'text-brand-red' },
                            { icon: Info, label: 'Info', msg: 'New resources available.', bg: 'bg-white/10', border: 'border-white/25', iconCls: 'text-white/65' },
                        ].map(({ icon: Icon, label, msg, bg, border, iconCls }) => (
                            <div key={label} className={`flex items-start gap-3 p-3 ${bg} border ${border} rounded-tl-xl rounded-br-xl`}>
                                <Icon size={14} className={`${iconCls} flex-shrink-0 mt-0.5`} aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white">{label}</p>
                                    <p className="text-[11px] text-white/65 leading-snug">{msg}</p>
                                </div>
                                <button className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0" aria-label="Dismiss">
                                    <X size={12} aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-white/40 mt-2">Dark toasts: colored bg fill (<code className="font-mono bg-white/10 px-1 rounded">/12–15</code>) + strong border (<code className="font-mono bg-white/10 px-1 rounded">/50–55</code>) for clear type distinction.</p>
                </Box>
                <Box dark>
                    <Meta light>Inline alerts — dark surface</Meta>
                    <div className="space-y-2">
                        {[
                            { icon: CheckCircle2, label: 'Success', msg: 'Application submitted.', bg: 'bg-brand-green/15', border: 'border-brand-green/45', iconCls: 'text-brand-green', labelCls: 'text-brand-green' },
                            { icon: AlertTriangle, label: 'Warning', msg: 'Complete profile before deadline.', bg: 'bg-brand-yellow/12', border: 'border-brand-yellow/50', iconCls: 'text-brand-yellow', labelCls: 'text-brand-yellow' },
                            { icon: AlertCircle, label: 'Error', msg: 'Some fields have errors.', bg: 'bg-brand-red/15', border: 'border-brand-red/50', iconCls: 'text-brand-red', labelCls: 'text-brand-red' },
                            { icon: Info, label: 'Info', msg: 'Review period closes March 31.', bg: 'bg-white/8', border: 'border-white/20', iconCls: 'text-white/60', labelCls: 'text-white' },
                        ].map(({ icon: Icon, label, msg, bg, border, iconCls, labelCls }) => (
                            <div key={label} className={`flex items-start gap-2.5 px-3 py-2.5 ${bg} border ${border} rounded-tl-lg rounded-br-lg`}>
                                <Icon size={13} className={`${iconCls} flex-shrink-0 mt-0.5`} aria-hidden="true" />
                                <p className="text-xs text-white/75 leading-relaxed"><strong className={labelCls}>{label}:</strong> {msg}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-white/40 mt-3">Dark alerts: <code className="font-mono bg-white/10 px-1 rounded">bg-color/12–15</code> fill + <code className="font-mono bg-white/10 px-1 rounded">border-color/45–50</code>. Body: <code className="font-mono bg-white/10 px-1 rounded">text-white/75</code>. Info uses neutral white.</p>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Default export ────────────────────────────────────────────

export default function OverlaysSection() {
    return (
        <>
            <ModalsSection />
            <TooltipsSection />
            <ToastsSection />
        </>
    );
}
