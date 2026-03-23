import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Pin, MessageSquare, Bookmark, Smile, MoveRight, Pencil, MoreHorizontal } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthContext } from "../../../providers/AuthProvider";
import { useChatContext } from "../../../providers/ChatProvider";
import { MessageBody } from "./MessageBody";
import { SystemMessage } from "./SystemMessage";
import { UserAvatar } from "../shared/UserAvatar";
import { EmojiPicker } from "../composer/EmojiPicker";
import { PollDisplay } from "../poll/PollDisplay";
import { UrlPreviewCard } from "../shared/UrlPreviewCard";
import { MoveMessageModal } from "../modals/MoveMessageModal";
import { InlineEditComposer } from "./InlineEditComposer";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { isManager } from "../../../../../convex/roleHierarchy";

export type MessageWithMeta = Omit<Doc<"chatMessages">, "attachments"> & {
    author: { _id: Id<"users">; name: string; role: string; profileChip?: string } | null;
    reactions: { emoji: string; userIds: string[]; count: number }[];
    poll: Doc<"chatPolls"> | null;
    attachments?: Array<{
        storageId: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | null;
    }>;
};

interface MessageItemProps {
    message: MessageWithMeta;
    isGrouped?: boolean; // same author as previous message within 5 mins
}

export function MessageItem({ message, isGrouped = false }: MessageItemProps) {
    const { user } = useAuthContext();
    const { openThread } = useChatContext();
    const [showActions, setShowActions] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const deleteMessage = useMutation(api.chatMessages.deleteMessage);
    const pinMessage = useMutation(api.chatMessages.pinMessage);
    const addBookmark = useMutation(api.chatBookmarks.addBookmark);
    const toggleReaction = useMutation(api.chatReactions.toggleReaction);

    if (message.isSystem) {
        return <SystemMessage message={message} />;
    }

    const isOwn = user?._id === message.authorId;
    const authorName = message.author?.name ?? "Unknown";

    const handleDelete = async () => {
        if (!confirm("Delete this message?")) return;
        await deleteMessage({ messageId: message._id });
    };

    const handlePin = async () => {
        await pinMessage({ messageId: message._id });
    };

    const handleBookmark = async () => {
        await addBookmark({ messageId: message._id });
    };

    const handleReaction = async (emoji: string) => {
        await toggleReaction({ messageId: message._id, emoji });
    };

    return (
        <div
            className={`group relative flex gap-3 px-4 hover:bg-brand-blue/[0.02] transition-colors ${isGrouped ? "pt-0.5" : "pt-3"}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Mobile-only: ··· button that toggles the action toolbar on tap */}
            {!message.isDeleted && !isEditing && (
                <button
                    className="flex lg:hidden absolute right-3 top-1.5 p-1.5 rounded-tl-lg rounded-br-lg text-brand-blue/40 active:text-brand-blue active:bg-brand-bgLight transition-colors z-10"
                    onTouchEnd={(e) => { e.stopPropagation(); setShowActions((v) => !v); }}
                    onClick={(e) => { e.stopPropagation(); setShowActions((v) => !v); }}
                    aria-label="Message actions"
                >
                    <MoreHorizontal size={15} />
                </button>
            )}
            {/* Avatar or spacer */}
            <div className="w-9 flex-shrink-0 pt-0.5">
                {!isGrouped ? (
                    <UserAvatar name={authorName} size="md" />
                ) : (
                    <span className="block w-full text-center text-[10px] text-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity leading-9">
                        {format(new Date(message._creationTime), "h:mm a")}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {!isGrouped && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-sm font-bold text-brand-blue">{authorName}</span>
                        <span className="text-[10px] text-brand-blue/35 font-medium">
                            {format(new Date(message._creationTime), "h:mm a")}
                        </span>
                        {message.isPinned && (
                            <span className="text-[10px] text-brand-lightBlue/60 flex items-center gap-0.5">
                                <Pin size={10} /> pinned
                            </span>
                        )}
                        {message.isEdited && (
                            <span className="text-[10px] text-brand-blue/30 italic">(edited)</span>
                        )}
                    </div>
                )}

                {/* Body or inline edit */}
                {isEditing ? (
                    <InlineEditComposer
                        messageId={message._id}
                        initialBody={message.body}
                        onDone={() => setIsEditing(false)}
                    />
                ) : (
                    !message.poll && <MessageBody body={message.body} isDeleted={message.isDeleted} />
                )}

                {/* Poll */}
                {message.poll && !message.isDeleted && (
                    <PollDisplay poll={message.poll} />
                )}

                {/* URL previews */}
                {message.urlPreviews && message.urlPreviews.length > 0 && !message.isDeleted && (
                    <div className="flex flex-col gap-1">
                        {message.urlPreviews.map((p, i) => (
                            <UrlPreviewCard key={i} preview={p} />
                        ))}
                    </div>
                )}

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {message.attachments.map((att) => (
                            att.mimeType.startsWith("image/") ? (
                                <img
                                    key={att.storageId}
                                    src={att.url ?? ""}
                                    alt={att.filename}
                                    className="max-h-64 w-full sm:max-w-xs rounded-tl-lg rounded-br-lg border-2 border-brand-blue/10 object-cover"
                                />
                            ) : (
                                <a
                                    key={att.storageId}
                                    href={att.url ?? "#"}
                                    download={att.filename}
                                    className="flex items-center gap-2 px-3 py-2 bg-brand-bgLight border-2 border-brand-blue/10 rounded-tl-lg rounded-br-lg text-xs font-medium text-brand-lightBlue hover:border-brand-lightBlue/40 transition-colors"
                                >
                                    {att.filename}
                                </a>
                            )
                        ))}
                    </div>
                )}

                {/* Reactions */}
                {message.reactions.length > 0 && !message.isDeleted && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {message.reactions.map((r) => {
                            const hasReacted = r.userIds.includes(user?._id ?? "");
                            return (
                                <button
                                    key={r.emoji}
                                    onClick={() => handleReaction(r.emoji)}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-tl-lg rounded-br-lg border text-xs font-medium transition-all ${
                                        hasReacted
                                            ? "bg-brand-lightBlue/10 border-brand-lightBlue/40 text-brand-blue"
                                            : "bg-white border-brand-blue/15 text-brand-blue/60 hover:border-brand-lightBlue/30"
                                    }`}
                                >
                                    <span>{r.emoji}</span>
                                    <span>{r.count}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Thread preview */}
                {!message.threadRootMessageId && (message.threadReplyCount ?? 0) > 0 && (
                    <button
                        onClick={() => openThread(message._id)}
                        className="flex items-center gap-2 mt-1.5 text-xs text-brand-lightBlue font-semibold hover:underline"
                    >
                        <MessageSquare size={13} />
                        {message.threadReplyCount} {message.threadReplyCount === 1 ? "reply" : "replies"}
                    </button>
                )}
            </div>

            {/* Hover actions toolbar */}
            {showActions && !message.isDeleted && (
                <div className="absolute right-4 -top-3 flex items-center gap-0.5 bg-white border-2 border-brand-blue/10 rounded-tl-xl rounded-br-xl shadow-[2px_2px_0px_0px_rgba(10,22,48,0.08)] px-1 py-0.5 z-10">
                    <div className="relative">
                        <ActionBtn title="Add reaction" onClick={() => setShowEmojiPicker((v) => !v)}>
                            <Smile size={14} />
                        </ActionBtn>
                        {showEmojiPicker && (
                            <div className="absolute right-0 bottom-full mb-1">
                                <EmojiPicker
                                    onSelect={handleReaction}
                                    onClose={() => setShowEmojiPicker(false)}
                                />
                            </div>
                        )}
                    </div>
                    <ActionBtn title="Reply in thread" onClick={() => openThread(message._id)}>
                        <MessageSquare size={14} />
                    </ActionBtn>
                    <ActionBtn title="Pin message" onClick={handlePin}>
                        <Pin size={14} />
                    </ActionBtn>
                    <ActionBtn title="Bookmark for me" onClick={handleBookmark}>
                        <Bookmark size={14} />
                    </ActionBtn>
                    {isOwn && (
                        <ActionBtn title="Edit message" onClick={() => { setIsEditing(true); setShowActions(false); }}>
                            <Pencil size={14} />
                        </ActionBtn>
                    )}
                    {user?.role && isManager(user.role) && (
                        <ActionBtn title="Move to channel" onClick={() => { setShowMoveModal(true); setShowActions(false); }}>
                            <MoveRight size={14} />
                        </ActionBtn>
                    )}
                    {(isOwn || (user?.role && isManager(user.role))) && (
                        <ActionBtn title="Delete" onClick={handleDelete} danger>
                            <Trash2 size={14} />
                        </ActionBtn>
                    )}
                </div>
            )}

            {showMoveModal && (
                <MoveMessageModal
                    messageId={message._id}
                    currentChannelId={message.channelId}
                    onClose={() => setShowMoveModal(false)}
                />
            )}
        </div>
    );
}

function ActionBtn({
    children,
    title,
    onClick,
    danger = false,
}: {
    children: React.ReactNode;
    title: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            title={title}
            onClick={onClick}
            className={`p-1.5 rounded-tl-lg rounded-br-lg transition-colors ${
                danger
                    ? "text-brand-wine/60 hover:bg-brand-wine/10 hover:text-brand-wine"
                    : "text-brand-blue/40 hover:bg-brand-bgLight hover:text-brand-blue"
            }`}
        >
            {children}
        </button>
    );
}
