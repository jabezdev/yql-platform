import { 
    PageHeader, 
    InfoCard, 
    Button,
    DashboardPage,
    DashboardCard
} from "@/design";
import { Layout, Calendar, Users, Palette, MessageSquare, ClipboardList, ArrowUpRight } from "lucide-react";

export default function WorkspaceDashboard() {
    return (
        <DashboardPage className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader 
                title="Global Workspace"
                eyebrow="T5+ Operations"
                subtitle="Collaborate on active projects and team initiatives."
                variant="ghost"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard 
                    icon={ClipboardList} 
                    label="Task Boards" 
                    value="42 Active" 
                    color="blue"
                    description="Global project task tracking and assignment."
                />
                <InfoCard 
                    icon={Calendar} 
                    label="Calendar" 
                    description="Weekly syncs, hybrid sessions, and deadlines."
                    color="yellow"
                    badge={<span className="text-[10px] font-black uppercase text-brand-blue/50 dark:text-white/40">Next: 2h</span>}
                />
                <InfoCard 
                    icon={Users} 
                    label="Staff Directory" 
                    value="156 Members" 
                    color="wine"
                />
                <InfoCard 
                    icon={Palette} 
                    label="Design Studio" 
                    description="Creator tool for YQL Platform posters."
                    color="blue"
                    trend={{ direction: 'up', value: '2 New' }}
                />
                <InfoCard 
                    icon={MessageSquare} 
                    label="Channel Chat" 
                    value="12 New" 
                    color="yellow"
                />
                <DashboardCard variant="stat" className="flex flex-col justify-center items-center text-center p-4 border-dashed border-brand-blue/20 dark:border-white/20">
                    <Button variant="ghost" size="sm" className="w-full h-full flex flex-col gap-2 opacity-60 hover:opacity-100">
                        <ArrowUpRight size={24} className="text-brand-blue/30 dark:text-white/30" />
                        <span className="text-[10px] font-black uppercase tracking-widest dark:text-white/60">Connect App</span>
                    </Button>
                </DashboardCard>
            </div>

            <section className="mt-12">
                <div className="relative group p-1 bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-yellow/20 rounded-tl-2xl rounded-br-2xl">
                    <DashboardCard noPadding variant="static" className="border-2 border-brand-blue dark:border-white/20 shadow-[8px_8px_0px_0px_rgba(57,103,153,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-3">
                            <div className="lg:col-span-2 p-8 sm:p-12 relative overflow-hidden">
                                {/* Subtle decorative element */}
                                <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-brand-blue/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
                                
                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <div className="w-12 h-12 rounded-tl-xl rounded-br-xl bg-brand-blue dark:bg-brand-yellow border-2 border-brand-darkBlue dark:border-brand-yellow shadow-[4px_4px_0px_0px_rgba(10,22,48,0.3)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center transition-colors">
                                        <Layout className="text-white dark:text-brand-blue" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-display font-black text-brand-blue dark:text-white">Workspace Pulse</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue/40 dark:text-white/40">Real-time Operational Health</p>
                                    </div>
                                </div>
                                <p className="text-lg font-medium text-brand-blue/70 dark:text-white/70 mb-8 max-w-xl leading-relaxed relative z-10">
                                    Systems are performing at optimal velocity. No major blockers or critical incidents reported across active project boards in the last 24 hours.
                                </p>
                                <div className="flex flex-wrap gap-4 relative z-10">
                                    <Button variant="geometric-primary">
                                        View Deep Analytics
                                    </Button>
                                    <Button variant="ghost" className="border-brand-blue/10 dark:border-white/10 dark:text-white/60 dark:hover:text-white transition-colors">
                                        Board Settings
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-brand-blue/[0.03] dark:bg-white/[0.02] p-8 lg:border-l-2 border-brand-blue/10 dark:border-white/10 flex flex-col justify-center">
                                <div className="space-y-6">
                                    {[
                                        { label: "Api Uptime", value: "99.9%", status: "success" },
                                        { label: "Team Velocity", value: "+12%", status: "success" },
                                        { label: "Pending Reviews", value: "04", status: "warning" }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center justify-between group/item">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue/40 dark:text-white/40 group-hover/item:text-brand-blue/60 dark:group-hover/item:text-white/60 transition-colors">{stat.label}</span>
                                            <span className={`text-sm font-black transition-transform group-hover/item:scale-110 ${
                                                stat.status === 'success' ? 'text-brand-green' : 'text-brand-blue dark:text-brand-lightBlue'
                                            }`}>{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-brand-blue/5 dark:border-white/5">
                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-tighter text-brand-blue/30 dark:text-white/30">
                                        <span>Last Sync</span>
                                        <span>Just Now</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                </div>
            </section>
        </DashboardPage>
    );
}


