import { ChevronDown, Sun, Moon, Settings } from "lucide-react";
import { Avatar, tokens } from "@/design";
import { SidebarChannels } from "./SidebarChannels";
import { SidebarDirectMessages } from "./SidebarDirectMessages";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { TreeChannel, DMChannel } from "../types";
import { useToast } from "../../../providers/ToastProvider";
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
    isDark,
    toggleTheme,
    isLoadingChannels,
    isLoadingDMs,
    onSearch
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
    isDark: boolean;
    toggleTheme: () => void;
    isLoadingChannels: boolean;
    isLoadingDMs: boolean;
    onSearch: (q: string) => void;
}) {
    const { toast } = useToast();
    const sidebarTokens = tokens.sidebar;

    const ComingSoon = (feature: string) => () => toast(`${feature} coming soon!`, "info");

    return (
        <aside className={`w-[260px] flex-shrink-0 flex flex-col ${sidebarTokens.bg} z-20 shadow-2xl relative`}>
            {/* Context Header */}
            <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between gap-2">
                <button className="flex items-center gap-2.5 text-white group flex-1 min-w-0">
                    <div className="w-8 h-8 bg-brand-yellow rounded-tl-lg rounded-br-lg flex items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-105 active:translate-x-0.5 active:translate-y-0.5">
                        <span className="text-sm font-black text-brand-darkBlue">Q</span>
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                        <div className="flex items-center gap-1.5 w-full">
                            <span className="text-sm font-bold truncate">QCSP Platform</span>
                            <ChevronDown size={14} className="text-white/40 group-hover:text-white transition-colors flex-shrink-0" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-white/30">HQ · Command</span>
                    </div>
                </button>
            </div>

            {/* Global Search Bar */}
            <SidebarSearch onSearch={onSearch} />

            {/* Tab Navigation */}
            <div className="px-4 pb-3">
                <div className="flex gap-1 bg-white/5 rounded-tl-lg rounded-br-lg p-1">
                    {(["channels", "direct"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all rounded-tl-md rounded-br-md ${
                                tab === t
                                    ? "bg-white text-brand-blue shadow-lg scale-[1.02]"
                                    : "text-white/30 hover:text-white/60 hover:bg-white/5"
                            }`}
                        >
                            {t === "channels" ? "HQ Channels" : "Private DM"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-1 pb-6 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
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

            {/* User Footer Profile */}
            <div className="mt-auto px-4 py-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar name={user?.name ?? "?"} size="sm" className="border-2 border-brand-yellow/30" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-brand-green rounded-full border-2 border-[#1c324a]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-white leading-tight truncate">
                            {user?.name ?? "Guest User"}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-white/40">{user?.role ?? "Operator"}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleTheme}
                            className="text-white/30 hover:text-brand-yellow transition-colors p-1.5 rounded-lg hover:bg-white/10"
                        >
                            {isDark ? <Sun size={14} /> : <Moon size={14} />}
                        </button>
                        <button 
                            onClick={ComingSoon("Settings")}
                            className="text-white/30 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                        >
                            <Settings size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
