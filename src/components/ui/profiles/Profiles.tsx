/**
 * Profiles — MemberCard, ProfileHeader
 *
 * Shared components for member identity UI.
 * These match the patterns documented in the /branding Profiles section.
 *
 * Import via: import { MemberCard, ProfileHeader } from '@/design'
 */

import { ArrowRight, Mail, Calendar, Users } from 'lucide-react';
import { Avatar, ChipFallback } from './Avatar';
import { type ReactNode } from 'react';

// ── MemberCard ─────────────────────────────────────────────────

interface MemberCardProps {
    name: string;
    role: string;
    /** Optional special role chips shown at the bottom (e.g. "Dev Lead", "Mentor"). */
    specialRoles?: string[];
    /** Short bio — truncated to 2 lines via `line-clamp-2`. */
    bio?: string;
    /** URL for the 3:1 banner image. Falls back to `ChipFallback` gradient. */
    chipUrl?: string;
    /** URL for the avatar image. Falls back to deterministic initial. */
    photoUrl?: string;
    onClick?: () => void;
    className?: string;
}

/**
 * Compact directory card. Used in the Network member grid.
 *
 * - 3:1 chip banner (custom image or branded gradient fallback)
 * - Avatar overlapping the banner edge
 * - Name, role label, optional bio (2-line clamp)
 * - Special role chips
 *
 * ```tsx
 * <MemberCard
 *   name="Jamie Chen"
 *   role="T3 — Coordinator"
 *   specialRoles={['Dev Lead', 'Mentor']}
 *   bio="Building tools at the intersection of quantum science and education."
 * />
 * ```
 */
export function MemberCard({
    name,
    role,
    specialRoles,
    bio,
    chipUrl,
    photoUrl,
    onClick,
    className = '',
}: MemberCardProps) {
    return (
        <div
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
            className={[
                'bg-white rounded-tl-2xl rounded-br-2xl overflow-hidden',
                'border-2 border-brand-blue/15',
                'shadow-[3px_3px_0px_0px_rgba(57,103,153,0.08)]',
                'transition-all duration-200 group',
                onClick ? 'cursor-pointer hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.12)] hover:border-brand-blue/30' : '',
                className,
            ].join(' ')}
        >
            {/* 3:1 chip banner */}
            <div className="relative aspect-[3/1] overflow-hidden">
                {chipUrl ? (
                    <img src={chipUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <ChipFallback name={name} role={role} />
                )}
            </div>

            {/* Body */}
            <div className="relative z-10 px-4 pb-4">
                {/* Avatar row — overlaps banner */}
                <div className="flex items-end justify-between -mt-5 mb-3">
                    <Avatar name={name} photoUrl={photoUrl} size="md" border />
                    {onClick && (
                        <ArrowRight
                            size={14}
                            className="text-brand-blue/20 group-hover:text-brand-blue/50 group-hover:translate-x-0.5 transition-all duration-200 mb-0.5"
                            aria-hidden="true"
                        />
                    )}
                </div>

                <h3 className="font-display font-extrabold text-[15px] text-brand-blue leading-tight">{name}</h3>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/45 mt-0.5">{role}</p>

                {bio && (
                    <p className="text-xs text-brand-blue/60 mt-2.5 leading-relaxed line-clamp-2">{bio}</p>
                )}

                {specialRoles && specialRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {specialRoles.map(r => (
                            <span
                                key={r}
                                className="text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-sm bg-brand-lightBlue/8 text-brand-lightBlue border border-brand-lightBlue/20"
                            >
                                {r}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── ProfileHeader ──────────────────────────────────────────────

interface ProfileHeaderProps {
    name: string;
    role: string;
    /** Optional special role chips. */
    specialRoles?: string[];
    bio?: string;
    email?: string;
    /** Display string, e.g. "Q1 2026". */
    joinedLabel?: string;
    /** Display string, e.g. "Cohort 2". */
    cohortLabel?: string;
    /** URL for the 4:1 banner. Falls back to `ChipFallback`. */
    chipUrl?: string;
    photoUrl?: string;
    /** Slot for action buttons (Edit Profile, Message, etc.) */
    actions?: ReactNode;
    className?: string;
}

/**
 * Full-width identity block at the top of a member profile page.
 *
 * - 4:1 banner (wider crop of the same chip image)
 * - Avatar overlapping the banner edge (lg size with white ring)
 * - Name, role, special role chips, bio
 * - Meta row: email, join date, cohort
 * - `actions` slot for Edit/Message buttons
 *
 * ```tsx
 * <ProfileHeader
 *   name="Jamie Chen"
 *   role="T3 — Coordinator"
 *   email="jamie@example.com"
 *   joinedLabel="Q1 2026"
 *   cohortLabel="Cohort 2"
 *   actions={
 *     <>
 *       <Button variant="outline" size="sm">Edit Profile</Button>
 *       <Button variant="primary" size="sm">Message</Button>
 *     </>
 *   }
 * />
 * ```
 */
export function ProfileHeader({
    name,
    role,
    specialRoles,
    bio,
    email,
    joinedLabel,
    cohortLabel,
    chipUrl,
    photoUrl,
    actions,
    className = '',
}: ProfileHeaderProps) {
    const meta: { icon: typeof Mail; label: string }[] = [];
    if (email)       meta.push({ icon: Mail,     label: email });
    if (joinedLabel) meta.push({ icon: Calendar,  label: `Joined ${joinedLabel}` });
    if (cohortLabel) meta.push({ icon: Users,     label: cohortLabel });

    return (
        <div
            className={[
                'bg-white rounded-tl-2xl rounded-br-2xl overflow-hidden',
                'border-2 border-brand-blue/15',
                'shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)]',
                className,
            ].join(' ')}
        >
            {/* 4:1 banner */}
            <div className="relative aspect-[4/1] w-full overflow-hidden">
                {chipUrl ? (
                    <img src={chipUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <ChipFallback name={name} role={role} />
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 px-6 pb-6">
                {/* Avatar + actions */}
                <div className="flex items-end justify-between -mt-8 mb-5">
                    <Avatar name={name} photoUrl={photoUrl} size="lg" border />
                    {actions && (
                        <div className="flex gap-2 pb-0.5">
                            {actions}
                        </div>
                    )}
                </div>

                <h2 className="font-display font-extrabold text-2xl text-brand-blue leading-tight">{name}</h2>
                <p className="text-sm font-bold text-brand-lightBlue mt-0.5">{role}</p>

                {specialRoles && specialRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {specialRoles.map(r => (
                            <span
                                key={r}
                                className="text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-sm bg-brand-lightBlue/8 text-brand-lightBlue border border-brand-lightBlue/20"
                            >
                                {r}
                            </span>
                        ))}
                    </div>
                )}

                {bio && (
                    <p className="text-sm text-brand-blue/65 mt-3 max-w-xl leading-relaxed">{bio}</p>
                )}

                {meta.length > 0 && (
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4 pt-4 border-t-2 border-brand-blue/8">
                        {meta.map(({ icon: Icon, label }) => (
                            <span key={label} className="flex items-center gap-1.5 text-xs text-brand-blue/50 font-medium">
                                <Icon size={12} className="text-brand-blue/30" aria-hidden="true" />
                                {label}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export type { MemberCardProps, ProfileHeaderProps };
