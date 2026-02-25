import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Search, Filter, Shield, User, Mail, Settings, X } from "lucide-react";
import { useAuthContext } from "../providers/AuthProvider";
import { ProfileCard } from "../components/profile/ProfileCard";
import { ProfileEditor } from "../components/profile/ProfileEditor";

export default function DirectoryPage() {
    const { user: currentUser } = useAuthContext();
    const staffMembers = useQuery(api.hr.getAllStaff);
    const triggerCycle = useMutation(api.hr.triggerRecommitmentCycle);
    const endCycle = useMutation(api.hr.endRecommitmentCycle);
    const respondRecommitment = useMutation(api.hr.respondToRecommitment);

    const [searchQuery, setSearchQuery] = useState("");
    const [subRoleFilter, setSubRoleFilter] = useState<string>("All");
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    if (staffMembers === undefined) {
        return <div className="p-8 text-center text-gray-500">Loading Directory...</div>;
    }

    const filteredStaff = staffMembers.filter((member: any) => {
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = subRoleFilter === "All" || member.staffSubRole === subRoleFilter;
        return matchesSearch && matchesRole;
    });

    const isAdmin = currentUser?.role === "Admin";
    const isStaff = currentUser?.role === "Staff";

    const needsToRespond = currentUser && isStaff && currentUser.recommitmentStatus === "pending";

    const initialData = currentUser ? {
        bio: currentUser.bio,
        favoriteShape: currentUser.favoriteShape,
        favoriteColor: currentUser.favoriteColor,
        techStackIcon: currentUser.techStackIcon,
    } : null;

    return (
        <div className="max-w-7xl mx-auto space-y-8 relative">
            <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 sm:p-8 rounded-tl-2xl rounded-br-2xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] gap-4">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight text-brand-blueDark">
                        The Network
                    </h1>
                    <p className="text-brand-darkBlue/70 mt-2 font-medium text-lg">Discover and connect with YQL staff and alumni.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-brand-blueDark text-sm font-bold border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] hover:-translate-y-0.5 hover:shadow-[2px_4px_0px_0px_rgba(57,103,153,0.5)] transition-all rounded-lg"
                    >
                        <User size={18} className="text-brand-blue" /> My Profile
                    </button>
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => triggerCycle()}
                                className="px-6 py-3 bg-brand-yellow/20 text-brand-blueDark border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] text-sm font-bold rounded-lg hover:-translate-y-0.5 hover:shadow-[2px_4px_0px_0px_rgba(57,103,153,0.5)] transition-all uppercase tracking-wide"
                            >
                                Trigger Recommitment
                            </button>
                            <button
                                onClick={() => endCycle()}
                                className="px-6 py-3 bg-brand-red/10 text-brand-red border-2 border-brand-red/20 shadow-[2px_2px_0px_0px_rgba(57,103,153,0.1)] text-sm font-bold rounded-lg hover:bg-brand-red/20 transition-all uppercase tracking-wide"
                            >
                                End Cycle
                            </button>
                        </>
                    )}
                </div>
            </div>

            {needsToRespond && (
                <div className="bg-brand-blue/5 border-2 border-brand-blueDark/20 rounded-tl-xl rounded-br-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)]">
                    <div>
                        <h2 className="text-xl font-display font-extrabold text-brand-blueDark flex items-center gap-3">
                            <Shield size={24} className="text-brand-blue" /> Time for Recommitment
                        </h2>
                        <p className="text-brand-darkBlue/70 font-medium mt-2">The current term is ending. Will you stay on as Staff, or step down to Alumni?</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <button
                            onClick={() => respondRecommitment({ response: "accepted" })}
                            className="px-6 py-3 bg-brand-green/20 text-brand-blueDark border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] font-bold rounded-lg hover:-translate-y-0.5 hover:shadow-[2px_4px_0px_0px_rgba(57,103,153,0.5)] transition-all uppercase tracking-wide text-sm"
                        >
                            Count me in
                        </button>
                        <button
                            onClick={() => respondRecommitment({ response: "declined" })}
                            className="px-6 py-3 bg-white text-brand-blueDark border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] font-bold rounded-lg hover:-translate-y-0.5 hover:shadow-[2px_4px_0px_0px_rgba(57,103,153,0.5)] transition-all uppercase tracking-wide text-sm"
                        >
                            Step down to Alumni
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-tl-xl rounded-br-xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)]">
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
                        value={subRoleFilter}
                        onChange={(e) => setSubRoleFilter(e.target.value)}
                        className="py-3 pl-2 pr-8 bg-transparent text-brand-blueDark font-bold focus:outline-none cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        <option value="All">All Roles</option>
                        <option value="Regular">Regular Staff</option>
                        <option value="Reviewer">Reviewers</option>
                        <option value="Alumni">Alumni</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStaff.map((member: any) => (
                    <div key={member._id} className="bg-white rounded-tl-2xl rounded-br-2xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,1)] transition-all group relative hover:-translate-y-1 flex flex-col h-full">
                        {/* Header Color Banner */}
                        <div className="h-20 bg-brand-bgLight/80 border-b-2 border-brand-blueDark/10 flex items-end justify-end p-4">
                            {member.role === "Admin" && <Shield size={24} className="text-brand-red/20 opacity-50 absolute top-4 right-4" />}
                        </div>

                        <div className="p-6 relative flex-1 flex flex-col">
                            {/* Avatar */}
                            <div className="absolute -top-12 left-6 w-20 h-20 bg-brand-yellow/20 rounded-tl-xl rounded-br-xl border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] flex items-center justify-center text-4xl font-display font-extrabold text-brand-blueDark overflow-hidden z-10 group-hover:scale-105 transition-transform">
                                {member.name.charAt(0)}
                            </div>

                            <div className="mt-8 flex flex-col flex-1">
                                <div>
                                    <h3 className="text-xl font-display font-extrabold text-brand-blueDark group-hover:text-brand-blue transition-colors truncate">
                                        {member.name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        {member.role === "Admin" ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] font-extrabold uppercase tracking-widest bg-brand-red/10 text-brand-red border border-brand-red/20">
                                                <Shield size={12} strokeWidth={3} /> Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] font-extrabold uppercase tracking-widest bg-brand-blue/10 text-brand-blueDark border border-brand-blueDark/20">
                                                <User size={12} strokeWidth={3} /> {member.staffSubRole || "Staff"}
                                            </span>
                                        )}
                                        {member.recommitmentStatus === "pending" && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-[9px] font-extrabold uppercase tracking-widest bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 pt-5 border-t-2 border-brand-blueDark/10 flex-1 flex flex-col justify-end space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-brand-blueDark font-bold bg-brand-bgLight/50 p-2.5 rounded-lg border border-brand-blueDark/10">
                                        <Mail size={16} className="text-brand-blue shrink-0" />
                                        <a href={`mailto:${member.email}`} className="hover:text-brand-blue truncate">
                                            {member.email}
                                        </a>
                                    </div>
                                    {member.bio && (
                                        <p className="line-clamp-2 text-sm text-brand-darkBlue/70 italic font-medium">"{member.bio}"</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredStaff.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)]">
                        <div className="w-20 h-20 mx-auto bg-brand-yellow/20 rounded-tl-xl rounded-br-xl border-2 border-brand-blueDark flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)]">
                            <User size={40} className="text-brand-blueDark" />
                        </div>
                        <h3 className="text-2xl font-display font-extrabold text-brand-blueDark mb-2">No Members Found</h3>
                        <p className="text-brand-darkBlue/70 font-medium">We couldn't find anyone matching your current filters.</p>
                    </div>
                )}
            </div>

            {/* Profile Settings Slide-over Modal */}
            {isProfileModalOpen && currentUser && initialData && (
                <div className="fixed inset-0 z-50 flex justify-end bg-brand-blueDark/80 backdrop-blur-sm transition-opacity">
                    <div className="w-full max-w-2xl bg-brand-bgLight h-full border-l-4 border-brand-blueDark shadow-[-12px_0px_0px_0px_rgba(37,99,235,0.2)] flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Modal Header */}
                        <div className="p-8 bg-white border-b-2 border-brand-blueDark flex justify-between items-center shrink-0 sticky top-0 z-20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand-blue/10 border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] rounded-tl-lg rounded-br-lg">
                                    <Settings size={28} className="text-brand-blueDark" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-display font-extrabold text-brand-blueDark">Profile Settings</h2>
                                    <p className="text-sm text-brand-darkBlue/70 font-medium">Manage your public directory appearance.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsProfileModalOpen(false)}
                                className="p-3 bg-brand-bgLight border-2 border-brand-blueDark rounded-lg text-brand-blueDark hover:bg-white hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.5)] transition-all"
                            >
                                <X size={24} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                            <section>
                                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-4 flex items-center gap-2">
                                    <User size={14} className="text-brand-blue" /> Preview
                                </h3>
                                <div className="flex justify-center bg-white p-8 rounded-tl-2xl rounded-br-2xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 rounded-full blur-2xl" />
                                    <div className="w-full max-w-sm relative z-10">
                                        <ProfileCard user={currentUser} />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-4 flex items-center gap-2">
                                    <Settings size={14} className="text-brand-blue" /> Edit Details
                                </h3>
                                <div className="bg-white p-8 rounded-tl-2xl rounded-br-2xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)]">
                                    <ProfileEditor initialData={initialData} />
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
