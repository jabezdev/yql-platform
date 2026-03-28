# Chat Backend Roadmap (Post-UI-Refactor)

Backend-only focus: easy wins + medium-effort high-value features planned for next release cycles.

## 1) Channel Loading Performance

Why:
- Startup load visible when many channels exist; tree building is O(n²).

Add functions:
- `chatChannels.listTopLevelChannels()` already paginated; add cursor support if >50 channels.
- `chatChannels.getChannelTree()` add lazy-load option: return flat list + parent pointers instead of nested tree on first load.
- Index optimization: ensure `by_type` + `by_parentId` indexes are used efficiently.
- Caching strategy: memoize channel tree client-side until channel mutation occurs.

## 2) Private and Gated Channels (Simple Access Model)

Why:
- All channels currently defaulted to open; need simple privacy for leadership/team channels.
- Avoid complex role matrix at first.

Add fields to `chatChannels` schema:
- `isPrivate: boolean` (default false) — only owners/invited members can see/join.
- `requiresApproval: boolean` (default false) — join requests queue for owner approval.

Add functions:
- `chatChannels.createPrivateChannel(...)` mutation with `isPrivate=true`.
- `chatMembers.requestJoinChannel(channelId)` mutation (creates request record if `requiresApproval`).
- `chatMembers.approveJoinRequest(requestId)` / `rejectJoinRequest(requestId)` mutations (owner-gated).
- `chatChannels.listJoinRequests(channelId)` query.
- Query filters already apply access checks implicitly (non-members don't see private channels).

## 3) Notification Pipeline and Unread State

Why:
- Notification preference is stored but not fully applied; no unified unread inbox.
- Need scalable mention/relevant-message delivery without expensive scans.

Add functions:
- `chatNotifications.listUnread({ cursor, channelId?, includeContext })` paginated query (unread mentions + watched threads).
- `chatNotifications.markAsRead(notificationId)` / `markAllAsRead(channelId?)` mutations.
- `chatMessages.computeMentionRecipients(channelId, mentions)` internal helper honoring `notificationLevel` preference.
- `chatMessages.queueNotification(recipients[], messageId, channelId)` internal mutation (called after send).
- Add table `chatNotificationPreferences` with external delivery placeholders:
  - `emailDigestFrequency: 'never' | 'daily' | 'weekly'`
  - `pushNotificationsEnabled: boolean`
  - External function stubs: `sendEmailDigest()`, `sendPushNotification()` (action wrappers, unimplemented for now).

## 4) Search with Reasonable Costs

Why:
- Current search is collection scan + text include; doesn't scale.
- DB is empty now, so invest in preprocessing wisdom early.

Add functions:
- Store `searchTokens: string[]` on each message (split + stem on send, e.g., `['hello', 'world', 'msg']`).
- `chatMessages.sendMessageWithTokens(...)` mutation that pre-computes tokens at insert time.
- `chatMessages.searchMessages({ channelId?, tokens, cursor })` query filtering on pre-computed tokens (fast).
- `chatMessages.listAroundMessage(messageId, before, after)` query for jump-to-result UX.
- Optional: add materialized `chatSearchIndex` table (channel + date + tokens) if per-channel search becomes slow later.

## 5) Rich Content Pipeline (Links, Previews, Media)

Why:
- Schema already has `urlPreviews`, but message send/edit does not populate it.

Add functions:
- `chatMessages.extractAndAttachPreviews(messageId, body)` action that scrapes OG tags, title, description, image.
- `chatMessages.sendMessageV2(...)` mutation calling preview extraction async after send.
- Update `listMessages` to return hydrated previews automatically.
- Store media metadata in a separate `chatMediaItems` table for gallery indexing (see feature 8b below).

## 6) Thread Management and Subscriptions

Why:
- Threading exists; thread subscriptions and unread state are not explicit.

Add functions:
- `chatThreads.subscribe(rootMessageId)` / `chatThreads.unsubscribe(rootMessageId)` mutations.
- `chatThreads.markThreadRead(rootMessageId, lastReplyId?)` mutation.
- `chatThreads.listMyUnreadThreads(channelId?)` query.
- Add table `chatThreadSubscriptions` tracking watched threads per user.

## 7) Moderation and User Safety (Simple)

Why:
- Basic deletion/pin/move exists; add lightweight enforcement for safety.

Add functions:
- Add fields to `chatChannelMembers`:
  - `isMuted: boolean` (already exists; msg send rejection)
  - `isHidden: boolean` (new; user cannot see/post in channel, invisible to others)
  - `softBanUntil: number?` (new; temporary mute, unix timestamp)
- `chatMembers.hideUserFromChannel(channelId, userId, duration?)` mutation (sets `isHidden` + optional `softBanUntil`).
- `chatMembers.unmuteUser(channelId, userId)` mutation.
- `chatMessages.bulkModerate({ messageIds, action: 'delete'|'hide', reason })` mutation.
- `chatAudit.logAction(type, actor, target, channelId?, reason?)` internal mutation.
- `chatAudit.listEvents({ channelId?, type?, cursor })` query for moderation history.

## 8) Message Read State and Seen Indicators

Why:
- Last read timestamp exists, but need last seen / read-receipt indicators.
- Distinguish between "read" (user opened) and "seen" (briefly viewed).

Add fields to `chatChannelMembers`:
- `lastSeenAt: number?` (timestamp user last appeared in channel, even without marking read)
- `lastSeenMessageId: id?` (last message user scrolled past)

Add functions:
- `chatMembers.recordSeen(channelId)` mutation (called on channel open, updates `lastSeenAt`).
- `chatMembers.markChannelUnread(channelId)` mutation (user can manually re-mark as unread).
- Include `lastSeenAt`, `lastReadAt` in member presence for UI (e.g., "reader 🔵 is reading").

## 9) Rate Limiting and Abuse Prevention

Why:
- Chat systems need anti-spam by default; should support both global and per-channel limits.

Add table `chatRateLimits`:
- `userId, channelId?, messageType, limit, windowMs, createdAt`

Add functions:
- `chatMessages.checkRateLimit(userId, channelId, messageType)` query returning remaining quota.
- `chatMessages.sendMessageWithRateLimit(...)` mutation enforcing limits before send.
  - Default: 5 messages per 10 seconds per user globally; 2 per 5 sec in single channel.
  - Exceptions: staff (no limit) or per-channel override.
- `chatMessages.validateAttachmentPolicy(...)` helper (mime types, max size, count per message).
- `chatAbuse.reportMessage(messageId, reason)` mutation for user-flagged content.

## 10) Backend Architecture Refactor

For maintainability during UI rewrite, organize shared logic in helpers:
- `convex/chat/lib/access.ts` — channel visibility + membership checks.
- `convex/chat/lib/permissions.ts` — private/gated channel logic.
- `convex/chat/lib/notifications.ts` — mention recipient calculation + preference filtering.
- `convex/chat/lib/enrich.ts` — message enrichment (author/reactions/polls/previews/media).
- `convex/chat/lib/rateLimit.ts` — quota checks and enforcement.
- `convex/chat/lib/moderation.ts` — hide/mute/softban checks and audit writes.

This consolidates logic currently spread across chat modules, reduces duplication, and eases future refactors.

---

## New Feature: Scheduled Messages

Why:
- Send important messages at the right time; useful for announcements, reminders, DM follow-ups.

Add table `chatScheduledMessages`:
- `channelId, authorId, body, bodyPlainText, mentions, attachments, sendAt, status ('queued'|'sent'|'cancelled')`

Add functions:
- `chatMessages.scheduleMessage({ channelId, body, sendAt })` mutation.
- `chatMessages.updateScheduledMessage(id, updates)` mutation (before send time).
- `chatMessages.cancelScheduledMessage(id)` mutation.
- `chatMessages.listMyScheduledMessages()` query.
- Cron job `scheduleduler.sendDueMessages()` runs every 1 minute, queries `sendAt <= now` and sends via `sendMessage`.

---

## New Feature: Silent Messages (/silent)

Why:
- Send a message without notifying (useful for non-urgent updates, late-night work, info-only messages).

Add field to `chatMessages`:
- `isSilent: boolean` (default false)

Add functions:
- `chatMessages.sendSilentMessage({ channelId, body, ...rest })` mutation (sets `isSilent=true`).
- Skip notification generation if `isSilent=true` in `computeMentionRecipients()`.
- UI shows visual indicator (e.g., 🔇) on silent message so readers know it wasn't a mention.
- Can be combined with mentions: `/silent @alice` (message visible but no notification).

---

## New Feature: Media Gallery

Why:
- Refer to images, videos, links easily; build searchable media timeline per channel.

Add table `chatMediaItems`:
- `messageId, channelId, type ('image'|'video'|'link'|'file'), url, title, description, previewUrl, uploadedBy, uploadedAt`

Add functions:
- Populate `chatMediaItems` during message enrichment (extract from attachments + urlPreviews).
- `chatMedia.listChannelMedia({ channelId, type?, cursor })` query (scrollable gallery).
- `chatMedia.searchMedia({ channelId?, text, type?, cursor })` query (find by filename, URL, description).
- `chatMedia.getMediaContext(mediaItemId)` query (return source message + channel).

---

## New Feature: Groups and Mentions (@marketing, @everyone, @channel, @here)

Why:
- Tag team groups for efficient messaging (@marketing, @sales); @-mentions for scope boundaries.
- Groups are platform-wide roles/tags (e.g., 'marketing', 'engineering', 'leadership'), not chat-specific.
- Support: @group (all members), @everyone (org-wide), @channel (recent chatters), @here (currently active).

Groups are user-level tags (managed in user profile/admin panel):
- Users can belong to multiple groups/departments (e.g., user has tags: ['marketing', 'leaders']).
- Groups managed via `users.updateUserGroups(userId, groupIds)` or admin bulk-assign.
- Stored on `users` table as `groupIds: [id]?` or `groupTags: [string]?`.

Add field to `chatMessages.mentions`:
- `groupIds: [id]?` or `groupNames: [string]?` (in addition to userIds, roles, specialRoles)

Add functions:
- `chatMessages.computeMentionRecipients()` updated to resolve group mentions:
  - `@marketing` → all users with 'marketing' group tag.
  - `@everyone` → all users in org (limit notification if > threshold, e.g., > 100 users → pinned instead).
  - `@channel` → users with lastSeenAt in channel within last 7 days.
  - `@here` → users with lastSeenAt in channel within last 5 minutes.
- Search user groups by name in message composer for autocomplete (pull from `users.groupIds`).
- No separate `chatGroups` table needed; reuse existing org/user structure.

---

## Implementation Priority Order

### Phase 1 (Easy, High ROI)
1. Channel load performance (lazy tree, pagination).
2. Private/gated channels (isPrivate, requiresApproval fields).
3. Silent messages (/silent flag).
4. Read state polish (lastSeenAt, markChannelUnread).

### Phase 2 (Medium, High Value)
5. Notification pipeline (unread inbox, external delivery placeholders).
6. Search with tokens (no expensive scan).
7. Rich content previews (urlPreviews hydration).
8. Rate limiting (per-user, per-channel).
9. Moderation helpers (hide/mute/softban, audit log).

### Phase 3 (Medium, Expansion)
10. Scheduled messages (cron-based send).
11. Thread subscriptions (unread thread inbox).
12. Groups and mentions (@group, @everyone, @channel, @here).
13. Media gallery (searchable image/video/link timeline).

### Phase 4 (Future, TBD Scope)
14. Backend refactor (consolidate helpers as usage patterns crystallize).

This phasing minimizes dependencies and ensures each phase delivers tangible user value.
