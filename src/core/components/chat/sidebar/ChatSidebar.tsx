import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useChatContext } from "../../../providers/ChatProvider";
import { Plus } from "lucide-react";
import { DMList } from "./DMList";
import { ChannelTree } from "./ChannelTree";
import { ChannelSearch } from "./ChannelSearch";
import { CreateChannelModal } from "./CreateChannelModal";
import type { ChannelNode } from "./ChannelTreeItem";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface CreateModalState {
    open: boolean;
    defaultParentId?: Id<"chatChannels">;
    defaultParentType?: string;
}

export function ChatSidebar() {
    const { sidebarTab, setSidebarTab } = useChatContext();
    const [channelFilter, setChannelFilter] = useState("");
    const [createModal, setCreateModal] = useState<CreateModalState>({ open: false });

    const channelTree = useQuery(api.chatChannels.getChannelTree, {});
    const unreadCounts = useQuery(api.chatMembers.getUnreadCounts, {}) ?? {};

    const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

    const handleCreateChild = (parentId: Id<"chatChannels">, parentType: string) => {
        setCreateModal({ open: true, defaultParentId: parentId, defaultParentType: parentType });
    };

    return (
        <div className="flex flex-col h-full w-full bg-white">
            {/* Tab switcher */}
            <div className="flex gap-1 p-3 border-b-2 border-brand-blue/8 shrink-0">
                <button
                    onClick={() => setSidebarTab("channels")}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-tl-lg rounded-br-lg transition-all ${
                        sidebarTab === "channels"
                            ? "bg-brand-blue text-white shadow-[2px_2px_0px_0px_rgba(10,22,48,0.25)]"
                            : "text-brand-blue/50 hover:bg-brand-bgLight"
                    }`}
                >
                    Channels
                </button>
                <button
                    onClick={() => setSidebarTab("direct")}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-tl-lg rounded-br-lg transition-all relative ${
                        sidebarTab === "direct"
                            ? "bg-brand-blue text-white shadow-[2px_2px_0px_0px_rgba(10,22,48,0.25)]"
                            : "text-brand-blue/50 hover:bg-brand-bgLight"
                    }`}
                >
                    Direct
                    {sidebarTab !== "direct" && totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-lightBlue text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {totalUnread > 9 ? "9+" : totalUnread}
                        </span>
                    )}
                </button>
            </div>

            {/* Channel list */}
            {sidebarTab === "channels" && (
                <div className="flex-1 overflow-y-auto custom-scrollbar py-2 flex flex-col gap-1">
                    <div className="flex items-center justify-between px-3 py-1">
                        <span className="text-[10px] font-extrabold text-brand-blue/30 uppercase tracking-widest">
                            Channels
                        </span>
                        <button
                            title="Create channel"
                            onClick={() => setCreateModal({ open: true })}
                            className="p-0.5 text-brand-blue/30 hover:text-brand-lightBlue transition-colors rounded"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <ChannelSearch value={channelFilter} onChange={setChannelFilter} />

                    <ChannelTree
                        channelTree={channelTree as ChannelNode[] | undefined}
                        unreadCounts={unreadCounts}
                        filterText={channelFilter}
                        onCreateChild={handleCreateChild}
                        onCreateRoot={() => setCreateModal({ open: true })}
                    />
                </div>
            )}

            {/* DM list */}
            {sidebarTab === "direct" && (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <DMList />
                </div>
            )}

            {/* Create channel modal */}
            {createModal.open && (
                <CreateChannelModal
                    defaultParentId={createModal.defaultParentId}
                    defaultParentType={createModal.defaultParentType}
                    onClose={() => setCreateModal({ open: false })}
                />
            )}
        </div>
    );
}
