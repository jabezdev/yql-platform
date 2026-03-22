import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useChatContext } from "../../../providers/ChatProvider";
import { ConversationHeader } from "./ConversationHeader";
import { MessageList } from "./MessageList";
import { MessageComposer } from "../composer/MessageComposer";
import { TypingIndicator } from "./TypingIndicator";
import { Hash } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

export function ConversationView() {
    const { channelId } = useParams<{ channelId: string }>();
    const { setActiveChannelId } = useChatContext();
    const markAsRead = useMutation(api.chatMembers.markAsRead);

    const typedChannelId = channelId as Id<"chatChannels"> | undefined;

    useEffect(() => {
        if (typedChannelId) {
            setActiveChannelId(typedChannelId);
            markAsRead({ channelId: typedChannelId }).catch(() => {});
        }
        return () => setActiveChannelId(null);
    }, [typedChannelId, setActiveChannelId, markAsRead]);

    if (!typedChannelId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-brand-blue/25">
                <Hash size={40} strokeWidth={1.5} />
                <p className="text-sm font-medium">Select a channel to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
            <ConversationHeader channelId={typedChannelId} />
            <MessageList channelId={typedChannelId} />
            <TypingIndicator channelId={typedChannelId} />
            <MessageComposer channelId={typedChannelId} />
        </div>
    );
}
