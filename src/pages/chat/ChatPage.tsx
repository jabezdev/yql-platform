import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuthContext } from "../../providers/AuthProvider";
import { useTheme } from "../../providers/ThemeProvider";

import { ChatSidebar } from "./components/ChatSidebar";
import { ChatMain } from "./components/ChatMain";
import { SearchOverlay } from "./components/SearchOverlay";
import type { FlatChannel, DMChannel } from "./types";
import { buildTree } from "./utils";

export default function ChatPage() {
    const { user } = useAuthContext();
    const { isDark, toggle: toggleTheme } = useTheme();

    const [tab, setTab]             = useState<"channels" | "direct">("channels");
    const [activeId, setActiveId]   = useState<Id<"chatChannels"> | null>(null);
    const [expanded, setExpanded]   = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    const flatChannels  = useQuery(api.chat.channels.getChannelTreeFlat) as FlatChannel[] | undefined;
    const dms           = useQuery(api.chat.directMessages.listMyDMs)    as DMChannel[]   | undefined;
    const unreadCounts  = useQuery(api.chat.members.getUnreadCounts)     as Record<string, number> | undefined;

    const tree   = React.useMemo(() => 
        flatChannels ? buildTree(flatChannels.filter(c => c.type !== "dm" && c.type !== "group_dm")) : []
    , [flatChannels]);
    const unread = unreadCounts ?? {};

    useEffect(() => {
        if (!activeId && tree.length > 0) {
            setActiveId(tree[0]._id);
        }
    }, [tree, activeId]);

    const toggleExpand = (id: string) =>
        setExpanded(prev => { 
            const n = new Set(prev); 
            n.has(id) ? n.delete(id) : n.add(id); 
            return n; 
        });

    const activeDM = dms?.find(d => d._id === activeId);
    const isActiveDM = !!activeDM;

    const handleSelectSearchResult = (_messageId: Id<"chatMessages">, channelId: Id<"chatChannels">) => {
        setActiveId(channelId);
        setSearchQuery("");
        // In a more advanced implementation, we would scroll to the messageId
    };

    return (
        <div className={`flex h-screen overflow-hidden ${isDark ? "dark" : ""}`} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div className="flex w-full h-full bg-slate-50 dark:bg-[#0d1825]">
                <ChatSidebar 
                    user={user}
                    tab={tab}
                    setTab={setTab}
                    tree={tree}
                    dms={dms ?? []}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    expanded={expanded}
                    toggleExpand={toggleExpand}
                    unread={unread}
                    isDark={isDark}
                    toggleTheme={toggleTheme}
                    isLoadingChannels={flatChannels === undefined}
                    isLoadingDMs={dms === undefined}
                    onSearch={setSearchQuery}
                />

                <div className="flex-1 relative flex flex-col min-w-0">
                    <ChatMain 
                        channelId={activeId}
                        userId={user?._id}
                        activeDM={activeDM}
                        isDM={isActiveDM}
                    />

                    {searchQuery && (
                        <SearchOverlay 
                            query={searchQuery}
                            channelId={null} // Global search by default from sidebar
                            onClose={() => setSearchQuery("")}
                            onSelectMessage={handleSelectSearchResult}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
