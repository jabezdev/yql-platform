import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, Activity, FormInput, BookOpen, Calendar as CalendarIcon } from "lucide-react";
import { PageHeader } from "../components/ui/structure/PageHeader";

export default function AdminLayout() {
    const location = useLocation();

    const tabs = [
        { id: "pipeline", label: "Pipeline", href: "/admin/pipeline", icon: Activity },
        { id: "roles", label: "User Roles", href: "/admin/roles", icon: Users },
        { id: "forms", label: "Form Builder", href: "/admin/forms", icon: FormInput },
        { id: "onboarding", label: "Onboarding Modules", href: "/admin/onboarding", icon: BookOpen },
        { id: "calendar", label: "Global Calendar", href: "/admin/calendar", icon: CalendarIcon },
    ];

    return (
        <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto">
            {/* Admin Header */}
            <PageHeader
                title="Command Center"
                subtitle="High-level system oversight and pipeline management."
            />

            {/* Admin Navigation Sidebar/Tabs Wrapper */}
            <div className="bg-white rounded-tl-2xl rounded-br-2xl border-2 border-brand-blue shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] shrink-0 overflow-hidden">
                <div className="bg-brand-bgLight/30 px-4 md:px-8 py-2 overflow-x-auto custom-scrollbar">
                    <nav className="flex items-center gap-2 min-w-max">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = location.pathname === tab.href || (tab.id === "pipeline" && location.pathname === "/admin");
                            return (
                                <Link
                                    key={tab.id}
                                    to={tab.href}
                                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-4 ${isActive
                                        ? "text-brand-lightBlue border-brand-lightBlue bg-white"
                                        : "text-brand-darkBlue/60 border-transparent hover:text-brand-lightBlue hover:bg-white/50"
                                        }`}
                                >
                                    <Icon size={18} className={isActive ? "text-brand-lightBlue" : "text-brand-blue/40"} strokeWidth={isActive ? 2.5 : 2} />
                                    {tab.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Sub-page Content */}
            <div className="flex-1 min-h-0">
                <Outlet />
            </div>
        </div>
    );
}
