import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuthContext } from "../../../providers/AuthProvider";

import { ChatSidebar } from "./ChatSidebar";
import { ChatMain } from "./ChatMain";
import { SearchOverlay } from "./SearchOverlay";
import type { FlatChannel, DMChannel } from "../types";
import { buildTree } from "../utils";

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
    const { user } = useAuthContext();
    const [isFullScreen, setIsFullScreen] = useState(false);

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
    };

    return (
        <motion.div 
            initial={false}
            animate={{ 
                width: isOpen ? (isFullScreen ? "100vw" : "50vw") : "0px",
                opacity: isOpen ? 1 : 0
            }}
            transition={{ type: "spring", damping: 30, stiffness: 300, opacity: { duration: 0.2 } }}
            className="h-full bg-[var(--color-bg)] overflow-hidden flex flex-col border-l-4 border-brand-blue/20 dark:border-white/10 shadow-[-10px_0px_30px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0px_50px_rgba(0,0,0,0.5)] relative z-20"
        >
            <div className="flex-1 flex overflow-hidden w-full min-w-[320px] min-h-0">
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
                    isLoadingChannels={flatChannels === undefined}
                    isLoadingDMs={dms === undefined}
                    onSearch={setSearchQuery}
                    onClose={() => {
                        setIsFullScreen(false);
                        onClose();
                    }}
                    isFullScreen={isFullScreen}
                    onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
                />

                <div className="flex-1 relative flex flex-col min-w-0 min-h-0 bg-[var(--color-bg)] border-l border-[var(--color-border)]">
                    <ChatMain 
                        channelId={activeId}
                        userId={user?._id}
                        activeDM={activeDM}
                        isDM={isActiveDM}
                    />

                    {searchQuery && (
                        <SearchOverlay 
                            query={searchQuery}
                            channelId={null} 
                            onClose={() => setSearchQuery("")}
                            onSelectMessage={handleSelectSearchResult}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
}
