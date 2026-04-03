import { ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { tokens } from "@/design";
import { SidebarChannels } from "./SidebarChannels";
import { SidebarDirectMessages } from "./SidebarDirectMessages";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { TreeChannel, DMChannel } from "../types";
import { SidebarSearch } from "./SidebarSearch";

export function ChatSidebar({
    user,
    tab,
    setTab,
    tree,
    dms,
    activeId,
    setActiveId,
    expanded,
    toggleExpand,
    unread,
    isLoadingChannels,
    isLoadingDMs,
    onSearch,
    onClose,
    isFullScreen,
    onToggleFullScreen
}: {
    user: any;
    tab: "channels" | "direct";
    setTab: (tab: "channels" | "direct") => void;
    tree: TreeChannel[];
    dms: DMChannel[];
    activeId: Id<"chatChannels"> | null;
    setActiveId: (id: Id<"chatChannels"> | null) => void;
    expanded: Set<string>;
    toggleExpand: (id: string) => void;
    unread: Record<string, number>;
    isLoadingChannels: boolean;
    isLoadingDMs: boolean;
    onSearch: (q: string) => void;
    onClose: () => void;
    isFullScreen: boolean;
    onToggleFullScreen: () => void;
}) {
    const sidebarTokens = tokens.sidebar;

    return (
        <aside className={`w-[260px] flex-shrink-0 flex flex-col ${sidebarTokens.bg} z-20 shadow-2xl relative transition-colors duration-300 border-r-4 border-brand-blue/10 dark:border-white/5`}>
            {/* Context Header with Controls - Synchronized with Main Nav */}
            <div className="h-16 flex-shrink-0 border-b-4 border-brand-blue/10 dark:border-white/5 bg-[var(--color-surface)] shadow-[0px_4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0px_4px_15px_rgba(0,0,0,0.2)] flex items-center justify-between px-3 gap-2">
                <button 
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-brand-blue/50 dark:text-white/40 hover:text-brand-blue dark:hover:text-white transition-colors group"
                    title="Collapse Chat"
                >
                    <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-[0.1em] opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
                </button>

                <div className="flex items-center gap-1.5">
                    <button 
                        onClick={onToggleFullScreen}
                        className="p-2 rounded-lg text-brand-blue/30 dark:text-white/30 hover:text-brand-blue dark:hover:text-white hover:bg-brand-blue/5 dark:hover:bg-white/5 transition-all"
                        title={isFullScreen ? "Restore Split" : "Full Screen"}
                    >
                        {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>
            </div>

            {/* Global Search Bar */}
            <SidebarSearch onSearch={onSearch} />

            {/* Tab Navigation (Renamed) */}
            <div className="px-4 pb-3">
                <div className="flex gap-1 bg-black/20 dark:bg-white/5 rounded-tl-lg rounded-br-lg p-1">
                    {(["channels", "direct"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all rounded-tl-md rounded-br-md ${
                                tab === t
                                    ? "bg-white text-brand-blue shadow-lg scale-[1.02]"
                                    : "text-white/30 dark:text-white/50 hover:text-white/60 dark:hover:text-white/80 hover:bg-white/5"
                            }`}
                        >
                            {t === "channels" ? "Channels" : "Direct"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-1 pb-6 custom-scrollbar">
                {tab === "channels" ? (
                    <SidebarChannels 
                        tree={tree}
                        activeId={activeId}
                        expanded={expanded}
                        unread={unread}
                        onSelect={setActiveId}
                        onToggle={toggleExpand}
                        isLoading={isLoadingChannels}
                    />
                ) : (
                    <SidebarDirectMessages 
                        dms={dms}
                        activeId={activeId}
                        unread={unread}
                        onSelect={setActiveId}
                        userId={user?._id}
                        isLoading={isLoadingDMs}
                    />
                )}
            </div>

        </aside>
    );
}
