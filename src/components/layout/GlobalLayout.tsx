import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../../providers/AuthProvider";
import { Avatar, Container } from "@/design";
import { BookOpen, Map, Layers, Target, LogOut, Moon, Sun, Bell, User, Settings, ChevronDown } from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "@clerk/clerk-react";

export function GlobalLayout() {
    const { user } = useAuthContext();
    const location = useLocation();
    const { isDark, toggle: toggleTheme } = useTheme();
    const { signOut } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const firstName = user?.name?.split(" ")[0] || "User";

    // Route config based on domains
    const domains = [
        { name: "Me", path: "/me", icon: Target, visible: true },
        { name: "Academy", path: "/academy", icon: BookOpen, visible: true },
        // Visible to T5 and above (Staff)
        { 
            name: "Workspace", 
            path: "/workspace", 
            icon: Layers, 
            visible: user && user.role !== "Applicant" 
        },
        // Visible to T3 and Admins (Managers)
        { 
            name: "HQ Ops", 
            path: "/hq", 
            icon: Map, 
            visible: user && ["Super Admin", "T1", "T2", "T3"].includes(user.role as string) 
        }
    ];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-brand-bgLight dark:bg-[#080d14] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            {/* Top Navigation Bar: Branded Geometric Style */}
            <header className="relative z-50 h-16 bg-white dark:bg-[#0d1825] border-b-4 border-brand-blue/10 dark:border-brand-blue/20 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.06)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                <Container className="flex items-center justify-between h-full">
                    
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-10">
                        <Link to="/me" className="flex items-center group">
                            <div className="w-10 h-10 rounded-tl-xl rounded-br-xl bg-brand-blue border-2 border-brand-darkBlue shadow-[4px_4px_0px_0px_rgba(10,22,48,0.2)] flex items-center justify-center transform transition-transform group-hover:rotate-3 group-hover:scale-105">
                                <span className="text-white font-display font-black text-sm tracking-tighter uppercase">YQL</span>
                            </div>
                        </Link>

                        {/* Domain Links */}
                        <nav className="flex items-center gap-2 self-stretch">
                            {domains.filter(d => d.visible).map((domain) => {
                                const isActive = location.pathname.startsWith(domain.path);
                                return (
                                    <Link 
                                        key={domain.name}
                                        to={domain.path}
                                        className={`relative h-16 flex items-center px-4 text-[11px] font-display font-black uppercase tracking-widest transition-all duration-300 border-b-[3px] ${
                                            isActive 
                                            ? "text-brand-blue dark:text-white border-brand-blue dark:border-brand-yellow drop-shadow-sm" 
                                            : "text-brand-blue/40 dark:text-white/30 border-transparent hover:text-brand-blue dark:hover:text-white/60 hover:bg-brand-bgLight/50 dark:hover:bg-white/5"
                                        }`}
                                    >
                                        <span>{domain.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right Side Tools */}
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button 
                                onClick={toggleTheme}
                                className="p-2 rounded-tl-lg rounded-br-lg border-2 border-transparent hover:border-brand-blue/15 dark:hover:border-white/15 hover:bg-brand-bgLight dark:hover:bg-white/5 text-brand-blue/40 dark:text-white/40 hover:text-brand-blue dark:hover:text-white transition-all"
                                title="Toggle theme"
                            >
                                {isDark ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
                            </button>

                            {/* Notifications */}
                            <button className="relative p-2 rounded-tl-lg rounded-br-lg border-2 border-transparent hover:border-brand-blue/15 dark:hover:border-white/15 hover:bg-brand-bgLight dark:hover:bg-white/5 text-brand-blue/40 dark:text-white/40 hover:text-brand-blue dark:hover:text-white transition-all">
                                <Bell size={18} strokeWidth={2.5} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0d1825]" />
                            </button>
                        </div>

                        {/* User Profile Popover Hook */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-3 p-1.5 rounded-tl-xl rounded-br-xl transition-all duration-200 border-2 ${
                                    isProfileOpen 
                                        ? "bg-brand-bgLight dark:bg-white/10 border-brand-blue/15 dark:border-white/20" 
                                        : "border-transparent hover:bg-brand-bgLight dark:hover:bg-white/5 hover:border-brand-blue/5 dark:hover:border-white/5"
                                }`}
                            >
                                <span className="hidden md:block text-[12px] font-display font-black text-brand-blue dark:text-white tracking-tight ml-1">{firstName}</span>
                                <Avatar name={user?.name || "?"} size="md" />
                                <ChevronDown size={14} className={`text-brand-blue/30 dark:text-white/30 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Popover */}
                            {isProfileOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setIsProfileOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#121c2a] border-2 border-brand-blue/10 dark:border-white/10 rounded-tl-2xl rounded-br-2xl shadow-[8px_8px_0px_0px_rgba(57,103,153,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                                        <div className="p-5 border-b border-brand-blue/5 dark:border-white/5 bg-brand-bgLight/30 dark:bg-white/5">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar name={user?.name || "?"} size="lg" />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-display font-black text-brand-blue dark:text-white truncate">{user?.name}</span>
                                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/40 dark:text-white/40">{user?.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-2 space-y-1">
                                            <button 
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-display font-black uppercase tracking-widest text-brand-blue/60 dark:text-white/50 hover:text-brand-blue dark:hover:text-white hover:bg-brand-bgLight dark:hover:bg-white/5 rounded-tl-lg rounded-br-lg transition-all text-left"
                                                onClick={() => { setIsProfileOpen(false); /* Coming soon */ }}
                                            >
                                                <User size={14} /> My Profile
                                            </button>
                                            <button 
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-display font-black uppercase tracking-widest text-brand-blue/60 dark:text-white/50 hover:text-brand-blue dark:hover:text-white hover:bg-brand-bgLight dark:hover:bg-white/5 rounded-tl-lg rounded-br-lg transition-all text-left"
                                                onClick={() => { setIsProfileOpen(false); /* Coming soon */ }}
                                            >
                                                <Settings size={14} /> Settings
                                            </button>
                                        </div>

                                        <div className="p-2 border-t border-brand-blue/5 dark:border-white/5">
                                            <button 
                                                onClick={() => signOut()}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-display font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-tl-lg rounded-br-lg transition-all text-left"
                                            >
                                                <LogOut size={14} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Container>
            </header>

            {/* Main Content Render Area */}
            <main className="flex-1 overflow-y-auto relative bg-slate-50 dark:bg-[#080d14] scroll-smooth">
                {/* Background ambient light */}
                <div className="fixed -top-[10%] -left-[5%] w-[40%] h-[40%] bg-brand-blue/5 dark:bg-brand-blue/5 rounded-tl-[100px] blur-[100px] pointer-events-none" />
                <div className="fixed -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-brand-yellow/5 dark:bg-brand-yellow/5 rounded-br-[100px] blur-[100px] pointer-events-none" />
                
                <div className="relative z-10 h-full w-full py-8">
                    <Container>
                        <Outlet />
                    </Container>
                </div>
            </main>
        </div>
    );
}

export default GlobalLayout;
