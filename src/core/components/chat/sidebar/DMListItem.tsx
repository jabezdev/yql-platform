import { formatDistanceToNow } from "date-fns";
import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "../../../providers/AuthProvider";
import { UserAvatar } from "../shared/UserAvatar";
import { UnreadBadge } from "../shared/UnreadBadge";
import { useChannelUnread } from "../../../hooks/useUnreadCounts";
import type { Id } from "../../../../../convex/_generated/dataModel";

export interface DMChannelShape {
    _id: Id<"chatChannels">;
    _creationTime: number;
    name: string;
    // Full union matches Doc<"chatChannels"> — runtime is always "dm" | "group_dm"
    type: "channel" | "subchannel" | "group" | "sidechat" | "dm" | "group_dm";
    participants: { _id: Id<"users">; name: string; profileChip: string | null }[];
    lastMessage: {
        bodyPlainText: string;
        _creationTime: number;
        authorId: Id<"users">;
    } | null;
}

interface DMListItemProps {
    channel: DMChannelShape;
}

export function DMListItem({ channel }: DMListItemProps) {
    const { channelId: activeId } = useParams();
    const { user } = useAuthContext();
    const unread = useChannelUnread(channel._id);
    const isActive = activeId === channel._id;

    const otherParticipants = channel.participants.filter((p) => p._id !== user?._id);
    const displayName =
        channel.type === "dm"
            ? (otherParticipants[0]?.name ?? channel.name)
            : channel.name;

    const avatarName = otherParticipants[0]?.name ?? channel.name;

    const lastPreview = channel.lastMessage
        ? channel.lastMessage.bodyPlainText.slice(0, 60) || "Sent an attachment"
        : "No messages yet";

    const timeAgo = channel.lastMessage
        ? formatDistanceToNow(new Date(channel.lastMessage._creationTime), { addSuffix: false })
        : null;

    return (
        <Link
            to={`/chat/${channel._id}`}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-tl-lg rounded-br-lg text-left transition-colors ${
                isActive
                    ? "bg-brand-lightBlue/10 text-brand-blue"
                    : "text-brand-blue/70 hover:bg-brand-blue/[0.04] hover:text-brand-blue"
            }`}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                {channel.type === "group_dm" ? (
                    <div className="w-8 h-8 bg-brand-yellow/60 border-2 border-brand-blue/20 rounded-tl-lg rounded-br-lg flex items-center justify-center text-xs font-bold text-brand-blue">
                        {channel.participants.length}
                    </div>
                ) : (
                    <UserAvatar name={avatarName} size="sm" />
                )}
            </div>

            {/* Name + preview */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                    <span
                        className={`text-sm truncate ${
                            unread > 0 ? "font-semibold text-brand-blue" : "font-medium"
                        }`}
                    >
                        {displayName}
                    </span>
                    {timeAgo && (
                        <span className="text-[10px] text-brand-blue/35 flex-shrink-0">
                            {timeAgo}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between gap-1">
                    <p
                        className={`text-xs truncate ${
                            unread > 0 ? "text-brand-blue/70" : "text-brand-blue/40"
                        }`}
                    >
                        {lastPreview}
                    </p>
                    <UnreadBadge count={unread} />
                </div>
            </div>
        </Link>
    );
}
