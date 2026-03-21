import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Search, Filter, Shield, User, Mail, ImageIcon } from "lucide-react";
import { useAuthContext } from "../providers/AuthProvider";
import { PageHeader } from "../components/ui/PageHeader";
import { isAdmin as checkAdmin, isStaff as checkStaff } from "../constants/roles";
import type { Role } from "../constants/roles";
import { ProfileSlideover } from "../components/profile/ProfileSlideover";

export default function DirectoryPage() {
    const { user: currentUser } = useAuthContext();
    const staffMembers = useQuery(api.users.getDirectory);
    const triggerCycle = useMutation(api.hr.triggerRecommitmentCycle);
    const endCycle = useMutation(api.hr.endRecommitmentCycle);
    const respondRecommitment = useMutation(api.hr.respondToRecommitment);

    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("All");
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    if (staffMembers === undefined) {
        return <div className="p-8 text-center text-gray-500">Loading Directory...</div>;
    }

    const filteredStaff = staffMembers.filter((member: any) => {
        const matchesSearch =
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole =
            roleFilter === "All" ||
            (roleFilter === "Alumni" && member.specialRoles?.includes("Alumni")) ||
            (roleFilter === "Reviewer" && member.specialRoles?.includes("Evaluator")) ||
            (roleFilter === "Staff" && !member.specialRoles?.includes("Alumni"));
        return matchesSearch && matchesRole;
    });

    const isAdmin = currentUser ? checkAdmin(currentUser.role as Role) : false;
    const isStaffUser = currentUser ? checkStaff(currentUser.role as Role) : false;
    const needsToRespond = currentUser && isStaffUser && currentUser.recommitmentStatus === "pending";

    const actions = (
        <div className="flex flex-wrap gap-3">
            <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-brand-blueDark text-sm font-bold border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(10,22,48,0.25)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(10,22,48,0.35)] transition-all rounded-lg"
            >
                <User size={16} className="text-brand-blue" /> My Profile
            </button>
            {isAdmin && (
                <>
                    <button
                        onClick={() => triggerCycle()}
                        className="px-5 py-2.5 bg-brand-yellow/20 text-brand-blueDark border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(10,22,48,0.25)] text-sm font-bold rounded-lg hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(10,22,48,0.35)] transition-all uppercase tracking-wide"
                    >
                        Trigger Recommitment
                    </button>
                    <button
                        onClick={() => endCycle()}
                        className="px-5 py-2.5 bg-white text-brand-wine border-2 border-brand-wine/40 hover:border-brand-wine text-sm font-bold rounded-lg hover:bg-brand-wine/5 transition-all uppercase tracking-wide"
                    >
                        End Cycle
                    </button>
                </>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <PageHeader
                title="The Network"
                subtitle="Discover and connect with YQL staff and alumni."
                action={actions}
            />

            {needsToRespond && (
                <div className="bg-brand-blue/5 border-2 border-brand-blueDark/20 rounded-tl-xl rounded-br-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[4px_4px_0px_0px_rgba(10,22,48,0.1)]">
                    <div>
                        <h2 className="text-xl font-display font-extrabold text-brand-blueDark flex items-center gap-3">
                            <Shield size={24} className="text-brand-blue" /> Time for Recommitment
                        </h2>
                        <p className="text-brand-darkBlue/70 font-medium mt-2">The current term is ending. Will you stay on as Staff, or step down to Alumni?</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <button
                            onClick={() => respondRecommitment({ response: "accepted" })}
                            className="px-6 py-3 bg-brand-green/20 text-brand-blueDark border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(10,22,48,0.25)] font-bold rounded-lg hover:-translate-y-0.5 transition-all uppercase tracking-wide text-sm"
                        >
                            Count me in
                        </button>
                        <button
                            onClick={() => respondRecommitment({ response: "declined" })}
                            className="px-6 py-3 bg-white text-brand-blueDark border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(10,22,48,0.25)] font-bold rounded-lg hover:-translate-y-0.5 transition-all uppercase tracking-wide text-sm"
                        >
                            Step down to Alumni
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-tl-xl rounded-br-xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(10,22,48,0.1)]">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blueDark/50" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:ring-0 focus:border-brand-blueDark focus:bg-white outline-none transition-all font-bold text-brand-blueDark placeholder:text-brand-blueDark/30"
                    />
                </div>
                <div className="flex items-center gap-2 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 focus-within:border-brand-blueDark rounded-lg px-3 transition-colors shrink-0">
                    <Filter className="text-brand-blue" size={18} />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="py-3 pl-2 pr-8 bg-transparent text-brand-blueDark font-bold focus:outline-none cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        <option value="All">All Members</option>
                        <option value="Staff">Active Staff</option>
                        <option value="Reviewer">Reviewers</option>
                        <option value="Alumni">Alumni</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStaff.map((member: any) => (
                    <MemberCard key={member._id} member={member} />
                ))}

                {filteredStaff.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-tl-2xl rounded-br-2xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(10,22,48,0.1)]">
                        <div className="w-20 h-20 mx-auto bg-brand-yellow/20 rounded-tl-xl rounded-br-xl border-2 border-brand-blueDark flex items-center justify-center mb-6">
                            <User size={40} className="text-brand-blueDark" />
                        </div>
                        <h3 className="text-2xl font-display font-extrabold text-brand-blueDark mb-2">No Members Found</h3>
                        <p className="text-brand-darkBlue/70 font-medium">We couldn't find anyone matching your current filters.</p>
                    </div>
                )}
            </div>

            {currentUser && (
                <ProfileSlideover
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    user={currentUser}
                />
            )}
        </div>
    );
}

function MemberCard({ member }: { member: any }) {
    const hasChip = !!member.profileChipUrl;

    return (
        <div className="bg-white rounded-tl-2xl rounded-br-2xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(10,22,48,0.12)] overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(10,22,48,0.3)] transition-all group hover:-translate-y-1 flex flex-col">
            {/* Profile Chip / Banner */}
            <div className="relative w-full aspect-[3/1] overflow-hidden bg-brand-bgLight border-b-2 border-brand-blueDark/10">
                {hasChip ? (
                    <img
                        src={member.profileChipUrl}
                        alt={`${member.name}'s profile chip`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="flex flex-col items-center gap-1 text-brand-blueDark/15">
                            <ImageIcon size={20} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">No chip yet</span>
                        </div>
                        {/* subtle geometric accent */}
                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-brand-yellow/20 rounded-tl-2xl rotate-12" />
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-blue/10 rounded-br-2xl -rotate-12" />
                    </div>
                )}
                {checkAdmin(member.role as Role) && (
                    <div className="absolute top-2 right-2 bg-brand-wine/90 text-white px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                        <Shield size={10} strokeWidth={3} /> Admin
                    </div>
                )}
            </div>

            {/* Card body */}
            <div className="p-5 flex flex-col gap-3 flex-1">
                <div>
                    <h3 className="text-base font-display font-extrabold text-brand-blueDark group-hover:text-brand-blue transition-colors leading-tight truncate">
                        {member.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[9px] font-extrabold uppercase tracking-widest bg-brand-blue/10 text-brand-blueDark border border-brand-blueDark/15">
                            {member.specialRoles?.includes("Alumni") ? "Alumni"
                                : member.specialRoles?.includes("Evaluator") ? "Reviewer"
                                    : member.role}
                        </span>
                        {member.recommitmentStatus === "pending" && (
                            <span className="inline-flex px-2 py-0.5 rounded-sm text-[9px] font-extrabold uppercase tracking-widest bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30">
                                Pending
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-brand-blueDark font-bold bg-brand-bgLight/60 px-3 py-2 rounded-lg border border-brand-blueDark/10">
                    <Mail size={13} className="text-brand-blue shrink-0" />
                    <a href={`mailto:${member.email}`} className="hover:text-brand-blue truncate">
                        {member.email}
                    </a>
                </div>

                {member.bio && (
                    <p className="text-xs text-brand-darkBlue/60 italic font-medium line-clamp-2">"{member.bio}"</p>
                )}
            </div>
        </div>
    );
}
