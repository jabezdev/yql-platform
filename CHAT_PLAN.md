# Chat System Implementation Plan

## Overview

Full-featured chat system at `/chat` with its own layout, independent from the workspace dashboard. Built on Convex (real-time by default), React, TipTap, and Clerk auth.

---

## 1. Channel Hierarchy (5 Levels)

```
Channel (type: "channel", parentId: null)
  └─ Sub-Channel (type: "subchannel", parentId: channelId)
       └─ Group (type: "group", parentId: subchannelId)
            └─ Sidechat (type: "sidechat", parentId: any above)
                 └─ Thread (threadRootMessageId on chatMessages — NOT a channel)
```

- **Channels, Sub-Channels, Groups**: Created by T3+ (managers/admins)
- **Sidechats**: Lightweight branches, created by any staff (T5+)
- **Threads**: Inline reply chains on any message. Available in both channels AND DMs.

### DMs
- **Direct (dm)**: 1-on-1, deduplicated via `dmKey` (sorted user IDs)
- **Group DM (group_dm)**: 3+ participants
- Threads are enabled in DMs

---

## 2. Schema (10 New Tables)

### `chatChannels`
Unified container for all channel types + DMs.

| Field | Type | Notes |
|-------|------|-------|
| name | string | |
| description | string? | |
| type | "channel" \| "subchannel" \| "group" \| "sidechat" \| "dm" \| "group_dm" | |
| parentId | id("chatChannels")? | null for top-level + DMs |
| createdBy | id("users") | |
| isArchived | boolean | Soft archive → read-only, hidden from sidebar |
| dmKey | string? | Sorted participant IDs for DM dedup |
| sortOrder | number | For drag-and-drop reordering |
| icon | string? | Emoji/icon for channel |
| topic | string? | One-liner in channel header |

Indexes: `by_type`, `by_parentId`, `by_dmKey`, `by_type_archived`

### `chatChannelMembers`
Membership, read tracking, notification prefs.

| Field | Type | Notes |
|-------|------|-------|
| channelId | id("chatChannels") | |
| userId | id("users") | |
| joinedAt | number | |
| role | "owner" \| "admin" \| "member" | Per-channel role |
| isMuted | boolean | |
| lastReadMessageId | id("chatMessages")? | For unread counts |
| lastReadTimestamp | number? | For unread counts |
| notificationLevel | "all" \| "mentions" \| "none"? | Per-channel override |

Indexes: `by_channelId`, `by_userId`, `by_channel_user`

### `chatChannelPermissions`
Granular send/manage/read-only rules.

| Field | Type | Notes |
|-------|------|-------|
| channelId | id("chatChannels") | |
| targetUserId | id("users")? | Exactly one of user/role/specialRole is set |
| targetRole | string? | e.g. "T3", "Applicant" |
| targetSpecialRole | string? | e.g. "Evaluator", "Alumni" |
| permission | "send" \| "manage" \| "read_only" | |
| grantedBy | id("users") | |

**Default policy** (when no permission rows exist):
- Everyone can READ (transparency requirement)
- T5+ can SEND
- T3+ can MANAGE

Indexes: `by_channelId`, `by_targetUserId`, `by_targetRole`

### `chatMessages`
Messages with rich content, thread support, soft delete.

| Field | Type | Notes |
|-------|------|-------|
| channelId | id("chatChannels") | |
| authorId | id("users") | |
| body | string | TipTap JSON |
| bodyPlainText | string | Plain text extraction for search |
| threadRootMessageId | id("chatMessages")? | If set, this is a thread reply |
| threadReplyCount | number? | Denormalized on root message |
| threadLastReplyAt | number? | Denormalized on root message |
| attachments | array? | `{ storageId, filename, mimeType, size }` |
| urlPreviews | array? | `{ url, title, description, imageUrl, siteName }` |
| mentions | object? | `{ userIds?, roles?, specialRoles?, everyone? }` |
| isEdited | boolean | |
| editedAt | number? | |
| isDeleted | boolean | Soft delete — shows "This message was deleted" |
| deletedAt | number? | |
| deletedBy | id("users")? | |
| isPinned | boolean | |
| pinnedAt | number? | |
| pinnedBy | id("users")? | |
| isSystem | boolean? | Auto-generated messages |
| systemType | string? | "topic_changed", "message_moved_out", "member_joined", etc. |

Indexes: `by_channelId`, `by_threadRootMessageId`, `by_authorId`, `by_channelId_isPinned`

### `chatReactions`
Emoji reactions per message per user.

| Field | Type |
|-------|------|
| messageId | id("chatMessages") |
| userId | id("users") |
| emoji | string |

Indexes: `by_messageId`, `by_messageId_emoji`, `by_userId_messageId`

### `chatPolls` / `chatPollVotes`
Polls attached to messages.

**chatPolls:**

| Field | Type |
|-------|------|
| messageId | id("chatMessages") |
| channelId | id("chatChannels") |
| question | string |
| options | array of `{ id, text }` |
| allowMultipleVotes | boolean |
| isAnonymous | boolean |
| closedAt | number? |
| createdBy | id("users") |

**chatPollVotes:**

| Field | Type |
|-------|------|
| pollId | id("chatPolls") |
| userId | id("users") |
| optionId | string |

### `chatMessageMoves`
Audit trail for message moves.

| Field | Type |
|-------|------|
| messageId | id("chatMessages") |
| fromChannelId | id("chatChannels") |
| toChannelId | id("chatChannels") |
| movedBy | id("users") |
| movedAt | number |
| reason | string? |

### `chatTypingIndicators`
Ephemeral typing state, cleaned by cron every 10s.

| Field | Type |
|-------|------|
| channelId | id("chatChannels") |
| userId | id("users") |
| expiresAt | number |

### `chatBookmarks`
"Bookmark for me" — personal saved messages.

| Field | Type |
|-------|------|
| userId | id("users") |
| messageId | id("chatMessages") |
| note | string? |

---

## 3. Access Control Model

1. **Everyone can SEE all channels** (transparency — no friction to join conversations)
2. **Send permission** checked via `chatChannelPermissions`:
   - If a `read_only` rule matches user → deny
   - If explicit `send` grants exist → user must match one
   - If no rules exist → fall back to default (T5+ can send)
3. **Manage permission** (pin, delete others' messages, edit channel):
   - Explicit `manage` grant, or T3+ by default
4. **Channel creation**: T3+ for channels/subchannels/groups, T5+ for sidechats
5. **DMs**: Any authenticated user can DM any other user

---

## 4. Features Checklist

### Core (from user requirements)
- [x] `/chat` route with dedicated layout (not workspace)
- [x] Sidebar with Channels and Direct tabs (Channels done; Direct tab UI done Phase 2 — integration pending)
- [x] Channel hierarchy: Channel → Sub-Channel → Group → Sidechat (schema + backend done; tree UI in Phase 1 sidebar)
- [x] Thread UI — ThreadPanel + ThreadMessageList + ThreadComposer (Phase 4)
- [x] DMs (1-on-1 and group) — chatDirectMessages.ts + DMList + DMListItem (Phase 2)
- [x] Threads in DMs (Phase 4 — thread works on any channelId including DMs)
- [x] Message moving between channels (MoveMessageModal + moveMessage backend)
- [x] Images and file attachments (staged upload, preview strip, resolved storage URLs)
- [x] Emoji picker — EmojiPicker.tsx, 24-emoji grid (Phase 5)
- [x] Reactions on messages — chatReactions.ts + toggleReaction + reaction chips (Phase 5)
- [x] URL auto-linking + UrlPreviewCard rendered when urlPreviews populated (Phase 7)
- [x] Text styling via TipTap (bold, italic, code, lists in composer)
- [x] Polls — chatPolls.ts + PollComposer + PollDisplay + PollResultsBar (Phase 6)
- [x] Comprehensive access control — send/manage/read-only per user/role/specialRole (fully working)
- [x] @mention autocomplete with MentionSuggestion.tsx; mentions render as blue chips (Phase 5)

### Additional 14 Features
- [x] **Typing indicators** — chatTyping.ts + useTypingIndicator hook + TypingIndicator.tsx (Phase 7)
- [x] **Unread counts + read tracking** — `lastReadTimestamp` + `getUnreadCounts` working; badges in sidebar
- [x] **Pinned messages** — pin/unpin done in backend + hover action; panel Phase 7
- [x] **"Bookmark for me"** — full backend done (add/remove/toggle/note); panel Phase 9
- [x] **Message search** — `searchMessages` query working; panel Phase 7
- [x] **System messages** — auto-generated for joins, adds, moves, pins, topic changes
- [x] **Message move audit trail** — `chatMessageMoves` table + populated in `moveMessage`
- [x] **Notification preferences per channel** — `updateNotificationPreference` mutation done
- [x] **Channel topics** — stored, displayed in header, system message on change
- [x] **Soft delete** — "This message was deleted" renders; `isDeleted`/`deletedBy` stored
- [x] **DM deduplication** — `dmKey` index + logic in `getOrCreateDM`
- [x] **Channel archival** — `archiveChannel` mutation done; archived channels filtered from tree
- [x] **URL previews** — UrlPreviewCard.tsx + Link extension in composer (Phase 7)
- [x] **Date dividers** — `DateDivider` component rendering between message groups

---

## 5. Convex Backend Files

All files flat in `convex/` to match existing convention.

| File | Purpose | Key Functions |
|------|---------|---------------|
| `chatChannels.ts` | Channel CRUD, hierarchy, tree query | `getChannelTree`, `createChannel`, `updateChannel`, `archiveChannel`, `reorderChannels` |
| `chatMessages.ts` | Message CRUD, search, pin, move | `listMessages` (paginated), `sendMessage`, `editMessage`, `deleteMessage`, `pinMessage`, `moveMessage`, `searchMessages`, `canSendInChannel`, `generateUploadUrl` |
| `chatDirectMessages.ts` | DM-specific logic | `getOrCreateDM`, `createGroupDM`, `listMyDMs`, `addParticipant`, `leaveGroupDM` |
| `chatThreads.ts` | Thread queries | `listThreadReplies`, `listActiveThreads` |
| `chatReactions.ts` | Emoji reactions | `addReaction`, `removeReaction` |
| `chatPolls.ts` | Poll system | `createPoll`, `vote`, `closePoll`, `getPollResults` |
| `chatMembers.ts` | Membership, read tracking, unread | `joinChannel`, `leaveChannel`, `listMembers`, `markAsRead`, `getUnreadCounts`, `updateNotificationPreference` |
| `chatPermissions.ts` | Channel permission rules | `getChannelPermissions`, `setPermission`, `removePermission` |
| `chatTyping.ts` | Typing indicators | `setTyping`, `clearTyping`, `getTyping`, `cleanupExpired` (cron) |
| `chatBookmarks.ts` | "Bookmark for me" | `addBookmark`, `removeBookmark`, `listBookmarks` |

---

## 6. Frontend Architecture

### Layout (3-panel)

```
┌──────────────────────────────────────────────────────────────┐
│ [← Back to Workspace]           [Channel Name]   [icons]    │  ← thin header
├──────────┬───────────────────────────────┬───────────────────┤
│          │                               │                   │
│ Sidebar  │    Conversation View          │  Right Panel      │
│ 280px    │    (flex-1)                   │  (optional 360px) │
│          │                               │  Thread/Members/  │
│ Channels │    MessageList                │  Search/Pins/     │
│ DMs      │    + Composer                 │  Settings/        │
│          │                               │  Bookmarks        │
│          │                               │                   │
└──────────┴───────────────────────────────┴───────────────────┘
```

### File Structure

```
src/core/
├── layouts/
│   └── ChatLayout.tsx
├── pages/
│   └── ChatPage.tsx
├── providers/
│   └── ChatProvider.tsx               # Context: selected channel, open panels, thread state
├── hooks/
│   ├── useChat.ts                     # Shorthand for ChatProvider context
│   ├── useChatPermissions.ts          # Wraps canSendInChannel query
│   ├── useUnreadCounts.ts             # Subscribe to unread counts
│   └── useTypingIndicator.ts          # Debounced typing mutation
├── constants/
│   └── chat.ts                        # Channel type labels, system message types
└── components/
    └── chat/
        ├── sidebar/
        │   ├── ChatSidebar.tsx         # Tabs (Channels / Direct), search, channel list
        │   ├── ChannelTree.tsx         # Nested collapsible channel tree
        │   ├── ChannelTreeItem.tsx     # Single tree node with expand/collapse
        │   ├── DMList.tsx              # DM conversations list
        │   ├── DMListItem.tsx          # Single DM row (avatar, name, unread badge)
        │   ├── CreateChannelModal.tsx  # Create channel/subchannel/group/sidechat
        │   └── ChannelSearch.tsx       # Quick-filter within sidebar
        ├── conversation/
        │   ├── ConversationView.tsx    # Header + messages + composer
        │   ├── ConversationHeader.tsx  # Channel name, topic, member count, action icons
        │   ├── MessageList.tsx         # Paginated message list with date dividers
        │   ├── MessageItem.tsx         # Single message (avatar, body, reactions, thread preview)
        │   ├── MessageActions.tsx      # Hover toolbar (react, reply, pin, bookmark, move, delete)
        │   ├── MessageBody.tsx         # Renders TipTap JSON to read-only HTML
        │   ├── SystemMessage.tsx       # Renders system messages (joins, moves, pins)
        │   ├── ThreadPreview.tsx       # "N replies" bar below a message
        │   ├── TypingIndicator.tsx     # "X is typing..." bar
        │   └── DateDivider.tsx         # "March 20, 2026" separator
        ├── composer/
        │   ├── MessageComposer.tsx     # TipTap editor + toolbar + send
        │   ├── MentionSuggestion.tsx   # @mention autocomplete dropdown
        │   ├── EmojiPicker.tsx         # Emoji selection popover
        │   ├── AttachmentPreview.tsx   # File upload preview strip
        │   └── PollComposer.tsx        # Inline poll creation form
        ├── thread/
        │   ├── ThreadPanel.tsx         # Right-side panel for thread view
        │   ├── ThreadMessageList.tsx   # Messages within thread
        │   └── ThreadComposer.tsx      # Composer scoped to thread
        ├── panels/
        │   ├── MemberPanel.tsx         # Channel members list
        │   ├── PinnedPanel.tsx         # Pinned messages
        │   ├── SearchPanel.tsx         # Message search results
        │   ├── BookmarksPanel.tsx      # "Bookmark for me" list
        │   └── ChannelSettingsPanel.tsx# Settings, permissions, archive
        ├── poll/
        │   ├── PollDisplay.tsx         # Poll rendered in a message
        │   └── PollResultsBar.tsx      # Single option vote bar
        ├── shared/
        │   ├── UserAvatar.tsx          # Avatar component
        │   ├── UnreadBadge.tsx         # Red dot / count
        │   ├── MentionBadge.tsx        # @mention highlight chip
        │   └── UrlPreviewCard.tsx      # Link preview embed
        └── modals/
            ├── MoveMessageModal.tsx    # Channel picker for moving messages
            ├── ChannelPermissionsModal.tsx  # Manage permissions
            └── InviteMembersModal.tsx  # Add users to channel/DM
```

### Routing

```tsx
// In App.tsx
<Route path="/chat" element={<Authenticated><RoleGuard minRole="T5"><ChatPage /></RoleGuard></Authenticated>}>
    <Route index element={<ConversationView />} />                     {/* /chat — landing */}
    <Route path=":channelId" element={<ConversationView />} />         {/* /chat/:id */}
    <Route path=":channelId/thread/:messageId" element={<ConversationView />} /> {/* thread deep link */}
</Route>
```

Navigation item added to `navigation.ts` under WORKSPACE group.

### New npm Dependencies
- `@tiptap/extension-mention` — @mention autocomplete
- `@tiptap/extension-image` — inline image embeds
- `@tiptap/extension-link` — auto-link URLs on paste
- `emoji-mart` — emoji picker UI (or lightweight alternative)

---

## 7. Implementation Phases

### Phase 1: Foundation — Schema + Core Messaging + Layout ✅ COMPLETE (verified build ✓)
**Files created/modified:**
- [x] `convex/schema.ts` — 10 chat tables added with all indexes
- [x] `convex/chatChannels.ts` — `listTopLevelChannels`, `listChildren`, `getChannel`, `getChannelTree`, `createChannel`, `updateChannel`, `archiveChannel`, `reorderChannels`
- [x] `convex/chatMessages.ts` — `listMessages` (paginated), `sendMessage`, `editMessage`, `deleteMessage`, `pinMessage`, `moveMessage`, `searchMessages`, `canSendInChannel`, `generateUploadUrl`
- [x] `convex/chatMembers.ts` — `listMembers`, `getMyMembership`, `getUnreadCounts`, `joinChannel`, `leaveChannel`, `markAsRead`, `updateNotificationPreference`, `inviteToChannel`
- [x] `convex/chatPermissions.ts` — `getChannelPermissions`, `setPermission`, `removePermission`
- [x] `convex/chatBookmarks.ts` — `addBookmark` (toggle), `removeBookmark`, `listBookmarks`, `updateBookmarkNote`
- [x] `src/core/providers/ChatProvider.tsx` — context for activeChannelId, rightPanel, thread state, sidebarTab
- [x] `src/core/layouts/ChatLayout.tsx` — 3-panel layout, top bar with back-to-workspace, right panel slots
- [x] `src/core/pages/ChatPage.tsx` — redirects to first channel if none selected
- [x] `src/core/components/chat/sidebar/ChatSidebar.tsx` — Channels/Direct tabs, collapsible nested channel tree, inline channel creator, unread badges
- [x] `src/core/components/chat/conversation/ConversationView.tsx` — reads `:channelId` from URL params, triggers markAsRead
- [x] `src/core/components/chat/conversation/ConversationHeader.tsx` — channel name, topic, member count, right-panel toggle buttons
- [x] `src/core/components/chat/conversation/MessageList.tsx` — paginated (50/page), scroll-up to load more, date dividers, grouped messages (5-min threshold)
- [x] `src/core/components/chat/conversation/MessageItem.tsx` — avatar, grouped display, file attachments, reaction chips, thread reply count, hover action toolbar (pin, bookmark, edit, delete, reply)
- [x] `src/core/components/chat/conversation/MessageBody.tsx` — TipTap JSON read-only renderer, soft-delete fallback text
- [x] `src/core/components/chat/conversation/SystemMessage.tsx` — renders system events with matching icons
- [x] `src/core/components/chat/conversation/DateDivider.tsx` — Today / Yesterday / full date
- [x] `src/core/components/chat/composer/MessageComposer.tsx` — TipTap editor, bold/italic/code/list toolbar, file upload (images + docs), Enter-to-send, read-only guard
- [x] `src/core/components/chat/shared/UserAvatar.tsx` — xs/sm/md/lg sizes, initials fallback
- [x] `src/App.tsx` — `/chat`, `/chat/:channelId`, `/chat/:channelId/thread/:messageId` routes with `Authenticated` + `RoleGuard minRole="T5"`
- [x] `src/core/constants/navigation.ts` — "Chat" item added to WORKSPACE group (T5+, `MessageSquare` icon)

**Known minor lint warnings (non-blocking):**
- `ConversationHeader.tsx`: `Lock` imported from lucide-react but not used
- `MessageItem.tsx`: `useQuery` and `MoveRight` imported but not used

**Result:** `/chat` fully navigable. Channel create/browse/send/edit/delete/pin/move all functional. File upload, grouped messages, date dividers, hover actions, read-only permission enforcement working. `vite build` passes with 0 errors.

### Phase 2: DMs + Read Tracking + Unread Badges ✅ COMPLETE (verified build ✓)
- [x] `convex/chatDirectMessages.ts` — `listMyDMs`, `getOrCreateDM`, `createGroupDM`, `addParticipant`, `leaveGroupDM`
- [x] `src/core/components/chat/sidebar/DMList.tsx` — user picker, DM list with loading skeleton
- [x] `src/core/components/chat/sidebar/DMListItem.tsx` — `<Link to="/chat/:id">` navigation, active state via `useParams`, unread badge, last message preview, time ago
- [x] `src/core/hooks/useUnreadCounts.ts` — `useUnreadCounts()` and `useChannelUnread(channelId)`
- [x] `src/core/components/chat/shared/UnreadBadge.tsx` — count and dot variants
- [x] `DMList` wired into `ChatSidebar.tsx` Direct tab

**Result:** Clicking any DM navigates to `/chat/:channelId`, loads the conversation, marks active state correctly. Group DMs supported. Unread badges on DM items and Direct tab counter.

### Phase 3: Channel Hierarchy (Tree)
- [x] `src/core/components/chat/sidebar/ChannelTree.tsx`
- [x] `src/core/components/chat/sidebar/ChannelTreeItem.tsx`
- [x] `src/core/components/chat/sidebar/CreateChannelModal.tsx`
- [x] `src/core/components/chat/sidebar/ChannelSearch.tsx`

**Result:** Full 5-level hierarchy navigable + collapsible in sidebar.

### Phase 4: Threads (Channels + DMs) ✅ COMPLETE (verified build ✓)
- [x] `convex/chatThreads.ts` — `listThreadReplies` (paginated, asc), `getRootMessage` (enriched with author + storage URLs)
- [x] `src/core/components/chat/thread/ThreadPanel.tsx` — root message preview + reply list + composer
- [x] `src/core/components/chat/thread/ThreadMessageList.tsx` — paginated replies, scroll-to-load, grouping
- [x] `src/core/components/chat/thread/ThreadComposer.tsx` — wrapper around MessageComposer scoped to thread
- [x] `ThreadPreview` already inline in `MessageItem.tsx` ("N replies" bar with `openThread` handler)
- [x] `ChatLayout.tsx` updated: right panel renders `<ThreadPanel>` when `rightPanel === "thread"`

**Bugs fixed in Phases 1–3:**
- `ConversationHeader.tsx`: bookmarks button now uses `Bookmark` icon (was incorrectly using `Search`)
- `MessageComposer.tsx`: attachment-only messages now send proper TipTap JSON in `body` field
- `chatMessages.ts` + `chatThreads.ts`: storage URLs resolved server-side via `ctx.storage.getUrl()`; attachments include `url` field
- `MessageItem.tsx`: image `src` and file `href` now use resolved `att.url` instead of broken `/api/storage/` path

**Result:** Clicking "Reply in thread" on any message opens the right panel with the original message, paginated replies, and a reply composer. Works in channels and DMs. `vite build` passes with 0 errors.

### Phase 5: Reactions + Mentions ✅ COMPLETE (verified build ✓)
- [x] `convex/chatReactions.ts` — `toggleReaction` (add-if-absent / remove-if-present)
- [x] `src/core/components/chat/composer/EmojiPicker.tsx` — lightweight 24-emoji grid, used for reactions AND inline emoji insert
- [x] `src/core/components/chat/composer/MentionSuggestion.tsx` — `createMentionSuggestion(usersRef)` + `MentionList` forwardRef dropdown (keyboard navigable); uses `ReactRenderer` + DOM portal for positioning
- [x] `src/core/components/chat/shared/MentionBadge.tsx` — `@name` chip component
- [x] Installed `@tiptap/extension-mention@3.20.4` + `@tiptap/suggestion@3.20.4`
- [x] `MessageComposer.tsx` updated: Mention extension wired with suggestion, emoji insert button enabled, mention userIds extracted on send, poll toggle button added
- [x] `MessageBody.tsx` updated: Mention extension added for read-only rendering (mentions render as styled chips)
- [x] `MessageItem.tsx` updated: reaction chips now call `toggleReaction`; emoji picker in hover toolbar adds new reactions

**Result:** Clicking existing reaction chip toggles it. 😊 button on hover toolbar opens emoji picker to add new reactions. Typing `@` in composer triggers mention autocomplete. Mentions render as blue chips in sent messages.

### Phase 6: Polls ✅ COMPLETE (verified build ✓)
- [x] `convex/chatPolls.ts` — `createPoll` (creates message + poll atomically), `vote` (single/multi-vote toggle), `closePoll` (creator or T3+), `getPollWithVotes` (live vote counts + user's own votes)
- [x] `src/core/components/chat/composer/PollComposer.tsx` — inline form (question, 2–8 options, multiple/anonymous toggles); shown/hidden via 📊 toolbar button in MessageComposer
- [x] `src/core/components/chat/poll/PollDisplay.tsx` — live-subscribed to `getPollWithVotes`; renders question, option bars, close button for creator/manager
- [x] `src/core/components/chat/poll/PollResultsBar.tsx` — animated percentage fill bar per option with selected-state highlight
- [x] `MessageItem.tsx` updated: renders `<PollDisplay>` when `message.poll` is set (body text suppressed for poll-only messages)
- [x] `MessageComposer.tsx`: 📊 button toggles `PollComposer` above the editor

**Result:** Click 📊 in the composer toolbar to create a poll. Polls appear in-line in the message feed. Clicking an option votes (or unvotes). Single-vote polls replace the previous vote. Closed polls show lock badge and disable voting.

### Phase 7: Rich Features ✅ COMPLETE (verified build ✓)
- [x] `convex/chatTyping.ts` — `setTyping`, `clearTyping`, `getTyping` (excludes caller, filters expired); `cleanupExpired` as `internalMutation`
- [x] `convex/crons.ts` — 10s interval cron targeting `internal.chatTyping.cleanupExpired`
- [x] `src/core/hooks/useTypingIndicator.ts` — debounced hook: throttles `setTyping` calls to once per 3s, auto-clears on send + unmount
- [x] `src/core/components/chat/conversation/TypingIndicator.tsx` — "Alice and Bob are typing…" with 3-dot bounce animation; wired into ConversationView
- [x] `src/core/components/chat/shared/UrlPreviewCard.tsx` — link preview card (left-border style, title/description/image/domain); rendered in MessageItem when `urlPreviews` is populated
- [x] `src/core/components/chat/panels/PinnedPanel.tsx` — live list of pinned messages, unpin on hover; uses `listPinnedMessages`
- [x] `src/core/components/chat/panels/SearchPanel.tsx` — search input (min 2 chars), live results via `searchMessages`; wired into right panel
- [x] `src/core/components/chat/composer/AttachmentPreview.tsx` — staged file strip with image thumbnails, filename, size, remove button
- [x] `MessageComposer.tsx` refactored: files now staged (not immediately uploaded), AttachmentPreview strip shown, upload+send happen together; Link extension added (autolink URLs)
- [x] `ChatLayout.tsx` updated: PinnedPanel and SearchPanel rendered in right panel for "pins" and "search" slots
- [x] Installed `@tiptap/extension-link@3.20.4`, `@tiptap/extension-image@3.20.4`

**Phase 5/6 bugs fixed:**
- `MessageBody.tsx`: removed incorrect `suggestion` config from read-only Mention instance
- `PollComposer.tsx`: replaced `key={i}` with stable `crypto.randomUUID()` keys for deletable option inputs

**Result:** Typing indicators appear live below the message list. Pin button → right panel shows all pinned messages with unpin. Search button → right panel shows live search. Files are previewed before sending with ability to remove. URLs in messages auto-link and render preview cards when `urlPreviews` data is present. `vite build` passes with 0 errors.

### Phase 8: Message Moving + Admin Panels ✅
- [x] `src/core/components/chat/modals/MoveMessageModal.tsx`
- [x] `src/core/components/chat/panels/ChannelSettingsPanel.tsx`
- [x] `src/core/components/chat/modals/InviteMembersModal.tsx`
- [x] `src/core/components/chat/panels/MemberPanel.tsx`
- [x] Wired all panels into `ChatLayout.tsx` RightPanelContent

**Result:** Move messages between channels via modal (T3+). MemberPanel shows members + invite. ChannelSettingsPanel edits name/icon/topic, archives channel. All wired into the right panel slot in ChatLayout.

### Phase 9: Bookmarks + Polish ✅
- [x] `convex/chatBookmarks.ts`
- [x] `src/core/components/chat/panels/BookmarksPanel.tsx`
- [x] `src/core/components/chat/conversation/InlineEditComposer.tsx` (inline message editing)
- [x] Keyboard shortcuts: Escape to close right panel, Enter to send messages, Esc to cancel inline edit
- [x] `src/core/components/chat/conversation/MessageItem.tsx` — hover toolbar with Move + Edit + Delete + Bookmark + React + Pin + Thread buttons

**Result:** Bookmarks panel lists saved messages with remove. Inline message editing (own messages). Escape closes any open right panel. Build passes with 0 errors.

---

## 8. Key Technical Notes

- **Pagination**: `listMessages` uses Convex `.paginate()` — load 50 at a time, scroll up for more. Never `.collect()` a full channel.
- **Reactivity**: Convex queries are live subscriptions. New messages appear instantly, no WebSocket setup.
- **File uploads**: Reuse existing `generateUploadUrl` pattern from `convex/users.ts`.
- **TipTap JSON**: Store message bodies as TipTap JSON (`editor.getJSON()`), not markdown. Parallel `bodyPlainText` field (`editor.getText()`) for search.
- **Convex file layout**: Flat in `convex/` (e.g. `chatChannels.ts`) matching existing convention (`announcements.ts`, `weeklyLogs.ts`).
- **Typing cleanup cron**: Runs every 10s to delete expired typing indicators.
- **DM deduplication**: `dmKey` = sorted user IDs joined by `-`. Index ensures uniqueness.
