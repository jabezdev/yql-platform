import { Navigate, Outlet, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import { ChatProvider, useChatContext } from "../providers/ChatProvider";
import { ChatSidebar } from "../components/chat/sidebar/ChatSidebar";
import { Loader2, ArrowLeft, X } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { UserAvatar } from "../components/chat/shared/UserAvatar";
import { ProfileSlideover } from "../components/profile/ProfileSlideover";
import { ThreadPanel } from "../components/chat/thread/ThreadPanel";
import { PinnedPanel } from "../components/chat/panels/PinnedPanel";
import { SearchPanel } from "../components/chat/panels/SearchPanel";
import { MemberPanel } from "../components/chat/panels/MemberPanel";
import { ChannelSettingsPanel } from "../components/chat/panels/ChannelSettingsPanel";
import { BookmarksPanel } from "../components/chat/panels/BookmarksPanel";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { useChatNotificationWatcher } from "../hooks/useNotifications";

function RightPanelContent() {
    const { rightPanel, setRightPanel, activeThreadMessageId } = useChatContext();
    const { channelId } = useParams<{ channelId: string }>();
    const typedChannelId = channelId as Id<"chatChannels"> | undefined;

    // Close right panel on Escape (desktop)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && rightPanel) setRightPanel(null);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [rightPanel, setRightPanel]);

    if (!rightPanel) return null;

    const titles: Record<string, string> = {
        thread: "Thread",
        members: "Members",
        search: "Search",
        pins: "Pinned Messages",
        bookmarks: "Bookmarks",
        settings: "Channel Settings",
    };

    const renderContent = () => {
        if (rightPanel === "thread" && activeThreadMessageId) {
            return <ThreadPanel rootMessageId={activeThreadMessageId} />;
        }
        if (rightPanel === "pins" && typedChannelId) {
            return <PinnedPanel channelId={typedChannelId} />;
        }
        if (rightPanel === "search" && typedChannelId) {
            return <SearchPanel channelId={typedChannelId} />;
        }
        if (rightPanel === "members" && typedChannelId) {
            return <MemberPanel channelId={typedChannelId} />;
        }
        if (rightPanel === "settings" && typedChannelId) {
            return <ChannelSettingsPanel channelId={typedChannelId} />;
        }
        if (rightPanel === "bookmarks") {
            return <BookmarksPanel />;
        }
        return null;
    };

    return (
        <div className="w-full lg:w-80 flex-shrink-0 bg-white flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-brand-blue/8 shrink-0">
                <h3 className="text-sm font-bold text-brand-blue">
                    {titles[rightPanel] ?? rightPanel}
                </h3>
                <button
                    onClick={() => setRightPanel(null)}
                    className="p-1.5 rounded-lg text-brand-blue/40 hover:bg-brand-bgLight hover:text-brand-blue transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
            {renderContent()}
        </div>
    );
}

function ChatLayoutInner() {
    const { user, isLoading } = useAuthContext();
    const { user: clerkUser } = useUser();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    useChatNotificationWatcher();
    const { rightPanel, mobileView, setMobileView } = useChatContext();
    const { channelId } = useParams<{ channelId: string }>();

    // When a channel is selected (URL changes), switch to conversation on mobile.
    useEffect(() => {
        if (channelId) setMobileView("conversation");
    }, [channelId, setMobileView]);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-brand-bgLight">
                <Loader2 className="animate-spin text-brand-lightBlue" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    return (
        // Use dvh for dynamic viewport — accounts for mobile browser chrome / keyboard.
        <div className="flex flex-col h-[100dvh] bg-brand-bgLight overflow-hidden">

            {/* ── Top bar ──────────────────────────────────────────────── */}
            <div className="flex-shrink-0 h-11 bg-white border-b-2 border-brand-blue/8 flex items-center justify-between px-4 z-30">

                {/* Left: contextual navigation */}
                {/* Desktop: always show "← Workspace" link */}
                <Link
                    to="/dashboard/overview"
                    className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-brand-blue/50 hover:text-brand-blue transition-colors"
                >
                    <ArrowLeft size={13} />
                    Workspace
                </Link>

                {/* Mobile: back button navigates through panel → conversation → sidebar */}
                <button
                    onClick={() => {
                        if (mobileView === "panel") setMobileView("conversation");
                        else if (mobileView === "conversation") setMobileView("sidebar");
                        else window.location.href = "/dashboard/overview";
                    }}
                    className="flex lg:hidden items-center gap-1.5 text-xs font-bold text-brand-blue/50 active:text-brand-blue transition-colors"
                >
                    <ArrowLeft size={13} />
                    {mobileView === "panel" ? "Back" : mobileView === "conversation" ? "Channels" : "Workspace"}
                </button>

                {/* Centre: logo */}
                <Link to="/">
                    <img src="/YQL_LOGO.svg" alt="YQL" className="h-6 w-auto" />
                </Link>

                {/* Right: user avatar */}
                <button
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <UserAvatar name={user.name} imageUrl={clerkUser?.imageUrl} size="xs" />
                    <span className="text-xs font-bold text-brand-blue hidden sm:block">{user.name}</span>
                </button>
            </div>

            {/* ── 3-panel area ─────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* Sidebar — full-width on mobile, fixed 288px on desktop */}
                <div className={`
                    ${mobileView === "sidebar" ? "flex" : "hidden"} lg:flex
                    flex-col flex-shrink-0 w-full lg:w-72
                    border-r-2 border-brand-blue/8
                `}>
                    <ChatSidebar />
                </div>

                {/* Main conversation */}
                <main className={`
                    ${mobileView === "conversation" ? "flex" : "hidden"} lg:flex
                    flex-1 min-h-0 min-w-0
                `}>
                    <Outlet />
                </main>

                {/* Right panel — full-width overlay on mobile, 320px sidebar on desktop */}
                <div className={`
                    ${(rightPanel && mobileView === "panel") ? "flex" : "hidden"} lg:flex
                    flex-col flex-shrink-0 w-full lg:w-80
                    lg:border-l-2 border-brand-blue/8
                `}>
                    <RightPanelContent />
                </div>
            </div>

            <ProfileSlideover
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
            />
        </div>
    );
}

export default function ChatLayout() {
    return (
        <ChatProvider>
            <ChatLayoutInner />
        </ChatProvider>
    );
}
