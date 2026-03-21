import { useEffect, useRef } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { MessageItem, type MessageWithMeta } from "./MessageItem";
import { DateDivider } from "./DateDivider";
import { Loader2 } from "lucide-react";
import { isSameDay } from "date-fns";
import type { Id } from "../../../../../convex/_generated/dataModel";

const GROUP_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

interface MessageListProps {
    channelId: Id<"chatChannels">;
}

export function MessageList({ channelId }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const { results, status, loadMore } = usePaginatedQuery(
        api.chatMessages.listMessages,
        { channelId },
        { initialNumItems: 50 }
    );

    // Reverse for chronological order (query returns desc)
    const messages = [...results].reverse();

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [results.length]);

    // Load more on scroll to top
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
            className="flex-1 overflow-y-auto custom-scrollbar pb-2"
        >
            {/* Load more spinner */}
            {status === "LoadingMore" && (
                <div className="flex justify-center py-4">
                    <Loader2 size={18} className="animate-spin text-brand-blue/50" />
                </div>
            )}

            {/* Empty state */}
            {status !== "LoadingFirstPage" && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-brand-blueDark/30">
                    <span className="text-4xl">💬</span>
                    <p className="text-sm font-medium">No messages yet. Say something!</p>
                </div>
            )}

            {/* Loading first page */}
            {status === "LoadingFirstPage" && (
                <div className="flex justify-center items-center h-full">
                    <Loader2 size={24} className="animate-spin text-brand-blue/50" />
                </div>
            )}

            {/* Messages */}
            {messages.map((message, i) => {
                const prev = messages[i - 1];
                const showDateDivider =
                    !prev || !isSameDay(new Date(prev._creationTime), new Date(message._creationTime));

                const isGrouped =
                    !showDateDivider &&
                    !!prev &&
                    prev.authorId === message.authorId &&
                    !prev.isSystem &&
                    !message.isSystem &&
                    message._creationTime - prev._creationTime < GROUP_THRESHOLD_MS;

                return (
                    <div key={message._id}>
                        {showDateDivider && <DateDivider timestamp={message._creationTime} />}
                        <MessageItem message={message as MessageWithMeta} isGrouped={isGrouped} />
                    </div>
                );
            })}

            <div ref={bottomRef} />
        </div>
    );
}
