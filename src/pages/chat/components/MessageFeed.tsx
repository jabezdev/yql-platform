import { useRef, useEffect } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Spinner } from "@/design";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { EnrichedMessage } from "../types";
import { buildDisplayEntries } from "../utils";
import { MessageItem } from "./MessageItem";

export function MessageFeed({
    channelId,
    userId,
    onOpenThread,
    activeThreadId,
}: {
    channelId: Id<"chatChannels">;
    userId?: Id<"users">;
    onOpenThread?: (threadId: Id<"chatMessages">) => void;
    activeThreadId?: Id<"chatMessages"> | null;
}) {
    const { results, status, loadMore } = usePaginatedQuery(
        api.chat.messages.listMessages,
        { channelId },
        { initialNumItems: 50 }
    );
    const toggleReaction = useMutation(api.chat.reactions.toggleReaction);
    const markAsRead     = useMutation(api.chat.members.markAsRead);
    const bottomRef = useRef<HTMLDivElement>(null);
    const feedRef   = useRef<HTMLDivElement>(null);
    const isAtBottom = useRef(true);

    const messages = [...results].reverse() as EnrichedMessage[];
    const entries  = buildDisplayEntries(messages);

    useEffect(() => {
        if (isAtBottom.current) {
            bottomRef.current?.scrollIntoView({ behavior: status === "LoadingFirstPage" ? "instant" : "smooth" });
        }
    }, [entries.length, status]);

    useEffect(() => {
        if (messages.length > 0 && (status === "CanLoadMore" || status === "Exhausted")) {
            const last = messages[messages.length - 1];
            if (last) {
                markAsRead({ channelId, lastMessageId: last._id }).catch(() => {});
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelId, status, messages.length]);

    const handleScroll = () => {
        const el = feedRef.current;
        if (!el) return;
        isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };

    if (status === "LoadingFirstPage") {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Spinner size="md" />
            </div>
        );
    }

    return (
        <div
            ref={feedRef}
            className="flex-1 overflow-y-auto"
            onScroll={handleScroll}
        >
            {status === "CanLoadMore" && (
                <div className="flex justify-center py-3">
                    <button
                        onClick={() => loadMore(50)}
                        className="text-xs text-brand-blue dark:text-brand-lightBlue font-medium px-3 py-1.5 rounded-tl-lg rounded-br-lg border border-brand-blue/20 dark:border-brand-lightBlue/20 hover:bg-brand-blue/5 dark:hover:bg-brand-lightBlue/10 transition-colors"
                    >
                        Load older messages
                    </button>
                </div>
            )}

            <div className="py-2">
                {entries.map(entry => {
                    if (entry.kind === "divider") {
                        return (
                            <div key={entry.key} className="flex items-center gap-3 px-4 py-3">
                                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    {entry.label}
                                </span>
                                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                            </div>
                        );
                    }
                    return (
                        <MessageItem
                            key={entry.key}
                            msg={entry.msg}
                            compact={entry.compact}
                            userId={userId}
                            onOpenThread={onOpenThread}
                            activeThreadId={activeThreadId}
                            onToggleReaction={(msgId, emoji) =>
                                toggleReaction({ messageId: msgId, emoji }).catch(() => {})
                            }
                        />
                    );
                })}
                <div ref={bottomRef} className="h-1" />
            </div>
        </div>
    );
}
