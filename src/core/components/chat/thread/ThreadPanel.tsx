import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ThreadMessageList } from "./ThreadMessageList";
import { ThreadComposer } from "./ThreadComposer";
import { MessageBody } from "../conversation/MessageBody";
import { UserAvatar } from "../shared/UserAvatar";
import { Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface ThreadPanelProps {
    rootMessageId: Id<"chatMessages">;
}

export function ThreadPanel({ rootMessageId }: ThreadPanelProps) {
    const rootMessage = useQuery(api.chatThreads.getRootMessage, { messageId: rootMessageId });

    if (rootMessage === undefined) {
        return (
            <div className="flex items-center justify-center flex-1">
                <Loader2 size={18} className="animate-spin text-brand-blue/50" />
            </div>
        );
    }

    if (rootMessage === null) {
        return (
            <div className="flex items-center justify-center flex-1 text-brand-blueDark/30 text-sm">
                Message not found.
            </div>
        );
    }

    const authorName = rootMessage.author?.name ?? "Unknown";
    const replyCount = rootMessage.threadReplyCount ?? 0;

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Original message */}
            <div className="px-4 py-3 border-b-2 border-brand-blueDark/8 shrink-0 bg-brand-bgLight/50">
                <div className="flex gap-2.5">
                    <UserAvatar name={authorName} size="sm" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-xs font-bold text-brand-blueDark">{authorName}</span>
                            <span className="text-[10px] text-brand-blueDark/35">
                                {format(new Date(rootMessage._creationTime), "h:mm a")}
                            </span>
                        </div>
                        <MessageBody body={rootMessage.body} isDeleted={rootMessage.isDeleted} />
                    </div>
                </div>
                {replyCount > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-blue/60 font-medium">
                        <MessageSquare size={11} />
                        {replyCount} {replyCount === 1 ? "reply" : "replies"}
                    </div>
                )}
            </div>

            {/* Replies */}
            <ThreadMessageList rootMessageId={rootMessageId} />

            {/* Composer */}
            <ThreadComposer channelId={rootMessage.channelId} rootMessageId={rootMessageId} />
        </div>
    );
}
