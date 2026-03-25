import { useState } from 'react';
import {
    User, Edit3, MessageSquare, Upload, ImageIcon,
    LogOut, Save, Check, X,
} from 'lucide-react';
import { Section, Meta, Callout } from './shared';

import { Avatar, ChipFallback, MemberCard, ProfileHeader } from '@/design';

const MEMBER_SAMPLES = [
    {
        name: 'Jamie Chen',
        role: 'T3 — Coordinator',
        specialRoles: ['Dev Lead', 'Mentor'],
        bio: 'Building tools at the intersection of quantum science and education. Passionate about accessible research infrastructure.',
    },
    {
        name: 'Alex Rivera',
        role: 'T2 — Manager',
        specialRoles: ['Operations'],
        bio: 'Managing cohort pipelines and volunteer coordination. Previously at CERN.',
    },
    {
        name: 'Sam Park',
        role: 'T4 — Associate',
        bio: 'First-year physics student exploring quantum computing. Interested in error correction and photonics.',
    },
    {
        name: 'Morgan Lee',
        role: 'T1 — Director',
        specialRoles: ['Founding Member', 'Research'],
        bio: 'Director of Research Programmes. PhD in condensed matter physics.',
    },
    {
        name: 'Jordan Wu',
        role: 'T5 — Volunteer',
        specialRoles: ['Outreach'],
        bio: 'Community outreach and event planning. Connecting students with quantum opportunities.',
    },
    {
        name: 'Casey Obi',
        role: 'T3 — Coordinator',
        specialRoles: ['Creative'],
        bio: 'Design + comms. Keeping the brand sharp and the newsletter on time.',
    },
];

// ══════════════════════════════════════════════════════════════
// 3. EditPanel
// ══════════════════════════════════════════════════════════════

function EditPanel() {
    const name = 'Jamie Chen';
    const role = 'T3 — Coordinator';
    const [bio, setBio] = useState('Building tools at the intersection of quantum science and education.');
    const [pronouns, setPronouns] = useState('they/them');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
    };

    return (
        <div className="flex gap-8 items-start flex-col lg:flex-row">
            {/* Panel mockup */}
            <div className="w-full max-w-[22rem] flex-shrink-0 bg-white rounded-tl-2xl rounded-br-2xl overflow-hidden border-2 border-brand-blue/20 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)]">

                {/* Header bar */}
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-blue/8">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50">Edit Profile</span>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg border-2 border-brand-blue/15 text-brand-blue/40 hover:text-brand-blue hover:bg-brand-bgLight transition-all">
                        <X size={13} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Photo */}
                <div className="px-5 py-5 border-b-2 border-brand-blue/8">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/45 mb-3">Photo</p>
                    <div className="flex items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <Avatar name={name} size="lg" />
                            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/35 transition-all flex items-center justify-center">
                                <Upload size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-brand-blue leading-tight">{name}</p>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/45 mt-0.5">{role}</p>
                            <button className="text-[10px] font-bold text-brand-lightBlue mt-1.5 hover:underline transition-all">
                                Change photo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Network Card (chip) */}
                <div className="px-5 py-5 border-b-2 border-brand-blue/8 space-y-2.5">
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/45 mb-0.5">Network Card</p>
                        <p className="text-[10px] text-brand-blue/40 leading-relaxed">3:1 image — shown as your card in the member directory.</p>
                    </div>
                    <div className="relative aspect-[3/1] rounded-tl-xl rounded-br-xl overflow-hidden border-2 border-dashed border-brand-blue/25 bg-brand-bgLight cursor-pointer group hover:border-brand-lightBlue/50 transition-colors">
                        <ChipFallback name={name} role={role} />
                        <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/30 transition-all flex items-center justify-center gap-1.5">
                            <Upload size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">Replace</span>
                        </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-brand-blue/15 rounded-lg text-[10px] font-bold text-brand-blue hover:bg-brand-bgLight hover:border-brand-blue/30 transition-all">
                        <ImageIcon size={11} /> Upload new image
                    </button>
                </div>

                {/* Form fields */}
                <div className="px-5 py-5 border-b-2 border-brand-blue/8 space-y-4">
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/45 mb-1.5">
                            Pronouns
                        </label>
                        <input
                            type="text"
                            value={pronouns}
                            onChange={e => setPronouns(e.target.value)}
                            placeholder="e.g. they/them"
                            className="w-full px-3 py-2 text-sm border-2 border-brand-blue/20 rounded-tl-lg rounded-br-lg bg-white text-brand-blue placeholder:text-brand-blue/30 focus:outline-none focus:border-brand-lightBlue focus:ring-2 focus:ring-brand-blue/12 transition-[border-color,box-shadow] duration-150"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/45 mb-1.5">
                            Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value.slice(0, 200))}
                            rows={4}
                            placeholder="Tell the team about yourself…"
                            className="w-full px-3 py-2 text-sm border-2 border-brand-blue/20 rounded-tl-lg rounded-br-lg bg-white text-brand-blue placeholder:text-brand-blue/30 focus:outline-none focus:border-brand-lightBlue focus:ring-2 focus:ring-brand-blue/12 transition-[border-color,box-shadow] duration-150 resize-none leading-relaxed"
                        />
                        <p className={`text-right text-[10px] font-medium mt-0.5 transition-colors ${bio.length >= 190 ? 'text-brand-wine' : 'text-brand-blue/35'}`}>
                            {bio.length}/200
                        </p>
                    </div>
                </div>

                {/* Save */}
                <div className="px-5 py-4">
                    <button
                        onClick={handleSave}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-tl-xl rounded-br-xl border-2 transition-all duration-200 ${
                            saved
                                ? 'bg-brand-green/90 text-white border-brand-green'
                                : 'bg-brand-blue text-white border-brand-blue shadow-[3px_3px_0px_0px_rgba(10,22,48,0.35)] hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_rgba(10,22,48,0.4)]'
                        }`}
                    >
                        {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Changes</>}
                    </button>
                </div>

                {/* Sign out */}
                <div className="px-5 py-4 border-t-2 border-brand-blue/8 bg-brand-bgLight/60">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-brand-wine border-2 border-brand-wine/25 rounded-xl hover:bg-brand-wine/8 hover:border-brand-wine/45 transition-all">
                        <LogOut size={13} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Anatomy notes */}
            <div className="flex-1 space-y-0 divide-y-2 divide-brand-blue/6">
                {[
                    ['Header',        'Title + close ×. Fixed at top, always in view as the panel scrolls.'],
                    ['Photo',         'Avatar circle with hover overlay (Upload icon). Name + role shown as read-only context — sourced from the auth provider, not editable here.'],
                    ['Network Card',  'The 3:1 chip. Hover reveals a "Replace" overlay. Clicking opens a file picker. Fallback shows a branded gradient until an image is uploaded.'],
                    ['Pronouns',      'Optional free-text. Displayed below name in the directory card and on the full profile.'],
                    ['Bio',           '200-char max. Shown in full on the profile page; truncated to 2 lines on the directory card. Counter turns wine at 190+.'],
                    ['Save',          'Button is the only feedback mechanism — turns green with a checkmark on success. No toast. No modal. No spinner unless latency exceeds ~300 ms.'],
                    ['Sign Out',      'Footer zone, brand-wine, visually separated. Destructive placement keeps it clearly distinct from the save action.'],
                ].map(([label, desc]) => (
                    <div key={label} className="py-3 flex gap-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-brand-blue w-24 shrink-0 pt-0.5">{label}</span>
                        <span className="text-xs text-brand-blue/60 leading-relaxed">{desc}</span>
                    </div>
                ))}
                <p className="pt-3 text-[10px] text-brand-blue/40 leading-relaxed">
                    In production: <code className="font-mono bg-white px-1 py-0.5 rounded border border-brand-blue/10">fixed right-0 h-full max-w-sm border-l-4 border-brand-blue</code> · backdrop <code className="font-mono bg-white px-1 py-0.5 rounded border border-brand-blue/10">bg-brand-blue/70 backdrop-blur-sm</code> · enters via <code className="font-mono bg-white px-1 py-0.5 rounded border border-brand-blue/10">slide-in-from-right duration-300</code>.
                </p>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// Section default export
// ══════════════════════════════════════════════════════════════

export default function ProfilesSection() {
    return (
        <Section id="profiles" title="Profiles" icon={User}>

            {/* ── Member Card ────────────────────────────────── */}
            <div className="mb-14">
                <Meta>Member Card — compact directory card</Meta>
                <Callout>
                    Used in the Network directory. The <strong>3:1 chip</strong> is the member&apos;s personal banner — upload a custom image or the system renders a branded gradient fallback with a watermark initial.
                    Avatar is a plain circle: deterministic colour derived from the member&apos;s name, no customisation required.
                    No clip-paths. No shape pickers. No icon pickers.
                </Callout>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {MEMBER_SAMPLES.map(m => (
                        <MemberCard key={m.name} {...m} />
                    ))}
                </div>

                <p className="text-[10px] text-brand-blue/45 leading-relaxed mt-3">
                    Avatar colour: deterministic — <code className="font-mono bg-white px-1 py-0.5 rounded border border-brand-blue/10">name.charCodeAt(0) % 5</code> picks from a palette of 5 brand-harmonious colours. Consistent across every render without any user input.
                    Chip fallback: <code className="font-mono bg-white px-1 py-0.5 rounded border border-brand-blue/10">from-[#172b4d] via-brand-blue to-[#1e4a7a]</code> gradient with dot grid, diagonal accent, and watermark initial.
                </p>
            </div>

            {/* ── Profile Header ─────────────────────────────── */}
            <div className="mb-14">
                <Meta>Profile Header — full page identity block</Meta>
                <Callout>
                    Used at the top of each member&apos;s profile page. The banner scales to <code className="font-mono text-[10px]">aspect-[4/1]</code> — wider than the chip to give the page breathing room.
                    Avatar overlaps the banner edge. Action buttons are anchored to the right of the identity block.
                </Callout>
                <ProfileHeader
                    name="Jamie Chen"
                    role="T3 — Coordinator"
                    specialRoles={['Dev Lead', 'Mentor']}
                    bio="Building tools at the intersection of quantum science and education. Passionate about accessible research infrastructure and mentoring the next generation of physicists."
                    email="jamie@example.com"
                    joinedLabel="Q1 2026"
                    cohortLabel="Cohort 2"
                    actions={
                        <>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-blue border-2 border-brand-blue/25 rounded-tl-lg rounded-br-lg hover:bg-brand-bgLight transition-all">
                                <Edit3 size={12} /> Edit Profile
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-brand-blue text-white border-2 border-brand-blue rounded-tl-lg rounded-br-lg shadow-[2px_2px_0px_0px_rgba(10,22,48,0.35)] hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(10,22,48,0.4)] transition-all">
                                <MessageSquare size={12} /> Message
                            </button>
                        </>
                    }
                />

                <p className="text-[10px] text-brand-blue/45 leading-relaxed mt-3">
                    Banner: <code className="font-mono bg-white px-1 py-0.5 rounded border border-brand-blue/10">aspect-[4/1]</code> on the profile page vs <code className="font-mono bg-white px-1 py-0.5 rounded border border-brand-blue/10">aspect-[3/1]</code> on the card — same image, different crop via <code className="font-mono bg-white px-1 py-0.5 rounded border border-brand-blue/10">object-cover</code>.
                    Avatar: <code className="font-mono bg-white px-1 py-0.5 rounded border border-brand-blue/10">w-16 h-16 -mt-8 ring-[3px] ring-white</code> — the white ring creates separation from the banner colour.
                </p>
            </div>

            {/* ── Edit Panel ─────────────────────────────────── */}
            <div>
                <Meta>Edit Panel — right slideover</Meta>
                <Callout>
                    Triggered from the workspace header avatar. Handles photo, network card (chip), pronouns, and bio.
                    The save button is the sole feedback mechanism — it turns green on success. No toasts. No modals.
                </Callout>
                <EditPanel />
            </div>

        </Section>
    );
}
