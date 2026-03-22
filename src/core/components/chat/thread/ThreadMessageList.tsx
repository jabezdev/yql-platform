import { useEffect, useRef } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { MessageItem, type MessageWithMeta } from "../conversation/MessageItem";
import { Loader2 } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

const GROUP_THRESHOLD_MS = 5 * 60 * 1000;

interface ThreadMessageListProps {
    rootMessageId: Id<"chatMessages">;
}

export function ThreadMessageList({ rootMessageId }: ThreadMessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const { results, status, loadMore } = usePaginatedQuery(
        api.chatThreads.listThreadReplies,
        { rootMessageId },
        { initialNumItems: 50 }
    );

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [results.length]);

    const handleScroll = () => {
        const el = listRef.current;
        if (!el) return;
        if (el.scrollTop < 100 && status === "CanLoadMore") {
            loadMore(50);
        }
    };

    return (
        <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto custom-scrollbar py-2 min-h-0"
        >
            {status === "LoadingMore" && (
                <div className="flex justify-center py-2">
                    <Loader2 size={16} className="animate-spin text-brand-lightBlue/50" />
                </div>
            )}

            {status === "LoadingFirstPage" && (
                <div className="flex justify-center py-4">
                    <Loader2 size={18} className="animate-spin text-brand-lightBlue/50" />
                </div>
            )}

            {status !== "LoadingFirstPage" && results.length === 0 && (
                <div className="flex flex-col items-center justify-center h-24 gap-1 text-brand-blue/30">
                    <p className="text-xs font-medium">No replies yet. Start the thread!</p>
                </div>
            )}

            {results.map((message, i) => {
                const prev = results[i - 1];
                const isGrouped =
                    !!prev &&
                    prev.authorId === message.authorId &&
                    !prev.isSystem &&
                    !message.isSystem &&
                    message._creationTime - prev._creationTime < GROUP_THRESHOLD_MS;

                return (
                    <MessageItem
                        key={message._id}
                        message={message as MessageWithMeta}
                        isGrouped={isGrouped}
                    />
                );
            })}

            <div ref={bottomRef} />
        </div>
    );
}
