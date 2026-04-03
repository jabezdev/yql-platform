import { useRef, useEffect } from "react";
import { X, MessageSquare } from "lucide-react";
import { useQuery, usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { MessageItem } from "./MessageItem";
import { Composer } from "./Composer";
import type { EnrichedMessage } from "../types";

interface ThreadPanelProps {
    threadId: Id<"chatMessages">;
    userId?: Id<"users">;
    onClose: () => void;
}

export function ThreadPanel({ threadId, userId, onClose }: ThreadPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const toggleReaction = useMutation(api.chat.reactions.toggleReaction);
    
    const rootMessage = useQuery(api.chat.threads.getRootMessage, { messageId: threadId }) as EnrichedMessage | null | undefined;
    
    // Casting to any to bypass strict literal mismatch on pageStatus if it occurs in this environment
    const { results, status, loadMore } = usePaginatedQuery(
        api.chat.threads.listThreadReplies as any,
        { rootMessageId: threadId },
        { initialNumItems: 50 }
    );

    // Auto-scroll to bottom on new replies
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [results.length]);

    const handleToggleReaction = (msgId: Id<"chatMessages">, emoji: string) => {
        toggleReaction({ messageId: msgId, emoji }).catch(() => {});
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#0d1825]">
            {/* Header */}
            <div className="flex-shrink-0 h-16 border-b-2 border-brand-blue/[0.03] px-6 flex items-center justify-between bg-white/80 dark:bg-[#0d1825]/80 backdrop-blur-xl z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-blue/5 rounded-lg flex items-center justify-center border-2 border-brand-blue/10">
                        <MessageSquare size={16} className="text-brand-blue" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-brand-blue leading-none mb-0.5">Thread</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue/30">Secure Sub-channel</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 text-brand-blue/30 hover:text-brand-blue hover:bg-brand-blue/5 rounded-xl transition-all"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-2 custom-scrollbar"
            >
                {/* Root Message */}
                {rootMessage && (
                    <div className="border-b-2 border-brand-blue/[0.03] mb-4 pb-4">
                        <MessageItem 
                            msg={rootMessage} 
                            compact={false} 
                            userId={userId} 
                            onOpenThread={() => {}} 
                            onToggleReaction={handleToggleReaction}
                        />
                    </div>
                )}

                {/* Replies Divider */}
                <div className="px-6 mb-4 flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue/20 whitespace-nowrap">
                        {results.length} REPLIES
                    </span>
                    <div className="flex-1 h-px bg-brand-blue/[0.05]" />
                </div>

                {/* Replies Feed */}
                <div className="flex flex-col">
                    {results.map((msg: any) => (
                        <MessageItem 
                            key={msg._id} 
                            msg={msg} 
                            compact={false} 
                            userId={userId} 
                            onOpenThread={() => {}} 
                            onToggleReaction={handleToggleReaction}
                        />
                    ))}
                    
                    {status === "CanLoadMore" && (
                        <button 
                            onClick={() => loadMore(20)}
                            className="mx-6 my-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-blue/30 hover:text-brand-blue transition-all"
                        >
                            Load previous replies
                        </button>
                    )}

                    {status === "LoadingMore" && (
                        <div className="px-6 py-4 animate-pulse">
                            <div className="h-4 w-24 bg-brand-blue/5 rounded mb-2" />
                            <div className="h-12 w-full bg-brand-blue/[0.02] rounded" />
                        </div>
                    )}
                </div>
            </div>

            {/* Composer */}
            <div className="flex-shrink-0 p-4 border-t-2 border-brand-blue/[0.03] bg-brand-blue/[0.01]">
                {rootMessage && (
                    <Composer 
                        channelId={rootMessage.channelId}
                        threadRootMessageId={threadId}
                        placeholder="Reply to thread..."
                    />
                )}
            </div>
        </div>
    );
}
