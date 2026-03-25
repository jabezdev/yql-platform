import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthContext } from "../../providers/AuthProvider";
import { isManager, isAdmin as checkAdmin } from "../../constants/roles";
import type { Role } from "../../constants/roles";
import { Users, Activity, Shield, CheckSquare, Calendar as CalendarIcon } from "lucide-react";
import { StatCard } from "../../components/ui/structure/DashboardCard";
import { PipelineBoard } from "../../components/admin/PipelineBoard";
import { EvaluationQueue } from "../../components/admin/EvaluationQueue";
import { AvailabilityDrawer } from "../../components/admin/AvailabilityDrawer";

export default function AdminControlRoom() {
    const { user } = useAuthContext();
    const stats = useQuery(api.admin.getDashboardStats);
    const [activeTab, setActiveTab] = useState<"pipeline" | "queue">("pipeline");
    const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);

    if (!user) return null;

    const canSeePipeline = isManager(user.role as Role);
    const canSeeQueue = user.specialRoles?.includes("Evaluator") || checkAdmin(user.role as Role);

    return (
        <div className="h-full flex flex-col space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                <StatCard label="Active Members" value={stats?.totalStaff ?? 0} icon={Users} color="yellow" />
                <StatCard label="Pending Apps" value={stats?.pendingApplications ?? 0} icon={Activity} color="green" />
                <StatCard label="Active Cohorts" value={stats?.activeCohorts ?? 0} icon={CalendarIcon} color="blue" />
                <StatCard label="System Status" value="OK" icon={Shield} color="wine" />
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 p-1 bg-brand-bgLight border border-brand-blue/15 rounded-tl-xl rounded-br-xl w-fit shrink-0">
                {canSeePipeline && (
                    <button
                        onClick={() => setActiveTab("pipeline")}
                        className={`px-6 py-2 rounded-tl-lg rounded-br-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "pipeline"
                            ? "bg-brand-blue text-white"
                            : "text-brand-blue/50 hover:text-brand-blue hover:bg-white"
                            }`}
                    >
                        <Activity size={16} /> Recruitment Pipeline
                    </button>
                )}
                {canSeeQueue && (
                    <button
                        onClick={() => setActiveTab("queue")}
                        className={`px-6 py-2 rounded-tl-lg rounded-br-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "queue"
                            ? "bg-brand-blue text-white"
                            : "text-brand-blue/50 hover:text-brand-blue hover:bg-white"
                            }`}
                    >
                        <CheckSquare size={16} /> Evaluations Queue
                    </button>
                )}
            </div>

            {/* Content */}
            {activeTab === "pipeline" && canSeePipeline && <PipelineBoard />}
            {activeTab === "queue" && canSeeQueue && (
                <EvaluationQueue user={user} onOpenAvailability={() => setIsAvailabilityOpen(true)} />
            )}

            {isAvailabilityOpen && (
                <AvailabilityDrawer
                    user={user}
                    isOpen={isAvailabilityOpen}
                    onClose={() => setIsAvailabilityOpen(false)}
                />
            )}
        </div>
    );
}
