import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../../providers/AuthProvider";
import { Avatar, Container } from "@/design";
import { LogOut, Moon, Sun, User, Settings, ChevronDown, MessageSquare } from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ChatDrawer } from "../../pages/chat/components/ChatDrawer";

export function GlobalLayout() {
    const { user } = useAuthContext();
    const location = useLocation();
    const { isDark, toggle: toggleTheme } = useTheme();
    const { signOut } = useAuth();
    const { user: clerkUser } = useUser();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const firstName = user?.name?.split(" ")[0] || "User";
    const profileImageUrl = clerkUser?.imageUrl;

    // Route config based on domains
    const domains = [
        { name: "Me", path: "/me", visible: true },
        { name: "Academy", path: "/academy", visible: true },
        // Visible to T5 and above (Staff)
        { 
            name: "Workspace", 
            path: "/workspace", 
            visible: user && user.role !== "Applicant" 
        },
        { 
            name: "HQ Ops", 
            path: "/hq", 
            visible: user && ["Super Admin", "T1", "T2", "T3"].includes(user.role as string) 
        }
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--text-primary)] font-sans transition-colors duration-300">
            {/* Left Side: Main Application Shell (Header + Content) */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-brand-blue/5 dark:border-white/5">
                {/* Top Navigation Bar: Branded Geometric Style */}
                <header className="relative z-50 h-16 bg-[var(--color-surface)] border-b-4 border-brand-blue/10 dark:border-white/5 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.06)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                    <Container className="flex items-center justify-between h-full">
                        
                        {/* Logo & Brand */}
                        <div className="flex items-center gap-10">
                            <Link to="/me" className="flex items-center group">
                                <div className="h-10 flex items-center transition-transform hover:scale-105 active:scale-95 duration-200">
                                    <img 
                                        src={isDark ? "/YQL_LOGO_WHITE.svg" : "/YQL_LOGO.svg"} 
                                        alt="YQL Logo" 
                                        className="h-8 w-auto object-contain"
                                    />
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
                                                ? "text-brand-blue dark:text-brand-yellow border-brand-blue dark:border-brand-yellow drop-shadow-sm" 
                                                : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
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
                                    className="p-2 rounded-tl-lg rounded-br-lg border-2 border-transparent hover:border-brand-blue/15 dark:hover:border-white/15 hover:bg-black/[0.02] dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all outline-none"
                                    title="Toggle theme"
                                >
                                    {isDark ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
                                </button>
                            </div>

                            {/* User Profile Popover Hook */}
                            <div className="flex items-center gap-3">
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
                                        <Avatar name={user?.name || "?"} photoUrl={profileImageUrl} size="md" />
                                        <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Popover */}
                                    {isProfileOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-40" 
                                                onClick={() => setIsProfileOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-3 w-64 bg-[var(--color-surface)] border-2 border-brand-blue/10 dark:border-white/10 rounded-tl-2xl rounded-br-2xl shadow-[8px_8px_0px_0px_rgba(57,103,153,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                                                <div className="p-5 border-b border-brand-blue/5 dark:border-white/5 bg-brand-bgLight/30 dark:bg-white/5">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <Avatar name={user?.name || "?"} photoUrl={profileImageUrl} size="lg" />
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-display font-black text-[var(--text-primary)] truncate">{user?.name}</span>
                                                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-muted)]">{user?.role}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-2 space-y-1">
                                                    <button 
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-display font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-brand-bgLight dark:hover:bg-white/5 rounded-tl-lg rounded-br-lg transition-all text-left"
                                                        onClick={() => { setIsProfileOpen(false); /* Coming soon */ }}
                                                    >
                                                        <User size={14} /> My Profile
                                                    </button>
                                                    <button 
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-display font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-brand-bgLight dark:hover:bg-white/5 rounded-tl-lg rounded-br-lg transition-all text-left"
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

                                {/* Custom Chat Toggle Button (Right-most) */}
                                {!isChatOpen && (
                                    <button 
                                        onClick={() => setIsChatOpen(!isChatOpen)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-tl-xl rounded-br-xl border-2 transition-all duration-200 font-display font-black text-[10px] uppercase tracking-[0.15em] ${
                                            isChatOpen 
                                                ? "bg-brand-blue text-white border-brand-blue shadow-[4px_4px_0px_rgba(57,103,153,0.3)] dark:shadow-[4px_4px_0px_rgba(0,0,0,0.5)]" 
                                                : "bg-transparent text-[var(--text-muted)] border-brand-blue/10 hover:border-brand-blue/40 hover:text-brand-blue dark:hover:text-brand-yellow dark:hover:border-brand-yellow/30"
                                        }`}
                                        title="Toggle Chat"
                                    >
                                        <MessageSquare size={14} strokeWidth={3} className={isChatOpen ? "animate-pulse" : ""} />
                                        <span className={isChatOpen ? "" : "hidden lg:inline"}>Chat</span>
                                    </button>
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

            {/* Global Chat Side Panel (Splits screen 50/50) */}
            <div className="flex-shrink-0 h-full">
                <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            </div>
        </div>
    );
}

export default GlobalLayout;
