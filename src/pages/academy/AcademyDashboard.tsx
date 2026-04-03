import { 
    PageHeader, 
    DashboardCard, 
    ProgressBar, 
    DashboardSectionTitle,
    Button,
    DashboardPage,
    StepIndicator,
    GeometricPattern
} from "@/design";
import { BookOpen, Play, FileText, Award, ArrowRight, Star } from "lucide-react";

export default function AcademyDashboard() {
    const courseSteps = ["Foundation", "Design Ops", "Development", "Leadership"];
    
    return (
        <DashboardPage className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader 
                title="LMS & Academy"
                eyebrow="Knowledge Base"
                subtitle="Master the fundamental principles of the YQL way."
                variant="ghost"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Learning Progress */}
                <DashboardCard noPadding className="lg:col-span-2 relative overflow-hidden">
                    {/* Decorative Background Pattern */}
                    <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                        <GeometricPattern variant="hero-top-right" size={120} />
                    </div>

                    <div className="p-6 sm:p-8 border-b-2 border-brand-blue/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-tl-xl rounded-br-xl bg-brand-yellow/20 dark:bg-brand-yellow/10 border-2 border-brand-yellow/40 dark:border-brand-yellow/30 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(252,211,77,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-colors">
                                <Award className="text-brand-blue dark:text-brand-yellow" size={24} strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-black text-brand-blue dark:text-white">Quantum 101 Certification</h3>
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/40 dark:text-white/40 mt-0.5">Cohort 1 · Active Enrollment</p>
                            </div>
                        </div>
                        <Button variant="geometric-primary" size="sm" className="w-full sm:w-auto">
                            Resume Session <Play size={14} className="ml-2 fill-current" />
                        </Button>
                    </div>

                    <div className="p-6 sm:p-8 bg-brand-bgLight/30 dark:bg-white/5 relative z-10">
                        <ProgressBar 
                            value={42} 
                            label="Total Curriculum Progress" 
                            color="blue" 
                            className="mb-10"
                        />
                        
                        <div className="pt-4 overflow-x-auto pb-2">
                            <StepIndicator 
                                steps={courseSteps}
                                current={1}
                                className="min-w-[500px]"
                            />
                        </div>
                    </div>
                </DashboardCard>

                {/* Modules */}
                <div className="space-y-6">
                    <DashboardSectionTitle 
                        action={<Button variant="ghost" size="sm" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">View All</Button>}
                    >
                        Core Modules
                    </DashboardSectionTitle>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { title: "Introduction to YQL", duration: "15 mins", icon: Play, complete: true },
                            { title: "Design Language v2", duration: "45 mins", icon: BookOpen, complete: false },
                            { title: "Operational Standards", duration: "30 mins", icon: Star, complete: false },
                        ].map((module, i) => (
                            <DashboardCard key={i} variant="glass" className="group cursor-pointer border-2 border-brand-blue/5 dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-tl-lg rounded-br-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                        module.complete 
                                            ? 'bg-brand-blue border-brand-blue dark:bg-brand-yellow dark:border-brand-yellow text-white dark:text-brand-blue' 
                                            : 'bg-white dark:bg-white/5 border-brand-blue/20 dark:border-white/20 text-brand-blue dark:text-[var(--text-secondary)] group-hover:bg-brand-blue dark:group-hover:bg-brand-yellow group-hover:border-brand-blue dark:group-hover:border-brand-yellow group-hover:text-white dark:group-hover:text-brand-blue'
                                    }`}>
                                        <module.icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-[var(--text-primary)] group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors truncate">{module.title}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{module.duration}</p>
                                            {module.complete && <span className="w-1 h-1 rounded-full bg-brand-blue/20 dark:bg-brand-yellow/20" />}
                                            {module.complete && <span className="text-[9px] font-black uppercase text-brand-blue/40 dark:text-brand-yellow/60 tracking-tighter">Completed</span>}
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-[var(--text-muted)] opacity-50 group-hover:opacity-100 group-hover:text-brand-blue dark:group-hover:text-brand-yellow group-hover:translate-x-1 transition-all" />
                                </div>
                            </DashboardCard>
                        ))}
                    </div>
                </div>

                {/* Resource Library */}
                <div className="space-y-6">
                    <DashboardSectionTitle>Resource Library</DashboardSectionTitle>
                    <DashboardCard variant="static" className="h-fit border-2 border-brand-blue/5 dark:border-white/5">
                        <div className="space-y-5">
                            {[
                                { title: "Brand Identity Guide 2024.pdf", size: "4.2 MB", icon: FileText },
                                { title: "Technical Architecture v1.1", size: "2.1 MB", icon: FileText },
                                { title: "Cohort 1 Onboarding Kit", size: "12.8 MB", icon: Star }
                            ].map((res, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-brand-blue/5 dark:bg-white/5 rounded-lg border border-brand-blue/10 dark:border-white/10 text-[var(--text-muted)] group-hover:bg-brand-blue/10 dark:group-hover:bg-brand-yellow/20 group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors">
                                            <res.icon size={14} />
                                        </div>
                                        <span className="text-sm font-bold text-[var(--text-primary)] underline decoration-brand-blue/10 dark:decoration-white/10 underline-offset-4 group-hover:decoration-brand-blue dark:group-hover:decoration-brand-yellow transition-all">
                                            {res.title}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">{res.size}</span>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" fullWidth className="mt-8 border-2 border-brand-blue/5 dark:border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-brand-blue/30 dark:hover:border-white/30 hover:bg-white dark:hover:bg-white/5">
                            Open Full Vault
                        </Button>
                    </DashboardCard>
                </div>
            </div>
        </DashboardPage>
    );
}
