import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

/**
 * Returns a map of channelId → unread message count for all channels
 * the current user is a member of.
 */
export function useUnreadCounts(): Record<string, number> {
    const counts = useQuery(api.chatMembers.getUnreadCounts);
    return counts ?? {};
}

/**
 * Returns the unread message count for a specific channel.
 */
export function useChannelUnread(channelId: Id<"chatChannels"> | null): number {
    const counts = useUnreadCounts();
    if (!channelId) return 0;
    return counts[channelId] ?? 0;
}
