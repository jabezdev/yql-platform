import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ROLE_BADGE_COLORS, STAFF_ROLES } from "../../constants/roles";
import type { Role } from "../../constants/roles";
import { PageHeader } from "../../components/ui/structure/PageHeader";
import { CheckCircle2, Clock, CheckSquare, AlertCircle } from "lucide-react";

export default function VolunteerMatrixPage() {
    const staffMembers = useQuery(api.hr.getAllStaff);
    const openTasks = useQuery(api.openTasks.getOpenTasks, {});

    const ROLE_ORDER: Role[] = STAFF_ROLES;

    const sortedStaff = [...(staffMembers ?? [])].sort((a: any, b: any) => {
        const aIdx = ROLE_ORDER.indexOf(a.role);
        const bIdx = ROLE_ORDER.indexOf(b.role);
        if (aIdx !== bIdx) return aIdx - bIdx;
        return a.name.localeCompare(b.name);
    });

    const getTasksForMember = (userId: string) =>
        (openTasks ?? []).filter((t: any) => t.assignedTo?.toString() === userId && t.status !== "done");

    const formatDate = (ts: number) =>
        new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return (
        <div className="w-full h-full flex flex-col space-y-6 overflow-hidden">
            <PageHeader
                title="Volunteer Matrix"
                subtitle="A snapshot of staff, their tier, and active work."
                className="!mb-0 shrink-0"
            />

            {/* Legend */}
            <div className="flex flex-wrap gap-4 shrink-0">
                {[
                    { icon: <CheckCircle2 size={14} className="text-brand-green" />, label: "Has active tasks" },
                    { icon: <Clock size={14} className="text-brand-yellow" />, label: "Alumni (inactive)" },
                    { icon: <AlertCircle size={14} className="text-brand-red" />, label: "Recommitment pending" },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5 text-xs font-bold text-brand-blue/60">
                        {item.icon} {item.label}
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                {!staffMembers ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-32 bg-white border-2 border-brand-blue/10 rounded-tl-xl rounded-br-xl animate-pulse" />
                        ))}
                    </div>
                ) : sortedStaff.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-brand-blue/40">
                        <p className="font-bold">No staff members found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                        {sortedStaff.map((member: any) => {
                            const activeTasks = getTasksForMember(member._id);
                            const isAlumni = member.specialRoles?.includes("Alumni");
                            const needsRecommitment = member.recommitmentStatus === "pending";

                            return (
                                <div
                                    key={member._id}
                                    className={`bg-white border-2 rounded-tl-xl rounded-br-xl shadow-[3px_3px_0px_0px_rgba(57,103,153,0.1)] flex flex-col gap-3 p-4 transition-all ${isAlumni ? "border-brand-blue/20 opacity-60" : "border-brand-blue hover:shadow-[3px_3px_0px_0px_rgba(57,103,153,0.5)] hover:-translate-y-0.5"}`}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 bg-brand-yellow/30 border-2 border-brand-blue rounded-tl-lg rounded-br-lg flex items-center justify-center text-sm font-extrabold text-brand-blue shrink-0">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-brand-blue text-sm leading-tight truncate">{member.name}</p>
                                                <p className="text-[10px] font-medium text-brand-blue/40 truncate">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end shrink-0">
                                            {needsRecommitment && (
                                                <AlertCircle size={14} className="text-brand-red" />
                                            )}
                                            {isAlumni && (
                                                <Clock size={14} className="text-brand-yellow" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Role badge */}
                                    <span className={`self-start text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${ROLE_BADGE_COLORS[member.role as Role]}`}>
                                        {member.role}
                                    </span>

                                    {/* Active tasks */}
                                    {activeTasks.length > 0 ? (
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/30 flex items-center gap-1">
                                                <CheckSquare size={9} /> {activeTasks.length} active task{activeTasks.length > 1 ? "s" : ""}
                                            </p>
                                            {activeTasks.slice(0, 2).map((t: any) => (
                                                <div key={t._id} className="text-[10px] font-medium text-brand-blue/60 bg-brand-bgLight/50 px-2 py-1 rounded truncate border border-brand-blue/5">
                                                    {t.title}
                                                </div>
                                            ))}
                                            {activeTasks.length > 2 && (
                                                <p className="text-[10px] text-brand-blue/30 font-bold pl-2">+{activeTasks.length - 2} more</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/20">No active tasks</p>
                                    )}

                                    {/* Join date */}
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/20 border-t border-brand-blue/5 pt-2 mt-auto">
                                        Member since {formatDate(member._creationTime)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Summary footer */}
            {staffMembers && (
                <div className="shrink-0 flex flex-wrap gap-4 pt-3 border-t-2 border-brand-blue/10">
                    {STAFF_ROLES.map(role => {
                        const count = staffMembers.filter((m: any) => m.role === role).length;
                        if (count === 0) return null;
                        return (
                            <div key={role} className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${ROLE_BADGE_COLORS[role]}`}>{role}</span>
                                <span className="text-xs font-bold text-brand-blue/40">{count}</span>
                            </div>
                        );
                    })}
                    <span className="text-xs font-bold text-brand-blue/30 ml-auto">
                        {staffMembers.length} total members
                    </span>
                </div>
            )}
        </div>
    );
}
