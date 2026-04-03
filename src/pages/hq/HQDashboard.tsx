import { 
    PageHeader, 
    DashboardCard, 
    StatusBadge,
    DashboardSectionTitle,
    Button,
    DashboardPage,
    InfoCard,
    GeometricPattern
} from "@/design";
import { Shield, Zap, ArrowUpRight, Target, Users, TrendingUp } from "lucide-react";

export default function HQDashboard() {
    return (
        <DashboardPage className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader 
                title="Operations Console"
                eyebrow="Leadership · HQ"
                subtitle="The nerve center of YQL Platform governance."
                variant="ghost"
                action={
                    <Button variant="geometric-primary" size="sm">
                         Executive Briefing
                    </Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recruitment Snapshot */}
                <div className="lg:col-span-2 space-y-6">
                    <DashboardSectionTitle 
                        action={
                            <Button variant="ghost" size="sm" className="hidden sm:flex">
                                View Full Pipeline <ArrowUpRight size={14} className="ml-1" />
                            </Button>
                        }
                    >
                        Recruitment Pipeline
                    </DashboardSectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard 
                            icon={Users} 
                            label="Applicants Processed" 
                            value="82" 
                            color="blue"
                            trend={{ direction: 'up', value: '14%' }}
                        />
                        <InfoCard 
                            icon={Target} 
                            label="Interviews Slotted" 
                            value="14" 
                            color="yellow"
                            badge={<StatusBadge status="Busy" variant="warning" />}
                        />
                        <InfoCard 
                            icon={Shield} 
                            label="Offers Pending" 
                            value="03" 
                            color="green"
                        />
                        <InfoCard 
                            icon={TrendingUp} 
                            label="Conversion Rate" 
                            value="12%" 
                            color="blue"
                            trend={{ direction: 'neutral', value: 'Steady' }}
                        />
                    </div>
                </div>

                {/* HQ Tools */}
                <div className="space-y-6">
                    <DashboardSectionTitle>Admin Pulse</DashboardSectionTitle>
                    <DashboardCard variant="static" className="relative group overflow-hidden h-full">
                        {/* Geometric Decoration */}
                        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                            <GeometricPattern variant="corner-tr" size={80} />
                        </div>
                        
                        <div className="relative space-y-6 h-full flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-tl-lg rounded-br-lg bg-brand-blue/10 dark:bg-white/10 border-2 border-brand-blue/20 dark:border-white/20 transition-colors">
                                        <Shield size={20} className="text-brand-blue dark:text-brand-lightBlue" />
                                    </div>
                                    <h4 className="text-sm font-black text-brand-blue dark:text-white uppercase tracking-tight">Access Control</h4>
                                </div>
                                <p className="text-xs font-medium text-brand-blue/60 dark:text-white/60 leading-relaxed max-w-[220px]">
                                    Secure auditing of administrative activity, permission escalation logs, and credential management.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 bg-brand-blue/5 dark:bg-white/5 rounded-lg border border-brand-blue/10 dark:border-white/10">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-black uppercase text-brand-blue/40 dark:text-white/40">Security Status</span>
                                        <span className="text-[9px] font-black uppercase text-brand-green">Nominal</span>
                                    </div>
                                    <div className="w-full h-1 bg-brand-blue/10 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div className="w-full h-full bg-brand-green" />
                                    </div>
                                </div>
                                <Button variant="ghost" fullWidth className="justify-between px-3 border-2 border-brand-blue/10 dark:border-white/10 hover:border-brand-blue/30 dark:hover:border-white/30 hover:bg-white dark:hover:bg-white/5 bg-transparent">
                                    Launch Management Panel <Zap size={14} className="fill-brand-yellow text-brand-yellow" />
                                </Button>
                            </div>
                        </div>
                    </DashboardCard>
                </div>
            </div>
        </DashboardPage>
    );
}
