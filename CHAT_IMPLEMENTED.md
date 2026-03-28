# Chat Backend Capability Snapshot

This is a backend-only summary of what is already implemented in Convex for chat.

## Data Model Already In Place

Core tables are present in `convex/schema.ts`:
- `chatChannels`: hierarchical channels, sidechats, 1:1 DMs, group DMs.
- `chatChannelMembers`: membership, per-user notification level, read markers.
- `chatChannelPermissions`: per-channel send/manage/read_only targeting user, role, or special role.
- `chatMessages`: rich body + plain text, threads, attachments, mentions, edit/delete/pin/system metadata.
- `chatReactions`, `chatPolls`, `chatPollVotes`, `chatMessageMoves`.
- `chatTypingIndicators`, `chatBookmarks`, `chatNotifications`.

## Implemented Backend Features

### Channels and Structure
From `convex/chatChannels.ts`:
- List top-level channels and child channels.
- Fetch single channel with member count.
- Build full nested channel tree.
- Create channel/subchannel/group/sidechat with role guards.
- Update channel metadata (name, description, topic, icon).
- Archive channels.
- Reorder channels.
- Topic changes write system messages.

### Membership and Read State
From `convex/chatMembers.ts`:
- List channel members with user metadata.
- Fetch my membership per channel.
- Join and leave channel (owner leave prevented).
- Invite user to channel (staff-gated).
- Mark as read with last read timestamp/message tracking.
- Per-channel notification preference (`all`, `mentions`, `none`).
- Unread count calculation across joined channels.
- Auto-join behavior on first read when user has no membership.

### Messaging
From `convex/chatMessages.ts`:
- Paginated message listing by channel.
- Author enrichment and grouped reactions in response.
- Attachment URL hydration via storage.
- Send message with optional thread root, attachments, and mentions.
- Edit own message with edit history.
- Soft-delete message (author or manager), including storage cleanup.
- Pin/unpin message (staff-gated).
- Move message across channels with audit record + system trail.
- List pinned messages.
- Naive text search (channel-scoped or global).
- Mention notification inbox + mark-as-read.
- `canSendInChannel` permission check endpoint.
- Generate upload URL for message attachments.

### Threads
From `convex/chatThreads.ts`:
- Paginated thread replies.
- Fetch enriched root message.
- Thread counters (`threadReplyCount`, `threadLastReplyAt`) maintained on send/poll create.

### Reactions
From `convex/chatReactions.ts`:
- Emoji reaction toggle per user/message.

### Polls
From `convex/chatPolls.ts`:
- Create poll as a message-backed entity.
- Vote toggle logic for single-vote and multi-vote polls.
- Poll close operation.
- Poll aggregation endpoint with vote counts + current user votes.

### Typing Indicators
From `convex/chatTyping.ts` and `convex/crons.ts`:
- Set/refresh typing indicator with expiry.
- Clear typing indicator.
- Query active typers.
- Scheduled cleanup every 10 seconds via cron.

### Direct Messages
From `convex/chatDirectMessages.ts`:
- List all DMs/group DMs for current user with participants and last message.
- Get-or-create 1:1 DM (deduplicated by `dmKey`).
- Create group DM.
- Add participant to group DM.
- Leave group DM.

### Bookmarks
From `convex/chatBookmarks.ts`:
- List personal bookmarks with message/channel/author context.
- Add bookmark (toggle behavior when existing).
- Remove bookmark.
- Update bookmark note.

### Permissions and Access Control
From `convex/chatPermissions.ts` and `convex/chatMessages.ts`:
- Channel permission rules can be created/updated/removed.
- Targets supported: specific user, role, special role.
- Permission types supported in schema: `send`, `manage`, `read_only`.
- Current send-path enforcement supports `read_only` deny and `send` allow-list behavior.
- Base auth/rbac utilities are shared via `convex/accessControl.ts`.

## What Is Prepared But Not Fully Realized

Backend schema and modules suggest additional capability is planned:
- `chatMessages.urlPreviews` exists in schema but is not populated in message mutations.
- `chatChannelPermissions.permission = manage` exists but is not enforced in a dedicated channel-manage policy path.
- Notification preferences (`all/mentions/none`) are stored, but mention notification writes do not currently branch on this preference.
- Search is implemented as scan/filter and does not use a dedicated search index.

## Practical Conclusion

Backend capabilities are already broad enough for a full Slack-like core:
- channels + DMs + group DMs
- messages + attachments + threads + reactions + polls
- mentions + notifications + bookmarks
- typing + read state + unread counts
- moderation controls (pin/move/delete/archive)
- role/permission primitives

A UI refactor can proceed without backend blockers for most standard chat behavior.
