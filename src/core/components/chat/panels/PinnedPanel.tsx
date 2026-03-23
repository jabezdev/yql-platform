import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { MessageBody } from "../conversation/MessageBody";
import { UserAvatar } from "../shared/UserAvatar";
import { Pin, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface PinnedPanelProps {
    channelId: Id<"chatChannels">;
}

export function PinnedPanel({ channelId }: PinnedPanelProps) {
    const messages = useQuery(api.chatMessages.listPinnedMessages, { channelId });
    const pinMessage = useMutation(api.chatMessages.pinMessage);

    if (messages === undefined) {
        return (
            <div className="flex justify-center py-6">
                <Loader2 size={18} className="animate-spin text-brand-lightBlue/50" />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-brand-blue/25 px-4">
                <Pin size={28} strokeWidth={1.5} />
                <p className="text-xs font-medium text-center">No pinned messages yet.</p>
                <p className="text-[11px] text-center">Pin a message using the hover toolbar.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0 overflow-y-auto custom-scrollbar flex-1">
            {messages.map((msg) => (
                <div
                    key={msg._id}
                    className="group px-4 py-3 border-b border-brand-blue/6 hover:bg-brand-bgLight/60 transition-colors"
                >
                    <div className="flex items-start gap-2">
                        <UserAvatar name={msg.author?.name ?? "?"} size="sm" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-0.5">
                                <span className="text-xs font-bold text-brand-blue">
                                    {msg.author?.name ?? "Unknown"}
                                </span>
                                <span className="text-[10px] text-brand-blue/35">
                                    {format(new Date(msg._creationTime), "MMM d, h:mm a")}
                                </span>
                            </div>
                            <MessageBody body={msg.body} isDeleted={msg.isDeleted} />
                        </div>
                        {/* Unpin button */}
                        <button
                            onClick={() => pinMessage({ messageId: msg._id })}
                            title="Unpin message"
                            className="opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 p-1.5 rounded-tl-lg rounded-br-lg text-brand-blue/30 hover:text-brand-red hover:bg-brand-red/10 transition-all flex-shrink-0"
                        >
                            <Pin size={13} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
