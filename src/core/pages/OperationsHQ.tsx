import { useAuthContext } from "../providers/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link } from "react-router-dom";
import { Activity, Search, CalendarPlus, UserCheck, Bell, MessageSquare, AlertCircle } from "lucide-react";

export default function OperationsHQ() {
    const { user } = useAuthContext();
    const stats = useQuery(api.admin.getDashboardStats); // Re-using admin stats for some global context if needed
    const subRole = user?.staffSubRole || "Regular";

    // Placeholder for actual activity feed - in a real app this would be a Convex query
    const recentActivity = [
        { id: 1, type: "system", text: "Fall 2026 Cohort applications are now open.", time: "2 hours ago", icon: Bell, color: "text-brand-blue", bg: "bg-brand-blue/10" },
        { id: 2, type: "recruitment", text: "5 new applications received.", time: "4 hours ago", icon: UserCheck, color: "text-brand-green", bg: "bg-brand-green/10" },
        { id: 3, type: "announcement", text: "All-hands meeting scheduled for tomorrow.", time: "1 day ago", icon: MessageSquare, color: "text-brand-yellow", bg: "bg-brand-yellow/10" },
        { id: 4, type: "alert", text: "System maintenance window this weekend.", time: "2 days ago", icon: AlertCircle, color: "text-brand-red", bg: "bg-brand-red/10" },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-display font-extrabold text-brand-blueDark">
                        Operations HQ
                    </h1>
                    <p className="text-brand-darkBlue/70 mt-2 font-medium">Welcome back, {user?.name.split(' ')[0]}. Manage your day-to-day YQL activities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-brand-bgLight/50 text-brand-blueDark rounded-sm text-sm font-bold border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-none bg-brand-green animate-pulse border border-brand-blueDark" />
                        System Online
                    </span>
                    <span className="px-4 py-2 bg-brand-yellow/20 text-brand-blueDark rounded-sm text-sm font-extrabold border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] uppercase tracking-wide">
                        {subRole}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Action Center */}
                    <section>
                        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-brand-red" /> Action Center
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            <button className="h-32 bg-white hover:bg-brand-bgLight/50 transition-all border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,1)] hover:-translate-y-1 rounded-tl-xl rounded-br-xl flex flex-col items-center justify-center text-brand-blueDark group">
                                <div className="w-12 h-12 bg-brand-green/20 rounded-tl-lg rounded-br-lg border border-brand-blueDark/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <CalendarPlus size={24} className="text-brand-green" />
                                </div>
                                <span className="text-sm font-bold">New Event</span>
                            </button>

                            <Link to="/network/directory" className="h-32 bg-white hover:bg-brand-bgLight/50 transition-all border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,1)] hover:-translate-y-1 rounded-tl-xl rounded-br-xl flex flex-col items-center justify-center text-brand-blueDark group">
                                <div className="w-12 h-12 bg-brand-yellow/20 rounded-tl-lg rounded-br-lg border border-brand-blueDark/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Search size={24} className="text-brand-yellow" />
                                </div>
                                <span className="text-sm font-bold">Directory</span>
                            </Link>

                            <Link to="/operations/calendar" className="h-32 bg-white hover:bg-brand-bgLight/50 transition-all border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,1)] hover:-translate-y-1 rounded-tl-xl rounded-br-xl flex flex-col items-center justify-center text-brand-blueDark group col-span-2 sm:col-span-1">
                                <div className="w-12 h-12 bg-brand-blue/10 rounded-tl-lg rounded-br-lg border border-brand-blueDark/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <CalendarPlus size={24} className="text-brand-blue" />
                                </div>
                                <span className="text-sm font-bold">Calendar</span>
                            </Link>
                        </div>
                    </section>

                    {/* Operational Metrics (Optional, if we want to show stats to staff) */}
                    <section>
                        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-brand-red" /> Global Metrics
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-6 border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/20 rounded-full -translate-y-12 translate-x-12" />
                                <span className="text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mb-2 z-10 relative">Total Yield</span>
                                <span className="text-5xl font-display font-extrabold text-brand-blueDark z-10 relative">{stats?.totalUsers || "..."}</span>
                                <span className="text-xs text-brand-blueDark font-bold mt-2 z-10 relative">Active Members</span>
                            </div>
                            <div className="bg-white p-6 border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/20 rounded-full -translate-y-12 translate-x-12" />
                                <span className="text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mb-2 z-10 relative">Recruitment</span>
                                <span className="text-5xl font-display font-extrabold text-brand-blueDark z-10 relative">{stats?.pendingApplications || "..."}</span>
                                <span className="text-xs text-brand-green font-bold mt-2 z-10 relative">Pending Applications</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar: Activity Feed */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-white p-6 border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] h-full max-h-[600px] flex flex-col">
                        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark mb-6 flex items-center gap-2">
                            <Bell size={16} className="text-brand-blue" /> Activity Feed
                        </h2>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                            {recentActivity.map((activity, index) => {
                                const Icon = activity.icon;
                                return (
                                    <div key={activity.id} className="relative pl-4">
                                        {/* Timeline Line */}
                                        {index !== recentActivity.length - 1 && (
                                            <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-brand-blueDark/10" />
                                        )}
                                        <div className="flex gap-4 items-start relative bg-transparent z-10">
                                            <div className={`w-6 h-6 rounded-sm border border-brand-blueDark/20 flex items-center justify-center shrink-0 mt-0.5 ${activity.bg} ring-4 ring-brand-bgLight/50`}>
                                                <Icon size={12} className={activity.color} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-brand-blueDark leading-snug">{activity.text}</p>
                                                <p className="text-[10px] font-extrabold text-brand-blueDark/40 uppercase tracking-wide mt-1">{activity.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
