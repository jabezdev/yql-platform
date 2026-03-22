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
    // Track scroll height before loadMore so we can restore position after prepend.
    const prevScrollHeight = useRef<number>(0);
    const isLoadingMore = useRef(false);

    const { results, status, loadMore } = usePaginatedQuery(
        api.chatMessages.listMessages,
        { channelId },
        { initialNumItems: 50 }
    );

    // Reverse for chronological order (query returns desc)
    const messages = [...results].reverse();

    // The ID of the chronologically newest message (last in the array).
    const lastMessageId = messages.at(-1)?._id;

    // Scroll to bottom only when a genuinely new message arrives at the tail —
    // NOT when historical messages are prepended via loadMore.
    useEffect(() => {
        if (!lastMessageId) return;
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastMessageId]);

    // After loadMore resolves (status flips from "LoadingMore"), restore the
    // scroll position so the view doesn't jump to the top.
    useEffect(() => {
        if (status === "LoadingMore") {
            isLoadingMore.current = true;
        } else if (isLoadingMore.current) {
            isLoadingMore.current = false;
            const el = listRef.current;
            if (el) {
                // Scroll down by however much content was prepended.
                el.scrollTop = el.scrollHeight - prevScrollHeight.current;
            }
        }
    }, [status]);

    // Load more on scroll to top
    const handleScroll = () => {
        const el = listRef.current;
        if (!el) return;
        if (el.scrollTop < 100 && status === "CanLoadMore") {
            // Capture scroll height before the new items are added.
            prevScrollHeight.current = el.scrollHeight;
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
                    <Loader2 size={18} className="animate-spin text-brand-lightBlue/50" />
                </div>
            )}

            {/* Empty state */}
            {status !== "LoadingFirstPage" && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-brand-blue/30">
                    <span className="text-4xl">💬</span>
                    <p className="text-sm font-medium">No messages yet. Say something!</p>
                </div>
            )}

            {/* Loading first page */}
            {status === "LoadingFirstPage" && (
                <div className="flex justify-center items-center h-full">
                    <Loader2 size={24} className="animate-spin text-brand-lightBlue/50" />
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
