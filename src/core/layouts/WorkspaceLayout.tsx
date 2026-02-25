import { useState } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../providers/AuthProvider";
import { workspaces } from "../constants/navigation";
import { LogOut, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";

export default function WorkspaceLayout() {
    const { user, isLoading, isAuthenticated } = useAuthContext();
    const location = useLocation();
    const { signOut } = useClerk();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center bg-brand-bgLight">Loading...</div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    const accessibleWorkspaces = workspaces.filter((item) => {
        if (!item.roles.includes(user.role)) return false;
        if (item.disallowedSubRoles && user.staffSubRole && item.disallowedSubRoles.includes(user.staffSubRole)) return false;
        return true;
    });

    return (
        <div className="flex h-screen bg-brand-bgLight text-gray-900 font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col justify-between bg-white border-r-4 border-brand-blueDark transition-all duration-300 z-20 ${isCollapsed ? "w-20" : "w-64"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="h-20 flex items-center justify-center border-b-2 border-gray-100 relative px-4 shrink-0">
                        {isCollapsed ? (
                            <Link to="/" className="block hover:scale-105 transition-transform">
                                <div className="w-8 h-8 bg-brand-yellow border-2 border-brand-blueDark rounded-tl-lg rounded-br-lg rotate-12 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]">
                                    <span className="font-bold text-brand-blueDark text-xs -rotate-12">Y</span>
                                </div>
                            </Link>
                        ) : (
                            <Link to="/" className="block">
                                <img src="/YQL_LOGO.svg" alt="YQL Logo" className="h-10 w-auto hover:scale-105 transition-transform" />
                            </Link>
                        )}

                        {/* Collapse Toggle */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-brand-blueDark rounded-full flex items-center justify-center text-brand-blueDark hover:bg-brand-bgLight hover:scale-110 transition-all shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] z-30"
                        >
                            {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {!isCollapsed && (
                            <div className="text-[10px] font-extrabold text-brand-gray uppercase tracking-widest mb-2 px-2">
                                Workspaces
                            </div>
                        )}
                        {accessibleWorkspaces.map((ws) => {
                            const active = location.pathname.startsWith(ws.href);
                            const Icon = ws.icon;
                            return (
                                <Link
                                    key={ws.id}
                                    to={ws.href}
                                    className={`flex items-center gap-3 px-3 py-3 transition-all group ${active
                                        ? "bg-brand-blueDark text-white font-bold border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,1)] rounded-tl-xl rounded-br-xl -translate-y-[1px]"
                                        : "text-brand-darkBlue font-medium border-2 border-transparent hover:border-brand-gray/30 hover:bg-gray-50 rounded-lg"
                                        } ${isCollapsed ? "justify-center px-0" : ""}`}
                                    title={isCollapsed ? ws.title : undefined}
                                >
                                    <Icon size={20} className={active ? "text-brand-yellow" : "text-brand-blue group-hover:scale-110 transition-transform"} strokeWidth={active ? 2.5 : 2} />
                                    {!isCollapsed && <span>{ws.title}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile Footer */}
                    <div className="p-4 border-t-2 border-gray-100 bg-gray-50/50 shrink-0">
                        <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? "justify-center" : "px-2"}`}>
                            <div className="w-10 h-10 bg-brand-yellow border-2 border-brand-blueDark rounded-tl-xl rounded-br-xl flex items-center justify-center text-brand-blueDark font-bold text-lg shadow-[2px_2px_0px_0px_rgba(57,103,153,1)] flex-shrink-0">
                                {user.name.charAt(0)}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-col overflow-hidden">
                                    <span className="text-sm font-bold text-brand-blueDark truncate block">{user.name}</span>
                                    <span className="text-[10px] font-extrabold text-brand-blue uppercase tracking-wider truncate block">{user.staffSubRole || user.role}</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => signOut({ redirectUrl: '/' })}
                            className={`w-full flex items-center gap-3 py-2.5 text-brand-wine hover:bg-brand-wine/10 border-2 border-transparent hover:border-brand-wine/30 rounded-lg transition-colors font-bold ${isCollapsed ? "justify-center px-0" : "px-3"}`}
                            title={isCollapsed ? "Sign Out" : undefined}
                        >
                            <LogOut size={20} />
                            {!isCollapsed && <span>Sign Out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
                    <aside
                        className="w-64 h-full bg-white border-r-4 border-brand-blueDark flex flex-col justify-between"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col h-full">
                            <div className="h-20 flex items-center justify-center border-b-2 border-gray-100 relative px-4 shrink-0">
                                <Link to="/" className="block" onClick={() => setMobileMenuOpen(false)}>
                                    <img src="/YQL_LOGO.svg" alt="YQL Logo" className="h-10 w-auto" />
                                </Link>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-4 space-y-3">
                                <div className="text-[10px] font-extrabold text-brand-gray uppercase tracking-widest mb-2 px-2">
                                    Workspaces
                                </div>
                                {accessibleWorkspaces.map((ws) => {
                                    const active = location.pathname.startsWith(ws.href);
                                    const Icon = ws.icon;
                                    return (
                                        <Link
                                            key={ws.id}
                                            to={ws.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-3 transition-all ${active
                                                ? "bg-brand-blueDark text-white font-bold border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,1)] rounded-tl-xl rounded-br-xl"
                                                : "text-brand-darkBlue font-medium border-2 border-transparent hover:border-brand-gray/30 hover:bg-gray-50 rounded-lg"
                                                }`}
                                        >
                                            <Icon size={20} className={active ? "text-brand-yellow" : "text-brand-blue"} strokeWidth={active ? 2.5 : 2} />
                                            <span>{ws.title}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="p-4 border-t-2 border-gray-100 bg-gray-50/50 shrink-0">
                                <div className="flex items-center gap-3 px-2 mb-4">
                                    <div className="w-10 h-10 bg-brand-yellow border-2 border-brand-blueDark rounded-tl-xl rounded-br-xl flex items-center justify-center text-brand-blueDark font-bold text-lg shadow-[2px_2px_0px_0px_rgba(57,103,153,1)] flex-shrink-0">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex-col overflow-hidden">
                                        <span className="text-sm font-bold text-brand-blueDark truncate block">{user.name}</span>
                                        <span className="text-[10px] font-extrabold text-brand-blue uppercase tracking-wider truncate block">{user.staffSubRole || user.role}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => signOut({ redirectUrl: '/' })}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-brand-wine hover:bg-brand-wine/10 border-2 border-transparent hover:border-brand-wine/30 rounded-lg transition-colors font-bold"
                                >
                                    <LogOut size={20} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10 w-full">
                {/* Mobile Header */}
                <header className="h-16 bg-white border-b-4 border-brand-blueDark flex items-center justify-between px-4 md:hidden shrink-0 shadow-sm z-20">
                    <button onClick={() => setMobileMenuOpen(true)} className="text-brand-blueDark hover:text-brand-blue transition-colors p-2">
                        <Menu size={24} strokeWidth={2.5} />
                    </button>
                    <Link to="/">
                        <div className="w-8 h-8 bg-brand-yellow border-2 border-brand-blueDark rounded-tl-lg rounded-br-lg rotate-12 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]">
                            <span className="font-bold text-brand-blueDark text-xs -rotate-12">Y</span>
                        </div>
                    </Link>
                    <button onClick={() => signOut({ redirectUrl: '/' })} className="text-brand-wine hover:text-brand-red p-2">
                        <LogOut size={20} strokeWidth={2.5} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto w-full h-full relative custom-scrollbar">
                    <div className="relative z-10 p-4 md:p-8 h-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}

