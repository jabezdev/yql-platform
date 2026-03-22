import { MessageCircle, AlignLeft, FileText, Star, Zap, Hash, Bell, Pin } from 'lucide-react';
import { UserAvatar } from '../../components/chat/shared/UserAvatar';
import { Section, Meta, Box, Grid, Callout } from './shared';

// ─── Chat System ──────────────────────────────────────────────

function ChatSection() {
    return (
        <Section id="chat" title="Chat System" icon={MessageCircle}>
            <Callout>
                Chat is YQL's real-time messaging layer. Own messages: right-aligned, <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">bg-brand-blue</code> bg. Others: left-aligned, white bg. Reactions and mentions follow brand token colors.
            </Callout>

            <Grid cols={2} className="mb-4">
                {/* Light chat */}
                <Box>
                    <Meta>Message bubbles — light</Meta>
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <UserAvatar name="Alice Johnson" size="xs" />
                            <div className="max-w-[80%]">
                                <p className="text-[10px] font-bold text-brand-blue/55 mb-1">Alice Johnson</p>
                                <div className="px-3 py-2 bg-white border-2 border-brand-blue/15 rounded-tl-xl rounded-br-xl rounded-tr-xl shadow-[2px_2px_0px_0px_rgba(57,103,153,0.08)]">
                                    <p className="text-sm text-brand-blue/80 leading-relaxed">Hey! Are you coming to the workshop on Friday?</p>
                                </div>
                                <p className="text-[9px] text-brand-blue/35 mt-1">2:30 PM</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 flex-row-reverse">
                            <UserAvatar name="You" size="xs" />
                            <div className="max-w-[80%]">
                                <div className="px-3 py-2 bg-brand-blue rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-[2px_2px_0px_0px_rgba(10,22,48,0.3)]">
                                    <p className="text-sm text-white leading-relaxed">Yes! Already signed up 🙌</p>
                                </div>
                                <p className="text-[9px] text-brand-blue/35 mt-1 text-right">2:31 PM · ✓✓</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <UserAvatar name="Alice Johnson" size="xs" />
                            <div className="max-w-[80%]">
                                <div className="px-3 py-2 bg-white border-2 border-brand-blue/15 rounded-tl-xl rounded-br-xl rounded-tr-xl shadow-[2px_2px_0px_0px_rgba(57,103,153,0.08)]">
                                    <p className="text-sm text-brand-blue/80 leading-relaxed">Great, see you there!</p>
                                </div>
                                <div className="flex gap-1 mt-1.5">
                                    {[{ e: '👍', n: 2, a: true }, { e: '🎉', n: 1, a: false }].map(({ e, n, a }) => (
                                        <button key={e} className={`flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-tl-md rounded-br-md border transition-colors ${a ? 'bg-brand-lightBlue/15 border-brand-lightBlue/40 text-brand-lightBlue' : 'bg-brand-bgLight border-brand-blue/15 text-brand-blue/60'}`}>
                                            <span>{e}</span><span className="font-bold">{n}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Box>

                {/* Dark chat */}
                <Box dark>
                    <Meta light>Message bubbles — dark</Meta>
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <UserAvatar name="Alice Johnson" size="xs" />
                            <div className="max-w-[80%]">
                                <p className="text-[10px] font-bold text-white/45 mb-1">Alice Johnson</p>
                                <div className="px-3 py-2 bg-white/10 border border-white/15 rounded-tl-xl rounded-br-xl rounded-tr-xl">
                                    <p className="text-sm text-white/80 leading-relaxed">Hey! Are you coming to the workshop?</p>
                                </div>
                                <p className="text-[9px] text-white/30 mt-1">2:30 PM</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 flex-row-reverse">
                            <UserAvatar name="You" size="xs" />
                            <div className="max-w-[80%]">
                                <div className="px-3 py-2 bg-brand-yellow/90 rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                                    <p className="text-sm text-brand-blue leading-relaxed">Yes! Already signed up 🙌</p>
                                </div>
                                <p className="text-[9px] text-white/30 mt-1 text-right">2:31 PM · ✓✓</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <UserAvatar name="Alice Johnson" size="xs" />
                            <div className="max-w-[80%]">
                                <div className="px-3 py-2 bg-white/10 border border-white/15 rounded-tl-xl rounded-br-xl rounded-tr-xl">
                                    <p className="text-sm text-white/80 leading-relaxed">Great, see you there!</p>
                                </div>
                                <div className="flex gap-1 mt-1.5">
                                    {[{ e: '👍', n: 2, a: true }, { e: '🎉', n: 1, a: false }].map(({ e, n, a }) => (
                                        <button key={e} className={`flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-tl-md rounded-br-md border transition-colors ${a ? 'bg-brand-yellow/20 border-brand-yellow/50 text-brand-yellow' : 'bg-white/8 border-white/15 text-white/55'}`}>
                                            <span>{e}</span><span className="font-bold">{n}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Box>
            </Grid>

            {/* Channel layout */}
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Channel layout — light (Slack/Discord style)</Meta>
                    <div className="rounded-tl-lg rounded-br-lg overflow-hidden border border-brand-blue/15 flex" style={{ height: 260 }}>
                        {/* Channel sidebar */}
                        <div className="w-28 bg-brand-blue flex-shrink-0 flex flex-col">
                            <div className="px-3 py-2.5 border-b border-white/10">
                                <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/40">YQL Workspace</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                                <p className="text-[8px] font-extrabold uppercase tracking-widest text-white/30 px-2 py-1">Channels</p>
                                {[
                                    { name: 'general', active: true },
                                    { name: 'announcements', active: false },
                                    { name: 'resources', active: false },
                                    { name: 'technical', active: false },
                                ].map(({ name, active }) => (
                                    <div key={name} className={`flex items-center gap-1.5 px-2 py-1 rounded-tl-md rounded-br-md cursor-pointer transition-colors ${active ? 'bg-white/15 border-l-2 border-brand-yellow pl-[6px]' : 'hover:bg-white/8'}`}>
                                        <Hash size={10} className={active ? 'text-brand-yellow' : 'text-white/40'} aria-hidden="true" />
                                        <span className={`text-[10px] font-medium truncate ${active ? 'text-white' : 'text-white/55'}`}>{name}</span>
                                    </div>
                                ))}
                                <p className="text-[8px] font-extrabold uppercase tracking-widest text-white/30 px-2 py-1 pt-3">Direct</p>
                                {['Alice J.', 'Bob C.'].map(name => (
                                    <div key={name} className="flex items-center gap-1.5 px-2 py-1 rounded-tl-md rounded-br-md cursor-pointer hover:bg-white/8">
                                        <span className="w-2 h-2 rounded-full bg-brand-green flex-shrink-0" />
                                        <span className="text-[10px] text-white/50 truncate">{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Message area */}
                        <div className="flex-1 flex flex-col min-w-0 bg-white">
                            {/* Channel header */}
                            <div className="px-3 py-2 border-b border-brand-blue/10 flex items-center gap-2 flex-shrink-0">
                                <Hash size={13} className="text-brand-blue/40" aria-hidden="true" />
                                <span className="text-xs font-bold text-brand-blue">general</span>
                                <span className="text-[10px] text-brand-blue/40 ml-1 hidden sm:inline">Team-wide announcements and updates</span>
                                <div className="ml-auto flex items-center gap-1.5">
                                    <Pin size={11} className="text-brand-blue/30" aria-hidden="true" />
                                    <Bell size={11} className="text-brand-blue/30" aria-hidden="true" />
                                </div>
                            </div>
                            {/* Messages */}
                            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                                {[
                                    { name: 'Alice Johnson', time: '9:14 AM', msg: 'Good morning! Reminder: committee leads please submit your weekly reports by 5 PM today.', avatar: true },
                                    { name: 'Bob Chen', time: '9:22 AM', msg: 'Will do! Do we use the same template as last week?', avatar: true },
                                    { name: 'Alice Johnson', time: '9:24 AM', msg: 'Yes, same template. Link in #resources.', avatar: false },
                                ].map(({ name, time, msg, avatar }, i) => (
                                    <div key={i} className="flex items-start gap-2 group">
                                        {avatar ? <UserAvatar name={name} size="xs" /> : <div className="w-6 flex-shrink-0" />}
                                        <div className="min-w-0">
                                            {avatar && (
                                                <div className="flex items-baseline gap-1.5 mb-0.5">
                                                    <span className="text-[10px] font-bold text-brand-blue">{name}</span>
                                                    <span className="text-[9px] text-brand-blue/35">{time}</span>
                                                </div>
                                            )}
                                            <p className="text-xs text-brand-blue/80 leading-relaxed group-hover:text-brand-blue transition-colors">{msg}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Composer */}
                            <div className="px-3 pb-3 flex-shrink-0">
                                <div className="border-2 border-brand-blue/15 rounded-tl-xl rounded-br-xl flex items-center gap-2 px-3 py-2">
                                    <span className="flex-1 text-xs text-brand-blue/30">Message #general</span>
                                    <button className="px-2.5 py-1 bg-brand-blue text-white text-[10px] font-bold rounded-tl-md rounded-br-md">Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Box>
                <Box dark>
                    <Meta light>Channel layout — dark</Meta>
                    <div className="rounded-tl-lg rounded-br-lg overflow-hidden border border-white/15 flex" style={{ height: 260 }}>
                        {/* Channel sidebar */}
                        <div className="w-28 bg-black/25 flex-shrink-0 flex flex-col">
                            <div className="px-3 py-2.5 border-b border-white/10">
                                <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/30">YQL Workspace</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                                <p className="text-[8px] font-extrabold uppercase tracking-widest text-white/25 px-2 py-1">Channels</p>
                                {[
                                    { name: 'general', active: true },
                                    { name: 'announcements', active: false },
                                    { name: 'resources', active: false },
                                    { name: 'technical', active: false },
                                ].map(({ name, active }) => (
                                    <div key={name} className={`flex items-center gap-1.5 px-2 py-1 rounded-tl-md rounded-br-md cursor-pointer transition-colors ${active ? 'bg-white/20 border-l-2 border-brand-yellow pl-[6px]' : 'hover:bg-white/8'}`}>
                                        <Hash size={10} className={active ? 'text-brand-yellow' : 'text-white/35'} aria-hidden="true" />
                                        <span className={`text-[10px] font-medium truncate ${active ? 'text-white' : 'text-white/45'}`}>{name}</span>
                                    </div>
                                ))}
                                <p className="text-[8px] font-extrabold uppercase tracking-widest text-white/25 px-2 py-1 pt-3">Direct</p>
                                {['Alice J.', 'Bob C.'].map(name => (
                                    <div key={name} className="flex items-center gap-1.5 px-2 py-1 rounded-tl-md rounded-br-md cursor-pointer hover:bg-white/8">
                                        <span className="w-2 h-2 rounded-full bg-brand-green flex-shrink-0" />
                                        <span className="text-[10px] text-white/40 truncate">{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Message area */}
                        <div className="flex-1 flex flex-col min-w-0 bg-white/5">
                            {/* Channel header */}
                            <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
                                <Hash size={13} className="text-white/35" aria-hidden="true" />
                                <span className="text-xs font-bold text-white">general</span>
                                <span className="text-[10px] text-white/35 ml-1 hidden sm:inline">Team-wide updates</span>
                                <div className="ml-auto flex items-center gap-1.5">
                                    <Pin size={11} className="text-white/25" aria-hidden="true" />
                                    <Bell size={11} className="text-white/25" aria-hidden="true" />
                                </div>
                            </div>
                            {/* Messages */}
                            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                                {[
                                    { name: 'Alice Johnson', time: '9:14 AM', msg: 'Good morning! Committee leads please submit reports by 5 PM today.', avatar: true },
                                    { name: 'Bob Chen', time: '9:22 AM', msg: 'Will do! Same template as last week?', avatar: true },
                                    { name: 'Alice Johnson', time: '9:24 AM', msg: 'Yes, link in #resources.', avatar: false },
                                ].map(({ name, time, msg, avatar }, i) => (
                                    <div key={i} className="flex items-start gap-2 group">
                                        {avatar ? <UserAvatar name={name} size="xs" /> : <div className="w-6 flex-shrink-0" />}
                                        <div className="min-w-0">
                                            {avatar && (
                                                <div className="flex items-baseline gap-1.5 mb-0.5">
                                                    <span className="text-[10px] font-bold text-white/85">{name}</span>
                                                    <span className="text-[9px] text-white/30">{time}</span>
                                                </div>
                                            )}
                                            <p className="text-xs text-white/70 leading-relaxed group-hover:text-white/85 transition-colors">{msg}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Composer */}
                            <div className="px-3 pb-3 flex-shrink-0">
                                <div className="border border-white/20 rounded-tl-xl rounded-br-xl bg-white/8 flex items-center gap-2 px-3 py-2">
                                    <span className="flex-1 text-xs text-white/30">Message #general</span>
                                    <button className="px-2.5 py-1 bg-brand-yellow text-brand-blue text-[10px] font-bold rounded-tl-md rounded-br-md">Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Box>
            </Grid>

            <Grid cols={2}>
                <Box>
                    <Meta>Mention chip &amp; composer — light</Meta>
                    <p className="text-sm text-brand-blue/80 leading-relaxed mb-4">
                        Hey{' '}
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-lightBlue/15 border border-brand-lightBlue/30 rounded-sm text-brand-lightBlue font-bold text-xs cursor-pointer hover:bg-brand-lightBlue/25 transition-colors">
                            @Alice
                        </span>
                        {' '}can you review this doc?
                    </p>
                    <div className="border-2 border-brand-blue/15 rounded-tl-xl rounded-br-xl overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2.5">
                            <span className="flex-1 text-sm text-brand-blue/35">Message #general — type <span className="text-brand-lightBlue">@</span> to mention…</span>
                            <div className="flex items-center gap-1.5">
                                {[FileText, Star, Zap].map((Icon, i) => (
                                    <button key={i} className="w-7 h-7 rounded-tl-md rounded-br-md hover:bg-brand-bgLight flex items-center justify-center transition-colors">
                                        <Icon size={13} className="text-brand-blue/40" aria-hidden="true" />
                                    </button>
                                ))}
                                <button className="px-3 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-tl-lg rounded-br-lg shadow-[2px_2px_0px_0px_rgba(10,22,48,0.4)] hover:bg-brand-darkBlue transition-colors ml-1">Send</button>
                            </div>
                        </div>
                    </div>
                </Box>
                <Box dark>
                    <Meta light>Mention chip &amp; composer — dark</Meta>
                    <p className="text-sm text-white/80 leading-relaxed mb-4">
                        Hey{' '}
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-yellow/20 border border-brand-yellow/40 rounded-sm text-brand-yellow font-bold text-xs cursor-pointer hover:bg-brand-yellow/30 transition-colors">
                            @Alice
                        </span>
                        {' '}can you review this?
                    </p>
                    <div className="border border-white/15 rounded-tl-xl rounded-br-xl overflow-hidden bg-white/8">
                        <div className="flex items-center gap-2 px-3 py-2.5">
                            <span className="flex-1 text-sm text-white/30">Message #general — type <span className="text-brand-yellow">@</span> to mention…</span>
                            <div className="flex items-center gap-1.5">
                                {[FileText, Star, Zap].map((Icon, i) => (
                                    <button key={i} className="w-7 h-7 rounded-tl-md rounded-br-md hover:bg-white/10 flex items-center justify-center transition-colors">
                                        <Icon size={13} className="text-white/35" aria-hidden="true" />
                                    </button>
                                ))}
                                <button className="px-3 py-1.5 bg-brand-yellow text-brand-blue text-xs font-bold rounded-tl-lg rounded-br-lg hover:bg-white transition-colors ml-1">Send</button>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-white/40 mt-3">Dark: own messages use <code className="font-mono bg-white/10 px-1 rounded">bg-brand-yellow</code> for contrast. Mentions swap to yellow chip. Composer send button: yellow.</p>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Copy & Content ───────────────────────────────────────────

function CopySection() {
    return (
        <Section id="copy" title="Copy &amp; Content" icon={AlignLeft}>
            <Grid cols={2} className="mb-4">
                <Box>
                    <Meta>Voice &amp; Tone</Meta>
                    <div className="space-y-2.5">
                        {[
                            { rule: 'Clear over clever', ex: '✓ "Submit your application" not "Make your mark today"' },
                            { rule: 'Action-first CTAs', ex: '✓ "Apply Now" · "View Members" · "Download PDF"' },
                            { rule: 'Title Case for headings', ex: '✓ "Resource Library" not "Resource library"' },
                            { rule: 'Sentence case for body', ex: '✓ "Track your progress here." not "Track Your Progress Here."' },
                            { rule: 'No exclamation marks in errors', ex: '✗ "Invalid email!" → ✓ "Enter a valid email address."' },
                        ].map(({ rule, ex }) => (
                            <div key={rule} className="pb-2.5 border-b border-brand-blue/5 last:border-0 last:pb-0">
                                <p className="text-xs font-bold text-brand-blue">{rule}</p>
                                <p className="text-[11px] text-brand-blue/60 mt-0.5">{ex}</p>
                            </div>
                        ))}
                    </div>
                </Box>
                <Box>
                    <Meta>Date &amp; Time Formatting</Meta>
                    <div className="space-y-2">
                        {[
                            { context: 'Full date (forms, detail pages)', format: 'March 22, 2026' },
                            { context: 'Short date (tables, chips)', format: 'Mar 22' },
                            { context: 'Relative (< 7 days)', format: '3 days ago · Yesterday · Just now' },
                            { context: 'Time (event scheduling)', format: '2:30 PM · 14:30 for intl.' },
                            { context: 'Date range', format: 'Mar 1 – Mar 31, 2026' },
                            { context: 'ISO (API / aria attributes)', format: '2026-03-22' },
                        ].map(({ context, format }) => (
                            <div key={context} className="pb-2 border-b border-brand-blue/5 last:border-0 last:pb-0">
                                <p className="text-[10px] font-bold text-brand-blue/65">{context}</p>
                                <code className="font-mono text-[10px] text-brand-lightBlue bg-brand-bgLight px-1.5 py-0.5 rounded mt-0.5 inline-block">{format}</code>
                            </div>
                        ))}
                    </div>
                </Box>
            </Grid>
            <Grid cols={2}>
                <Box>
                    <Meta>Error message anatomy</Meta>
                    <div className="p-3 border-2 border-brand-wine/30 rounded-tl-lg rounded-br-lg bg-brand-wine/5 mb-3">
                        <p className="text-xs font-bold text-brand-wine mb-1">This email is already registered.</p>
                        <p className="text-xs text-brand-blue/70">You have an account with this address.</p>
                        <p className="text-xs text-brand-lightBlue mt-1 cursor-pointer hover:text-brand-blue transition-colors">Try signing in instead →</p>
                    </div>
                    <div className="space-y-1.5 text-xs text-brand-blue/70">
                        <p><strong className="text-brand-blue">1. What went wrong</strong> — clear, specific, no jargon</p>
                        <p><strong className="text-brand-blue">2. Why it happened</strong> — only if non-obvious</p>
                        <p><strong className="text-brand-blue">3. How to fix it</strong> — actionable next step with link</p>
                    </div>
                </Box>
                <Box>
                    <Meta>Truncation patterns</Meta>
                    <div className="space-y-3">
                        {[
                            { label: 'Single line', cls: 'truncate', text: 'This is a very long member name that gets cut off with an ellipsis at the end' },
                            { label: 'Two lines', cls: 'line-clamp-2', text: 'Resource descriptions can span multiple lines. Clamp at 2 lines in card contexts and provide a tooltip for the full text.' },
                            { label: 'Three lines', cls: 'line-clamp-3', text: 'Longer descriptions use 3-line clamp. Always ensure a tooltip or expand option exists for truncated content that is critical to the user decision.' },
                        ].map(({ label, cls, text }) => (
                            <div key={label} className="pb-3 border-b border-brand-blue/5 last:border-0 last:pb-0">
                                <code className="font-mono text-[10px] text-brand-lightBlue bg-brand-bgLight px-1.5 py-0.5 rounded mb-1.5 inline-block">{cls}</code>
                                <p className={`text-xs text-brand-blue/70 ${cls}`}>{text}</p>
                            </div>
                        ))}
                    </div>
                </Box>
            </Grid>
        </Section>
    );
}

// ─── Default export ────────────────────────────────────────────

export default function PatternsSection() {
    return (
        <>
            <ChatSection />
            <CopySection />
        </>
    );
}
