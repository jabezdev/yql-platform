import { useState } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../providers/AuthProvider";
import { getAccessibleGroups } from "../constants/navigation";
import { ChevronLeft, ChevronRight, Menu, Lock } from "lucide-react";
import { ProfileSlideover } from "../components/profile/ProfileSlideover";
import { PageErrorBoundary } from "../components/ui/PageErrorBoundary";
import { useUser } from "@clerk/clerk-react";

function UserAvatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className="w-10 h-10 rounded-tl-xl rounded-br-xl object-cover border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(10,22,48,0.35)] flex-shrink-0"
            />
        );
    }
    return (
        <div className="w-10 h-10 bg-brand-yellow border-2 border-brand-blueDark rounded-tl-xl rounded-br-xl flex items-center justify-center text-brand-blueDark font-bold text-lg shadow-[2px_2px_0px_0px_rgba(10,22,48,0.35)] flex-shrink-0">
            {name.charAt(0)}
        </div>
    );
}

export default function WorkspaceLayout() {
    const { user, isLoading, isAuthenticated } = useAuthContext();
    const { user: clerkUser } = useUser();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center bg-brand-bgLight">Loading...</div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    const avatarUrl = clerkUser?.imageUrl;

    const accessibleGroups = getAccessibleGroups(user.role, user.specialRoles);

    return (
        <div className="flex h-screen bg-brand-bgLight text-gray-900 font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col bg-white border-r-4 border-brand-blueDark transition-all duration-300 z-20 relative ${isCollapsed ? "w-20" : "w-64"}`}
            >
                {/* Collapse Toggle — direct child of aside so overflow-hidden on header can't clip it */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-4 top-[38px] w-8 h-8 bg-white border-2 border-brand-blueDark rounded-full flex items-center justify-center text-brand-blueDark hover:bg-brand-bgLight hover:scale-110 transition-all shadow-[2px_2px_0px_0px_rgba(10,22,48,0.35)] z-30"
                >
                    {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
                </button>

                <div className="flex flex-col h-full">
                    {/* Sidebar Header — overflow-hidden clips the rotated logo to header bounds */}
                    <div className="h-20 flex items-center justify-center border-b-2 border-gray-100 shrink-0 overflow-hidden px-3">
                        <Link to="/" className="block">
                            <img
                                src="/YQL_LOGO.svg"
                                alt="YQL Logo"
                                className={`transition-all duration-500 hover:scale-105 ${isCollapsed ? "h-10 w-auto -rotate-90 origin-center" : "h-10 w-auto"}`}
                            />
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className={`flex-1 overflow-y-auto custom-scrollbar scroll-smooth transition-all duration-300 ${isCollapsed ? "p-2 space-y-1" : "p-4 space-y-6"}`}>
                        {accessibleGroups.map((group) => (
                            <div key={group.id} className={isCollapsed ? "space-y-1" : "space-y-2"}>
                                <div className={`text-[10px] font-extrabold text-brand-gray uppercase tracking-widest px-2 transition-all duration-300 overflow-hidden ${isCollapsed ? "opacity-0 h-0 mb-0 pointer-events-none" : "opacity-100 h-auto mb-2"}`}>
                                    {group.title}
                                </div>
                                {group.accessibleItems.map((item) => {
                                    const active = location.pathname === item.href;
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.id}
                                            to={item.href}
                                            className={`flex items-center py-2.5 transition-all duration-300 group ${active
                                                ? "bg-brand-blueDark text-white font-bold rounded-tl-xl rounded-br-xl -translate-y-[1px] shadow-[3px_3px_0px_0px_rgba(10,22,48,0.45)]"
                                                : "text-brand-darkBlue font-medium hover:bg-gray-50 rounded-lg"
                                                } ${isCollapsed ? "justify-center w-full" : "gap-3 px-3"}`}
                                            title={isCollapsed ? item.title : undefined}
                                        >
                                            <Icon size={18} className={active ? "text-brand-yellow" : "text-brand-blue group-hover:scale-110 transition-transform"} strokeWidth={active ? 2.5 : 2} />
                                            {!isCollapsed && (
                                                <span className="text-sm whitespace-nowrap">{item.title}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                                {group.lockedItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex items-center py-2.5 rounded-lg cursor-not-allowed opacity-40 select-none ${isCollapsed ? "justify-center w-full" : "gap-3 px-3"}`}
                                            title={isCollapsed ? `${item.title} (requires higher role)` : undefined}
                                        >
                                            <Icon size={18} className="text-brand-blueDark/50" strokeWidth={2} />
                                            {!isCollapsed && (
                                                <>
                                                    <span className="text-sm whitespace-nowrap text-brand-blueDark/50 font-medium flex-1">{item.title}</span>
                                                    <Lock size={11} className="text-brand-blueDark/40 shrink-0" strokeWidth={2.5} />
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    {/* User Profile Footer */}
                    <div className={`border-t-2 border-gray-100 bg-gray-50/50 shrink-0 transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}>
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className={`w-full flex items-center transition-all duration-300 hover:bg-white hover:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.1)] rounded-xl py-2 ${isCollapsed ? "justify-center px-0" : "px-2 gap-3"}`}
                            title={isCollapsed ? `${user.name} — Profile & Settings` : undefined}
                        >
                            <UserAvatar name={user.name} imageUrl={avatarUrl} />
                            {!isCollapsed && (
                                <div className="flex flex-col items-start overflow-hidden text-left">
                                    <span className="text-sm font-bold text-brand-blueDark truncate block w-full">{user.name}</span>
                                    <span className="text-[10px] font-extrabold text-brand-blue uppercase tracking-wider truncate block w-full">{user.specialRoles?.join(', ') || user.role}</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Profile Slideover */}
            <ProfileSlideover
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={user}
            />

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
                            <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                                {accessibleGroups.map((group) => (
                                    <div key={group.id} className="space-y-2">
                                        <div className="text-[10px] font-extrabold text-brand-gray uppercase tracking-widest mb-2 px-2">
                                            {group.title}
                                        </div>
                                        {group.accessibleItems.map((item) => {
                                            const active = location.pathname === item.href;
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.id}
                                                    to={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className={`flex items-center gap-3 px-3 py-2.5 transition-all ${active
                                                        ? "bg-brand-blueDark text-white font-bold shadow-[3px_3px_0px_0px_rgba(10,22,48,0.45)] rounded-tl-xl rounded-br-xl"
                                                        : "text-brand-darkBlue font-medium hover:bg-gray-50 rounded-lg"
                                                        }`}
                                                >
                                                    <Icon size={18} className={active ? "text-brand-yellow" : "text-brand-blue"} strokeWidth={active ? 2.5 : 2} />
                                                    <span className="text-sm">{item.title}</span>
                                                </Link>
                                            );
                                        })}
                                        {group.lockedItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-not-allowed opacity-40 select-none"
                                                >
                                                    <Icon size={18} className="text-brand-blueDark/50" strokeWidth={2} />
                                                    <span className="text-sm text-brand-blueDark/50 font-medium flex-1">{item.title}</span>
                                                    <Lock size={11} className="text-brand-blueDark/40 shrink-0" strokeWidth={2.5} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </nav>
                            <div className="p-4 border-t-2 border-gray-100 bg-gray-50/50 shrink-0">
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        setIsProfileModalOpen(true);
                                    }}
                                    className="w-full flex items-center gap-3 px-2 py-2 transition-all hover:bg-white rounded-xl hover:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.1)]"
                                >
                                    <UserAvatar name={user.name} imageUrl={avatarUrl} />
                                    <div className="flex flex-col items-start overflow-hidden text-left">
                                        <span className="text-sm font-bold text-brand-blueDark truncate block">{user.name}</span>
                                        <span className="text-[10px] font-extrabold text-brand-blue uppercase tracking-wider truncate block">{user.specialRoles?.join(', ') || user.role}</span>
                                    </div>
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
                        <img src="/YQL_LOGO.svg" alt="YQL Logo" className="h-8 w-auto" />
                    </Link>
                    <div className="w-8" />
                </header>

                <div className="flex-1 w-full relative min-h-0">
                    <div className="absolute inset-0 p-4 md:p-6 lg:p-8 flex flex-col">
                        <PageErrorBoundary>
                            <Outlet />
                        </PageErrorBoundary>
                    </div>
                </div>
            </main>
        </div>
    );
}
