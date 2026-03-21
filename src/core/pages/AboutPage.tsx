import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ROLE_BADGE_COLORS, STAFF_ROLES } from "../constants/roles";
import type { Role } from "../constants/roles";
import { PageHeader } from "../components/ui/PageHeader";
import { Target, Heart, Layers, Users } from "lucide-react";

const TIER_DESCRIPTIONS: Partial<Record<Role, string>> = {
    "Super Admin": "Platform administrators with full system access.",
    T1: "Directors who set strategy, manage programs, and oversee operations.",
    T2: "Managers who coordinate teams, manage staff, and lead initiatives.",
    T3: "Senior members who mentor, lead projects, and run working groups.",
    T4: "Active members contributing to ongoing programs and events.",
    T5: "Associate members onboarding into the organization.",
};

const MISSION_POINTS = [
    {
        icon: <Target size={22} className="text-brand-blue" />,
        title: "Our Mission",
        body: "To cultivate the next generation of quantum computing professionals through hands-on research, industry exposure, and community-driven learning.",
    },
    {
        icon: <Heart size={22} className="text-brand-wine" />,
        title: "Our Values",
        body: "Inclusion, intellectual curiosity, and collaborative impact. We believe quantum computing should be accessible to everyone, regardless of background.",
    },
    {
        icon: <Layers size={22} className="text-brand-green" />,
        title: "Our Programs",
        body: "Structured cohorts, mentorship tracks, hackathons, and research partnerships with universities and industry leaders in the quantum ecosystem.",
    },
];

export default function AboutPage() {
    const staffMembers = useQuery(api.hr.getAllStaff);

    const staffByRole = STAFF_ROLES.reduce<Record<Role, typeof staffMembers>>((acc, role) => {
        acc[role] = staffMembers?.filter((m: any) => m.role === role) ?? [];
        return acc;
    }, {} as Record<Role, typeof staffMembers>);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-10 pb-8">
            <PageHeader
                title="About QCSP"
                subtitle="Who we are, what we do, and how we're structured."
                className="!mb-0"
            />

            {/* Mission cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MISSION_POINTS.map(point => (
                    <div key={point.title} className="bg-white border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] p-5 space-y-3">
                        <div className="w-10 h-10 bg-brand-bgLight border-2 border-brand-blueDark/20 rounded-tl-lg rounded-br-lg flex items-center justify-center">
                            {point.icon}
                        </div>
                        <h3 className="font-display font-extrabold text-brand-blueDark text-lg">{point.title}</h3>
                        <p className="text-sm text-brand-blueDark/70 font-medium leading-relaxed">{point.body}</p>
                    </div>
                ))}
            </div>

            {/* Team structure */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 bg-brand-yellow/20 border-2 border-brand-blueDark rounded-tl-lg rounded-br-lg flex items-center justify-center">
                        <Users size={16} className="text-brand-blueDark" />
                    </div>
                    <h2 className="text-xl font-display font-extrabold text-brand-blueDark">Our Team</h2>
                </div>

                <div className="space-y-4">
                    {STAFF_ROLES.map(role => {
                        const members = staffByRole[role];
                        const isLoading = staffMembers === undefined;
                        const displayMembers = members ?? [];

                        return (
                            <div key={role} className="bg-white border-2 border-brand-blueDark rounded-tl-xl rounded-br-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(57,103,153,0.1)]">
                                <div className="flex items-center justify-between p-4 border-b-2 border-brand-blueDark/10 bg-brand-bgLight/50">
                                    <div>
                                        <span className={`inline-block text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded border ${ROLE_BADGE_COLORS[role]}`}>
                                            {role}
                                        </span>
                                        <p className="text-xs font-medium text-brand-blueDark/50 mt-1.5">{TIER_DESCRIPTIONS[role]}</p>
                                    </div>
                                    {!isLoading && (
                                        <span className="text-xs font-extrabold text-brand-blueDark/30 uppercase tracking-widest">
                                            {displayMembers.length} member{displayMembers.length !== 1 ? "s" : ""}
                                        </span>
                                    )}
                                </div>
                                <div className="p-3">
                                    {isLoading ? (
                                        <div className="flex flex-wrap gap-2 animate-pulse">
                                            {[...Array(3)].map((_, i) => <div key={i} className="h-7 w-24 bg-brand-bgLight rounded-lg" />)}
                                        </div>
                                    ) : displayMembers.length === 0 ? (
                                        <p className="text-xs text-brand-blueDark/30 italic font-medium py-1 px-2">No members at this tier.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {displayMembers.map((m: any) => (
                                                <div
                                                    key={m._id}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-bgLight border border-brand-blueDark/10 rounded-lg"
                                                >
                                                    <div className="w-5 h-5 rounded bg-brand-yellow/30 border border-brand-blueDark/20 flex items-center justify-center text-[10px] font-extrabold text-brand-blueDark shrink-0">
                                                        {m.name.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-bold text-brand-blueDark">{m.name}</span>
                                                    {m.specialRoles?.includes("Alumni") && (
                                                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-blueDark/30">(Alumni)</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
