import type { Id } from "../../../convex/_generated/dataModel";

export type ChanType = "channel" | "subchannel" | "group" | "sidechat" | "private";

export interface FlatChannel {
    _id: Id<"chatChannels">;
    name: string;
    type: string;
    parentId?: Id<"chatChannels">;
    description?: string;
    topic?: string;
    sortOrder: number;
    isPrivate?: boolean;
    isArchived?: boolean;
}

export interface TreeChannel extends FlatChannel {
    children: TreeChannel[];
}

export interface DMChannel {
    _id: Id<"chatChannels">;
    name: string;
    type: string;
    participants: Array<{ _id: Id<"users">; name: string; profileChip?: string | null }>;
    lastMessage: { bodyPlainText: string; _creationTime: number; authorId: Id<"users"> } | null;
    myMembership: { lastReadTimestamp?: number; lastReadMessageId?: Id<"chatMessages"> };
}

export interface EnrichedMessage {
    _id: Id<"chatMessages">;
    _creationTime: number;
    channelId: Id<"chatChannels">;
    authorId: Id<"users">;
    body: string;
    bodyPlainText: string;
    author: { _id: Id<"users">; name: string; role: string; profileChip?: string } | null;
    reactions: Array<{ emoji: string; userIds: string[]; count: number }>;
    poll: { _id: Id<"chatPolls">; question: string; options: Array<{ id: string; text: string }> } | null;
    attachments?: Array<{
        storageId: Id<"_storage">;
        filename: string;
        mimeType: string;
        size: number;
        url: string;
    }>;
    isDeleted?: boolean;
    isEdited?: boolean;
    isPinned?: boolean;
    isSystem?: boolean;
    systemType?: string;
    threadRootMessageId?: Id<"chatMessages">;
    threadReplyCount?: number;
    threadLastReplyAt?: number;
}

export type DisplayEntry =
    | { kind: "divider"; key: string; label: string }
    | { kind: "message"; key: string; msg: EnrichedMessage; compact: boolean };
