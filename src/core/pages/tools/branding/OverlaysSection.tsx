import { useState } from 'react';
import { PanelRight, MessageCircle, Bell } from 'lucide-react';
import { Button, Modal, Drawer, Tooltip, Popover, Toast, Alert, Avatar } from '@/design';
import { Section, Meta, Box, Grid, Callout } from './shared';

// ─── Modals & Drawers ─────────────────────────────────────────

function ModalsSection() {
    const [modalLight, setModalLight] = useState(false);
    const [modalDark, setModalDark] = useState(false);
    const [drawerLight, setDrawerLight] = useState(false);
    const [drawerDark, setDrawerDark] = useState(false);

    return (
        <Section id="modals" title="Modals & Drawers" icon={PanelRight}>
            <Callout>
                Modals use <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">bg-black/50</code> backdrop + center alignment. Drawers slide from the right. Both trap focus, close on Escape, and sit at <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">z-40</code> / <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">z-30</code>.
            </Callout>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Live Modal — light</Meta>
                    <div className="flex items-center justify-center p-12 bg-brand-bgLight rounded-tl-lg rounded-br-lg">
                        <Button onClick={() => setModalLight(true)}>Open Modal</Button>
                    </div>
                    <Modal
                        open={modalLight}
                        onClose={() => setModalLight(false)}
                        title="Confirm Action"
                        footer={
                            <>
                                <Button variant="secondary" size="sm" onClick={() => setModalLight(false)}>Cancel</Button>
                                <Button variant="destructive" size="sm" onClick={() => setModalLight(false)}>Remove</Button>
                            </>
                        }
                    >
                        <p className="text-xs text-brand-blue/70 leading-relaxed">Are you sure you want to remove this member? This action cannot be undone.</p>
                    </Modal>
                </Box>
                <Box>
                    <Meta>Live Drawer — light</Meta>
                    <div className="flex items-center justify-center p-12 bg-brand-bgLight rounded-tl-lg rounded-br-lg">
                        <Button onClick={() => setDrawerLight(true)}>Open Drawer</Button>
                    </div>
                    <Drawer
                        open={drawerLight}
                        onClose={() => setDrawerLight(false)}
                        title="Member Details"
                        footer={
                            <>
                                <Button className="w-full" onClick={() => setDrawerLight(false)}>Save Changes</Button>
                            </>
                        }
                    >
                        <div className="space-y-4">
                            {[70, 90, 60, 80].map((w, i) => (
                                <div key={i} className={`h-3 rounded-sm bg-brand-blue/${i === 0 ? '15' : '8'}`} style={{ width: `${w}%` }} />
                            ))}
                        </div>
                    </Drawer>
                </Box>
            </Grid>

            <Grid cols={2}>
                <Box dark>
                    <Meta light>Live Modal — dark</Meta>
                    <div className="flex items-center justify-center p-12 bg-white/5 rounded-tl-lg rounded-br-lg">
                        <Button variant="secondary" onClick={() => setModalDark(true)}>Open Dark Modal</Button>
                    </div>
                    <Modal
                        open={modalDark}
                        onClose={() => setModalDark(false)}
                        title="Confirm Action"
                        dark
                        footer={
                            <>
                                <button className="px-3 py-1.5 text-xs font-bold rounded-tl-lg rounded-br-lg border border-white/20 text-white/70 hover:text-white transition-colors" onClick={() => setModalDark(false)}>Cancel</button>
                                <button className="px-3 py-1.5 text-xs font-bold rounded-tl-lg rounded-br-lg bg-brand-red/80 border border-brand-red/60 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)]" onClick={() => setModalDark(false)}>Remove</button>
                            </>
                        }
                    >
                        <p className="text-xs text-white/65 leading-relaxed">Are you sure you want to remove this member?</p>
                    </Modal>
                </Box>
                <Box dark>
                    <Meta light>Live Drawer — dark</Meta>
                    <div className="flex items-center justify-center p-12 bg-white/5 rounded-tl-lg rounded-br-lg">
                        <Button variant="secondary" onClick={() => setDrawerDark(true)}>Open Dark Drawer</Button>
                    </div>
                    <Drawer
                        open={drawerDark}
                        onClose={() => setDrawerDark(false)}
                        title="Member Details"
                        dark
                        footer={
                            <>
                                <button className="w-full px-3 py-1.5 text-xs font-bold rounded-tl-lg rounded-br-lg bg-brand-yellow text-brand-blue shadow-[2px_2px_0px_0px_rgba(0,0,0,0.35)]" onClick={() => setDrawerDark(false)}>Save Changes</button>
                            </>
                        }
                    >
                        <div className="space-y-4">
                            {[70, 90, 60, 80].map((w, i) => (
                                <div key={i} className={`h-3 rounded-sm ${i === 0 ? 'bg-white/20' : 'bg-white/10'}`} style={{ width: `${w}%` }} />
                            ))}
                        </div>
                    </Drawer>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Tooltips & Popovers ──────────────────────────────────────

function TooltipsSection() {
    return (
        <Section id="tooltips" title="Tooltips &amp; Popovers" icon={MessageCircle}>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Tooltip — light surface (dark tooltip)</Meta>
                    <div className="grid grid-cols-2 gap-4 py-6">
                        {[
                            { label: 'Top', placement: 'top' as const },
                            { label: 'Bottom', placement: 'bottom' as const },
                        ].map(({ label, placement }) => (
                            <div key={label} className="flex items-center justify-center py-6">
                                <Tooltip content={`${label} tooltip`} placement={placement}>
                                    <button className="px-3 py-1.5 text-xs font-bold bg-brand-bgLight border-2 border-brand-blue/15 rounded-tl-lg rounded-br-lg text-brand-blue/70">
                                        Hover
                                    </button>
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-brand-blue/65"><code className="font-mono bg-brand-bgLight px-1 rounded">bg-brand-blue</code> · white text · asymmetric radius · <code className="font-mono bg-brand-bgLight px-1 rounded">duration-75</code>. Also supports Right/Left placements.</p>
                </Box>
                <Box dark>
                    <Meta light>Tooltip — dark surface (inverted)</Meta>
                    <div className="grid grid-cols-2 gap-4 py-6">
                        {[
                            { label: 'Top', placement: 'top' as const },
                            { label: 'Bottom', placement: 'bottom' as const },
                        ].map(({ label, placement }) => (
                            <div key={label} className="flex items-center justify-center py-6">
                                <Tooltip content={`${label} tooltip`} placement={placement} dark>
                                    <button className="px-3 py-1.5 text-xs font-bold bg-white/10 border border-white/20 rounded-tl-lg rounded-br-lg text-white/65">
                                        Hover
                                    </button>
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-white/40">On dark surfaces, invert the tooltip: <code className="font-mono bg-white/10 px-1 rounded">bg-white text-brand-blue</code>. Shadow: <code className="font-mono bg-white/10 px-1 rounded">rgba(0,0,0,0.35)</code>.</p>
                </Box>
            </Grid>

            <Grid cols={2}>
                <Box>
                    <Meta>Popover — light surface</Meta>
                    <Popover
                        trigger={({ open, onToggle }) => (
                            <button
                                onClick={onToggle}
                                className={`px-3 py-1.5 text-xs font-bold border-2 rounded-tl-lg rounded-br-lg transition-colors mb-2 ${open ? 'bg-brand-blue text-white border-brand-blue' : 'bg-brand-bgLight border-brand-blue/15 text-brand-blue/70 hover:border-brand-blue/30'}`}
                            >
                                User Info {open ? '↑' : '↓'}
                            </button>
                        )}
                    >
                        <div className="p-3 flex items-center gap-2.5 border-b border-brand-blue/8">
                            <Avatar name="Alice Johnson" size="sm" />
                            <div>
                                <p className="text-xs font-bold text-brand-blue">Alice Johnson</p>
                                <p className="text-[10px] text-brand-blue/55">Technical Committee Lead</p>
                            </div>
                        </div>
                        <div className="p-3 space-y-1.5">
                            <p className="text-[10px] text-brand-blue/55 font-mono">alice@example.com</p>
                            <p className="text-[10px] text-brand-green font-bold">● Active</p>
                        </div>
                    </Popover>
                    <p className="text-xs text-brand-blue/65 mt-3">Popover: white bg · <code className="font-mono text-[10px] bg-brand-bgLight px-1 rounded">rounded-tl-xl rounded-br-xl</code> · structured content (user cards, menus, info panels).</p>
                </Box>
                <Box dark>
                    <Meta light>Popover — dark surface</Meta>
                    <div className="mb-4">
                        <Popover
                            dark
                            trigger={({ open, onToggle }) => (
                                <button
                                    onClick={onToggle}
                                    className={`px-3 py-1.5 text-xs font-bold bg-white/10 border border-white/20 rounded-tl-lg rounded-br-lg transition-colors mb-2 ${open ? 'text-white' : 'text-white/65'}`}
                                >
                                    User Info {open ? '↑' : '↓'}
                                </button>
                            )}
                        >
                            <div className="p-3 flex items-center gap-2.5 border-b border-white/10">
                                <Avatar name="Alice Johnson" size="sm" />
                                <div>
                                    <p className="text-xs font-bold text-white">Alice Johnson</p>
                                    <p className="text-[10px] text-white/55">Technical Committee Lead</p>
                                </div>
                            </div>
                            <div className="p-3 space-y-1.5">
                                <p className="text-[10px] text-white/45 font-mono">alice@example.com</p>
                                <p className="text-[10px] text-brand-green font-bold">● Active</p>
                            </div>
                        </Popover>
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
                        <Toast variant="success" title="Success" message="Changes saved successfully." />
                        <Toast variant="warning" title="Warning" message="Session expires in 5 minutes." />
                        <Toast variant="error" title="Error" message="Failed to save. Please try again." />
                        <Toast variant="info" title="Info" message="New resources are available." />
                    </div>
                </Box>
                <Box>
                    <Meta>Inline alerts — persistent (light)</Meta>
                    <div className="space-y-2">
                        <Alert variant="success" message="Application submitted." />
                        <Alert variant="warning" message="Complete your profile before the deadline." />
                        <Alert variant="error" message="Some fields have validation errors." />
                        <Alert variant="info" message="Review period closes March 31." />
                    </div>
                </Box>
            </Grid>

            {/* Dark toasts */}
            <Grid cols={2}>
                <Box dark>
                    <Meta light>Toast stack — dark surface</Meta>
                    <div className="space-y-2">
                        <Toast variant="success" title="Success" message="Changes saved successfully." dark />
                        <Toast variant="warning" title="Warning" message="Session expires in 5 minutes." dark />
                        <Toast variant="error" title="Error" message="Failed to save. Try again." dark />
                        <Toast variant="info" title="Info" message="New resources available." dark />
                    </div>
                    <p className="text-[10px] text-white/40 mt-2">Dark toasts: colored bg fill (<code className="font-mono bg-white/10 px-1 rounded">/12–15</code>) + strong border (<code className="font-mono bg-white/10 px-1 rounded">/50–55</code>) for clear type distinction.</p>
                </Box>
                <Box dark>
                    <Meta light>Inline alerts — dark surface</Meta>
                    <div className="space-y-2">
                        <Alert variant="success" message="Application submitted." dark />
                        <Alert variant="warning" message="Complete profile before deadline." dark />
                        <Alert variant="error" message="Some fields have errors." dark />
                        <Alert variant="info" message="Review period closes March 31." dark />
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
