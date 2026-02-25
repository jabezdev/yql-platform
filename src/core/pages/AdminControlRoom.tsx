import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Shield, Users, ChevronRight, XCircle, Settings, X, Activity, User, FormInput, BookOpen, Calendar as CalendarIcon } from "lucide-react";
import { StatCard } from "../components/ui/DashboardCard";
import { Button } from "../components/ui/Button";

// Import the existing admin pages to render as settings tabs
import AdminFormsPage from "./AdminFormsPage";
import AdminCalendarPage from "./AdminCalendarPage";
import AdminOnboardingPage from "./AdminOnboardingPage";

export default function AdminControlRoom() {
    // --- DASHBOARD STATS LOGIC ---
    const stats = useQuery(api.admin.getDashboardStats);

    // --- SETTINGS MODAL LOGIC ---
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"roles" | "forms" | "onboarding" | "calendar">("roles");

    // --- PIPELINE LOGIC ---
    const cohorts = useQuery(api.cohorts.getAvailable) || [];
    const [selectedCohortId, setSelectedCohortId] = useState<Id<"cohorts"> | "">("");

    const applications = useQuery(api.admin.getExpandedApplicationsForCohort,
        selectedCohortId ? { cohortId: selectedCohortId as Id<"cohorts"> } : "skip"
    ) || [];

    const staffMembers = useQuery(api.hr.getAllStaff) || [];
    const reviewers = staffMembers.filter((s: any) => s.staffSubRole === "Reviewer" || s.role === "Admin");

    const updateStatus = useMutation(api.applications.updateApplicationStatus);
    const assignReviewer = useMutation(api.applications.assignReviewer);

    const STAGES = ["round1", "round2", "round3", "round4", "round5", "round6", "accepted", "rejected", "withdrawn"];
    const getAppsByStage = (stage: string) => applications.filter((app: any) => app.status === stage);

    const handleProgress = async (appId: Id<"applications">, currentStatus: string) => {
        const nextStageMap: Record<string, string> = {
            round1: "round2", round2: "round3", round3: "round4", round4: "round5", round5: "round6", round6: "accepted"
        };
        const next = nextStageMap[currentStatus];
        if (next) await updateStatus({ applicationId: appId, status: next as any });
    };

    // --- ROLES LOGIC (For Settings Tab) ---
    const users = useQuery(api.admin.getAllUsers) || [];
    const updateRole = useMutation(api.hr.updateStaffRole);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col relative space-y-8 max-w-7xl mx-auto">

            {/* Command Center Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 sm:p-8 rounded-tl-2xl rounded-br-2xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] gap-4 shrink-0">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight text-brand-blueDark flex items-center gap-4">
                        <span className="bg-brand-red/10 text-brand-red p-2.5 rounded-xl border-2 border-brand-red/20 shadow-sm"><Shield size={36} strokeWidth={2.5} /></span>
                        Command Center
                    </h1>
                    <p className="text-brand-darkBlue/70 mt-2 font-medium text-lg">High-level system oversight and pipeline management.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsSettingsOpen(true)}
                        variant="geometric-primary"
                        className="py-4 px-6 text-sm flex items-center gap-2 justify-center"
                    >
                        <Settings size={18} strokeWidth={2.5} /> System Settings
                    </Button>
                </div>
            </div>

            {/* KPI Canvas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                <StatCard label="Total Platform Users" value={stats?.totalUsers.toString() || "..."} icon={Users} color="blue" />
                <StatCard label="Active Cohorts" value={stats?.activeCohorts.toString() || "..."} icon={Activity} color="green" />
                <StatCard label="Pending Applications" value={stats?.pendingApplications.toString() || "..."} icon={FormInput} color="yellow" />
                <StatCard label="System Health" value="Optimal" icon={Shield} color="wine" />
            </div>

            {/* Pipeline Canvas */}
            <div className="flex-1 bg-white border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] flex flex-col min-h-0 overflow-hidden relative">
                <div className="p-4 sm:p-5 border-b-2 border-brand-blueDark bg-brand-bgLight flex flex-col sm:flex-row justify-between sm:items-center shrink-0 gap-3 z-10">
                    <h2 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-brand-blueDark flex items-center gap-2">
                        <span className="bg-white p-1 rounded-sm border border-brand-blueDark/20"><Users size={14} className="text-brand-blue" /></span>
                        Recruitment Pipeline
                    </h2>
                    <select
                        value={selectedCohortId}
                        onChange={(e) => setSelectedCohortId(e.target.value as Id<"cohorts">)}
                        className="px-4 py-2.5 bg-white border-2 border-brand-blueDark/20 rounded-lg focus:ring-0 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] transition-all outline-none font-bold text-brand-blueDark appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        <option value="">-- Select Active Cohort --</option>
                        {cohorts.map((c: any) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {!selectedCohortId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 w-full h-full bg-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,103,153,0.03)_0%,transparent_70%)] pointer-events-none" />
                        <div className="w-20 h-20 bg-brand-yellow/20 rounded-tl-xl rounded-br-xl border-2 border-brand-blueDark flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)] mb-6 relative z-10">
                            <Users size={36} className="text-brand-blueDark" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl font-display font-extrabold text-brand-blueDark mb-2 relative z-10">No Cohort Selected</h3>
                        <p className="text-brand-darkBlue/70 font-medium max-w-sm text-center relative z-10">Select a cohort from the dropdown above to manage its recruitment pipeline.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 sm:p-6 bg-brand-bgLight custom-scrollbar">
                        <div className="flex gap-6 h-full min-w-max pb-4">
                            {STAGES.map(stage => {
                                const stageApps = getAppsByStage(stage);
                                return (
                                    <div key={stage} className="w-80 flex flex-col bg-white border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] shrink-0 overflow-hidden rounded-tl-xl rounded-br-xl">
                                        <div className="p-4 border-b-2 border-brand-blueDark font-extrabold text-brand-blueDark flex justify-between items-center bg-white uppercase text-[10px] tracking-widest">
                                            <span>{stage.replace("round", "Round ")}</span>
                                            <span className="bg-brand-blueDark text-white font-bold px-2.5 py-1 border border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] min-w-[24px] text-center rounded-sm text-xs">
                                                {stageApps.length}
                                            </span>
                                        </div>
                                        <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                                            {stageApps.length === 0 ? (
                                                <div className="py-10 text-center text-brand-blueDark/40 text-[10px] font-extrabold uppercase tracking-widest border-2 border-dashed border-brand-blueDark/20 rounded-lg bg-white/50">Empty Stage</div>
                                            ) : (
                                                stageApps.map((app: any) => (
                                                    <div key={app._id} className="bg-white p-4 border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,1)] hover:-translate-y-1 transition-all group flex flex-col gap-3 rounded-tl-xl rounded-br-xl relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-blue/30 group-hover:bg-brand-blue transition-colors" />
                                                        <div className="font-bold font-display text-brand-blueDark text-lg truncate pl-2">{app.user?.name || "Unknown Applicant"}</div>

                                                        {/* Assign Reviewer */}
                                                        <div className="bg-brand-bgLight/80 border-2 border-brand-blueDark/20 px-2.5 py-2 flex items-center rounded-lg relative overflow-hidden focus-within:border-brand-blueDark focus-within:bg-white transition-colors ml-2">
                                                            <span className="text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mr-2 shrink-0">Assign:</span>
                                                            <select
                                                                className="w-full bg-transparent border-none appearance-none cursor-pointer outline-none text-xs font-bold text-brand-blueDark"
                                                                value={app.assignedReviewerId || ""}
                                                                onChange={(e) => assignReviewer({ applicationId: app._id, reviewerId: e.target.value as Id<"users"> })}
                                                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0 center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '1rem' }}
                                                            >
                                                                <option value="" disabled>Unassigned</option>
                                                                {reviewers.map((r: any) => (
                                                                    <option key={r._id} value={r._id}>{r.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-brand-blueDark/10 ml-2">
                                                            {stage === "rejected" || stage === "withdrawn" || stage === "accepted" ? (
                                                                <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-darkBlue/50 bg-brand-blueDark/5 px-2.5 py-1 rounded-sm border border-brand-blueDark/10">Terminal State</span>
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
                                                                        className="text-xs text-brand-blueDark bg-brand-yellow hover:bg-white px-3 py-1.5 border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,1)] flex items-center gap-1 font-bold transition-all rounded-md active:translate-y-[2px] active:shadow-none"
                                                                    >
                                                                        Progress <ChevronRight size={14} strokeWidth={3} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Global Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200 object-contain">
                    <div className="bg-white border-4 border-brand-blueDark rounded-tl-[2rem] rounded-br-[2rem] shadow-[12px_12px_0px_0px_rgba(37,99,235,0.6)] w-full max-w-7xl h-full max-h-full overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">

                        {/* Settings Sidebar */}
                        <div className="w-full md:w-64 bg-brand-bgLight border-b-2 md:border-b-0 md:border-r-4 border-brand-blueDark p-6 shrink-0 flex flex-col">
                            <h2 className="text-2xl font-display font-extrabold text-brand-blueDark mb-8 flex items-center gap-2">
                                <Settings className="text-brand-blue" size={28} /> Settings
                            </h2>
                            <nav className="space-y-3 flex-1">
                                {[
                                    { id: "roles", label: "User Roles", icon: User },
                                    { id: "forms", label: "Form Builder", icon: FormInput },
                                    { id: "onboarding", label: "Onboarding Modules", icon: BookOpen },
                                    { id: "calendar", label: "Global Calendar", icon: CalendarIcon },
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all ${isActive
                                                ? "bg-brand-blueDark text-white border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,1)] rounded-tl-xl rounded-br-xl"
                                                : "text-brand-darkBlue border-2 border-transparent hover:border-brand-blueDark border-dashed hover:bg-white rounded-lg"
                                                }`}
                                        >
                                            <Icon size={18} className={isActive ? "text-brand-yellow" : "text-brand-blueDark/50"} strokeWidth={isActive ? 2.5 : 2} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                            <Button
                                onClick={() => setIsSettingsOpen(false)}
                                variant="geometric-secondary"
                                className="mt-8 flex items-center justify-center gap-2"
                            >
                                <X size={18} strokeWidth={3} /> Close Settings
                            </Button>
                        </div>

                        {/* Settings Content Area */}
                        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                            <div className="p-8">
                                {activeTab === "roles" && (
                                    <div className="space-y-6">
                                        <div className="border-b-2 border-brand-blueDark/10 pb-6 mb-8">
                                            <h3 className="text-3xl font-display font-extrabold text-brand-blueDark">User Roles & Access</h3>
                                            <p className="text-brand-darkBlue/70 mt-1 font-medium text-lg">Manage system permissions and sub-roles for all members.</p>
                                        </div>
                                        <div className="bg-white border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl overflow-hidden">
                                            <div className="grid gap-0 divide-y-2 divide-brand-blueDark">
                                                {users.map((user: any) => (
                                                    <div key={user._id} className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-brand-bgLight transition-colors">
                                                        <div className="mb-4 md:mb-0">
                                                            <p className="font-extrabold font-display text-brand-blueDark text-lg">{user.name}</p>
                                                            <p className="text-sm text-brand-darkBlue/70 font-medium">{user.email}</p>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                                            <div className="flex flex-col w-full sm:w-auto">
                                                                <span className="text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mb-1.5 ml-1">Primary Role</span>
                                                                <select
                                                                    className="p-2 border-2 border-brand-blueDark/20 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] transition-all rounded-lg text-sm bg-brand-bgLight/50 outline-none focus:ring-0 font-bold text-brand-blueDark cursor-pointer appearance-none"
                                                                    value={user.role}
                                                                    onChange={(e) => updateRole({ userId: user._id, role: e.target.value as any })}
                                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '2rem' }}
                                                                >
                                                                    <option value="Applicant">Applicant</option>
                                                                    <option value="Staff">Staff</option>
                                                                    <option value="Admin">Admin</option>
                                                                </select>
                                                            </div>
                                                            {user.role === "Staff" && (
                                                                <div className="flex flex-col w-full sm:w-auto">
                                                                    <span className="text-[10px] font-extrabold text-brand-blue/50 uppercase tracking-widest mb-1.5 ml-1">Sub-Role</span>
                                                                    <select
                                                                        className="p-2 border-2 border-brand-blue/20 focus:border-brand-blue focus:shadow-[2px_2px_0px_0px_rgba(37,99,235,0.3)] transition-all rounded-lg text-sm bg-brand-blue/5 outline-none focus:ring-0 font-bold text-brand-blue cursor-pointer appearance-none"
                                                                        value={user.staffSubRole || "Regular"}
                                                                        onChange={(e) => updateRole({ userId: user._id, staffSubRole: e.target.value as any })}
                                                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '2rem' }}
                                                                    >
                                                                        <option value="Regular">Regular</option>
                                                                        <option value="Reviewer">Reviewer</option>
                                                                        <option value="Alumni">Alumni</option>
                                                                    </select>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {users.length === 0 && <p className="text-center text-brand-blueDark/50 py-12 font-bold bg-brand-bgLight/30">No users found in the system yet.</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "forms" && (
                                    <div className="max-w-4xl">
                                        {/* Render the refactored Forms page here as a component */}
                                        <AdminFormsPage />
                                    </div>
                                )}

                                {activeTab === "onboarding" && (
                                    <div className="max-w-4xl">
                                        <AdminOnboardingPage />
                                    </div>
                                )}

                                {activeTab === "calendar" && (
                                    <div className="max-w-4xl">
                                        <AdminCalendarPage />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
