import { 
    PageHeader, 
    DashboardCard, 
    InfoCard, 
    DashboardSectionTitle,
    Avatar,
    Button,
    DashboardPage,
    Input
} from "@/design";
import { 
    Calendar, 
    CheckSquare, 
    Sparkles, 
    ArrowRight,
    Search,
    Layers
} from "lucide-react";

export default function MeDashboard() {
    return (
        <DashboardPage className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Greeting */}
            <PageHeader 
                title="Welcome back, Jabez"
                eyebrow="Personal Dashboard"
                subtitle="Here's what's happening with your YQL journey today."
                variant="ghost"
                action={
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block w-72">
                            <Input 
                                placeholder="Search my workspace..." 
                                icon={Search}
                                className="bg-white/50 dark:bg-white/5"
                            />
                        </div>
                        <Button variant="geometric-primary" size="sm">
                            <Sparkles size={14} className="mr-2" /> New Task
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed: Updates & Communications */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <DashboardSectionTitle 
                            action={
                                <Button variant="ghost" size="sm" className="text-brand-blue/50 dark:text-white/40 hover:text-brand-blue dark:hover:text-white">
                                    Clear all
                                </Button>
                            }
                        >
                            Notification Center
                        </DashboardSectionTitle>
                        
                        <div className="space-y-4">
                            {[
                                { title: "HR: Recommitment Pending Action", date: "2 hours ago", type: "HR Ops", icon: CheckSquare, color: "wine", status: "Action Required" },
                                { title: "Ops: Weekly Shift Finalized", date: "Yesterday", type: "Operations", icon: Calendar, color: "blue", status: "FYI" },
                                { title: "Workspace: 3 tasks assigned to you", date: "2 days ago", type: "Workspace", icon: Layers, color: "yellow", status: "Important" }
                            ].map((item, i) => (
                                <DashboardCard key={i} className="group cursor-pointer relative overflow-hidden transition-all hover:bg-[var(--color-bg-light)] dark:hover:bg-white/[0.03] hover:border-brand-blue/30 dark:hover:border-white/20">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2.5 rounded-tl-lg rounded-br-lg transition-transform group-hover:scale-110 duration-300 ${
                                            item.color === 'blue' ? 'bg-brand-blue/10 dark:bg-white/10 text-brand-blue dark:text-brand-lightBlue' :
                                            item.color === 'yellow' ? 'bg-brand-yellow/20 dark:bg-brand-yellow/10 text-brand-blue dark:text-brand-yellow' :
                                            'bg-brand-wine/10 dark:bg-brand-wine/20 text-brand-wine dark:text-brand-wine'
                                        }`}>
                                            <item.icon size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{item.type}</span>
                                                    {item.status && (
                                                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-brand-blue/10 dark:bg-white/10 text-[var(--text-secondary)] border border-brand-blue/10 dark:border-white/10 rounded-sm">
                                                            {item.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-[var(--text-muted)]">{item.date}</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors truncate">
                                                {item.title}
                                            </h4>
                                        </div>
                                        <div className="flex items-center self-center pl-2">
                                            <ArrowRight size={18} className="text-[var(--text-muted)] opacity-50 group-hover:opacity-100 group-hover:text-brand-blue dark:group-hover:text-brand-yellow group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </DashboardCard>
                            ))}
                            
                            <Button variant="ghost" fullWidth className="mt-4 border-2 border-dashed border-brand-blue/10 dark:border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-brand-blue/30 dark:hover:border-white/30 hover:bg-transparent">
                                View Activity History
                            </Button>
                        </div>
                    </section>
                </div>

                {/* Sidebar: Personal Context */}
                <div className="space-y-8">
                    {/* Stats / Quick Info */}
                    <section>
                        <DashboardSectionTitle>My Progress</DashboardSectionTitle>
                        <div className="grid grid-cols-1 gap-4">
                            <InfoCard 
                                icon={CheckSquare}
                                label="Tasks Remaining"
                                value="12 / 15"
                                color="blue"
                                trend={{ direction: 'up', value: '80%' }}
                            />
                            <InfoCard 
                                icon={Calendar}
                                label="Next Event"
                                description="Quantum 101 Hybrid Session"
                                color="yellow"
                                badge={<span className="text-[10px] font-black uppercase bg-brand-blue text-white px-2 py-0.5 rounded-sm">14:00 PM</span>}
                            />
                        </div>
                    </section>

                    {/* Team Section */}
                    <section>
                        <DashboardSectionTitle>Team Pulse</DashboardSectionTitle>
                        <DashboardCard variant="static" className="relative overflow-hidden group border-2 border-brand-blue/5 dark:border-white/5">
                            {/* Decorative Geometric Element */}
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-blue/5 dark:bg-white/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 dark:group-hover:bg-white/10 transition-colors duration-500" />
                            
                            <p className="text-xs text-[var(--text-secondary)] mb-6 font-medium leading-relaxed relative z-10">
                                Active collaboration within your core department and mentors.
                            </p>
                            
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex -space-x-2">
                                    {["Alice", "Bob", "Charlie", "David"].map((name, i) => (
                                        <div key={i} className="border-2 border-white dark:border-[var(--color-bg)] rounded-tl-lg rounded-br-lg overflow-hidden transition-transform hover:-translate-y-1">
                                            <Avatar name={name} size="sm" />
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-tl-lg rounded-br-lg bg-brand-blue/10 dark:bg-white/10 border-2 border-white dark:border-[var(--color-bg)] flex items-center justify-center text-[10px] font-black text-brand-blue dark:text-brand-lightBlue">
                                        +8
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="p-2 border-brand-blue/5 dark:border-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                                    <ArrowRight size={14} />
                                </Button>
                            </div>
                        </DashboardCard>
                    </section>
                </div>
            </div>
        </DashboardPage>
    );
}
