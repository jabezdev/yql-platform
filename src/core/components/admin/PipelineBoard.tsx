import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { PIPELINE_STAGES, STAGE_LABELS, TERMINAL_STAGES, NEXT_STAGE } from "../../constants/pipeline";
import { Users, Activity, XCircle, ChevronRight } from "lucide-react";
import { isAdmin as checkAdmin } from "../../constants/roles";
import type { Role } from "../../constants/roles";

export function PipelineBoard() {
    const cohorts = useQuery(api.cohorts.getAvailable) ?? [];
    const [selectedCohortId, setSelectedCohortId] = useState<Id<"cohorts"> | "">("");

    const applications = useQuery(
        api.admin.getExpandedApplicationsForCohort,
        selectedCohortId ? { cohortId: selectedCohortId as Id<"cohorts"> } : "skip"
    ) ?? [];

    const staffMembers = useQuery(api.hr.getAllStaff) ?? [];
    const reviewers = staffMembers.filter((s: any) =>
        s.specialRoles?.includes("Evaluator") || checkAdmin(s.role as Role)
    );

    const updateStatus = useMutation(api.applications.updateApplicationStatus);
    const assignReviewer = useMutation(api.applications.assignReviewer);

    const getAppsByStage = (stage: string) => applications.filter((app: any) => app.status === stage);

    const handleProgress = async (appId: Id<"applications">, currentStatus: string) => {
        const next = NEXT_STAGE[currentStatus as keyof typeof NEXT_STAGE];
        if (next) await updateStatus({ applicationId: appId, status: next as any });
    };

    return (
        <div className="flex-1 bg-white border-2 border-brand-blue shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl flex flex-col min-h-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b-2 border-brand-blue flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-lightBlue/10 rounded-lg border-2 border-brand-lightBlue/20 flex items-center justify-center">
                        <Activity className="text-brand-lightBlue" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-extrabold text-brand-blue">Recruitment Pipeline</h2>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/40">Manage applicant progression</p>
                    </div>
                </div>
                <div className="relative w-full sm:w-64">
                    <select
                        className="w-full pl-4 pr-10 py-2.5 bg-brand-bgLight/50 border-2 border-brand-blue rounded-lg text-sm font-bold text-brand-blue appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-lightBlue/10 transition-all"
                        value={selectedCohortId}
                        onChange={e => setSelectedCohortId(e.target.value as Id<"cohorts">)}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: "right 0.75rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.2em 1.2em" }}
                    >
                        <option value="">Select Cohort...</option>
                        {cohorts.map((cohort: any) => (
                            <option key={cohort._id} value={cohort._id}>{cohort.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Board */}
            {!selectedCohortId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                    <div className="w-20 h-20 bg-brand-yellow/20 rounded-tl-xl rounded-br-xl border-2 border-brand-blue flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)] mb-6">
                        <Users size={36} className="text-brand-blue" strokeWidth={2} />
                    </div>
                    <h3 className="text-2xl font-display font-extrabold text-brand-blue mb-2">No Cohort Selected</h3>
                    <p className="text-brand-darkBlue/70 font-medium max-w-sm text-center">Select a cohort from the dropdown above to manage its recruitment pipeline.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 sm:p-6 bg-brand-bgLight custom-scrollbar">
                    <div className="flex gap-6 h-full min-w-max pb-4">
                        {PIPELINE_STAGES.map(stage => {
                            const stageApps = getAppsByStage(stage);
                            const isTerminal = TERMINAL_STAGES.includes(stage);
                            return (
                                <div key={stage} className="w-80 flex flex-col bg-white border-2 border-brand-blue shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] shrink-0 overflow-hidden rounded-tl-xl rounded-br-xl">
                                    <div className="p-4 border-b-2 border-brand-blue font-extrabold text-brand-blue flex justify-between items-center bg-white uppercase text-[10px] tracking-widest">
                                        <span>{STAGE_LABELS[stage]}</span>
                                        <span className="bg-brand-blue text-white font-bold px-2.5 py-1 border border-brand-blue shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] min-w-[24px] text-center rounded-sm text-xs">
                                            {stageApps.length}
                                        </span>
                                    </div>
                                    <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                                        {stageApps.length === 0 ? (
                                            <div className="py-10 text-center text-brand-blue/40 text-[10px] font-extrabold uppercase tracking-widest border-2 border-dashed border-brand-blue/20 rounded-lg bg-white/50">
                                                Empty Stage
                                            </div>
                                        ) : stageApps.map((app: any) => (
                                            <div key={app._id} className="bg-white p-4 border-2 border-brand-blue shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:shadow-[4px_4px_0px_0px_rgba(10,22,48,0.3)] hover:-translate-y-1 transition-all group flex flex-col gap-3 rounded-tl-xl rounded-br-xl relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-lightBlue/30 group-hover:bg-brand-lightBlue transition-colors" />
                                                <div className="font-bold font-display text-brand-blue text-lg truncate pl-2">{app.user?.name ?? "Unknown Applicant"}</div>

                                                <div className="bg-brand-bgLight/80 border-2 border-brand-blue/20 px-2.5 py-2 flex items-center rounded-lg ml-2">
                                                    <span className="text-[10px] font-extrabold text-brand-blue/50 uppercase tracking-widest mr-2 shrink-0">Assign:</span>
                                                    <select
                                                        className="w-full bg-transparent border-none appearance-none cursor-pointer outline-none text-xs font-bold text-brand-blue"
                                                        value={app.assignedReviewerId ?? ""}
                                                        onChange={e => assignReviewer({ applicationId: app._id, reviewerId: e.target.value as Id<"users"> })}
                                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: "right 0 center", backgroundRepeat: "no-repeat", backgroundSize: "1em 1em", paddingRight: "1rem" }}
                                                    >
                                                        <option value="" disabled>Unassigned</option>
                                                        {reviewers.map((r: any) => (
                                                            <option key={r._id} value={r._id}>{r.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-brand-blue/10 ml-2">
                                                    {isTerminal ? (
                                                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-darkBlue/50 bg-brand-blue/5 px-2.5 py-1 rounded-sm border border-brand-blue/10">Terminal State</span>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus({ applicationId: app._id, status: "rejected" })}
                                                                className="text-xs text-brand-red bg-brand-red/5 hover:bg-brand-red/10 border-2 border-brand-red/20 hover:border-brand-red/40 px-2 py-1 flex items-center gap-1 font-bold transition-all rounded-lg"
                                                            >
                                                                <XCircle size={14} strokeWidth={2.5} /> Reject
                                                            </button>
                                                            <button
                                                                onClick={() => handleProgress(app._id, stage)}
                                                                className="text-xs text-brand-green bg-brand-green/5 hover:bg-brand-green/10 border-2 border-brand-green/20 hover:border-brand-green/40 px-2 py-1 flex items-center gap-1 font-bold transition-all rounded-lg"
                                                            >
                                                                Advance <ChevronRight size={14} strokeWidth={2.5} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
