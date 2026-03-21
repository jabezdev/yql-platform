# CHAT_PLAN2 — Non-Trivial Feature Roadmap

This document covers features that are missing from the current chat system and require meaningful design or infrastructure work to implement correctly. Easy wins and bug fixes from the initial audit have already been applied.

---

## 1. Full-Text Search

**Current state:** `searchMessages` does a full table scan, filters client-side via `bodyPlainText.includes()`, and caps at 50 results. This breaks at scale.

**What's needed:**
- Add a Convex search index on `chatMessages.bodyPlainText` (and optionally `body`)
- Replace the current scan-and-filter with `ctx.db.search("chatMessages", { index: "search_body", query: searchText })`
- Scope the results by `channelId` when provided, filter deleted messages
- Return enriched results (author name, channel name, snippet with highlighted match)

**Schema change:**
```ts
chatMessages: defineTable({ ... })
    .searchIndex("search_body", { searchField: "bodyPlainText", filterFields: ["channelId", "isDeleted"] })
```

**Complexity:** Medium. Convex search indexes require explicit field declaration. The query API changes, and pagination behaves differently from standard queries. Frontend search UI may need a debounce rework to avoid thrashing.

---

## 2. Mention Notification Delivery

**Current state:** Mention notifications are now stored in `chatNotifications` and exposed via `listMyNotifications` / `markNotificationsRead`. However, there is no delivery surface — users have no way to see them yet.

**What's needed:**
- **Notification bell UI** in `ChatLayout` or the global `WorkspaceLayout` header showing unread mention count (badge on bell icon)
- **Notification panel** listing mentions with: sender name, channel, message preview, timestamp, and a "Jump to message" link
- **markAsRead call** triggered when the user opens the notification panel or navigates to the mentioned channel
- **Special roles mentions** (`@Alumni`, `@Evaluator`) — the backend already resolves `specialRoles` mentions against the users table but requires a scan (no index on `specialRoles` array). A `by_specialRoles` index or denormalized lookup table would help at scale.

**Complexity:** Medium. Data layer is done. Work is primarily frontend (notification bell, panel component, badge counter) and UX wiring (jump-to-message scroll behavior).

---

## 3. Channel Visibility & Discovery

**Current state:** All channels (except archived) are returned by `getChannelTree()` to all authenticated users. There is no concept of private vs. public channels.

**What's needed:**
- Add a `visibility` field to `chatChannels`: `"public"` | `"private"` | `"secret"`
  - `public` — visible to everyone, joinable without invite
  - `private` — visible in directory but requires invite to join
  - `secret` — only visible to members (not shown in tree to non-members)
- Update `getChannelTree` to filter `secret` channels where the user is not a member
- Add a `discoverChannels` query returning public/private channels the user has not yet joined
- Add a channel browser UI (similar to Slack's channel browser)

**Schema change:**
```ts
chatChannels: defineTable({
    ...
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("secret")),
})
```

**Complexity:** Medium-High. Requires a schema migration (all existing channels need a default visibility), changes to channel tree queries, and new frontend UI for discovery. Permission logic for joining also needs updating.

---

## 4. Message Scheduling

**Current state:** Messages are sent immediately on submit. There is no way to schedule a message for future delivery.

**What's needed:**
- Add `scheduledFor: v.optional(v.number())` to `chatMessages`
- `sendMessage` mutation checks if `scheduledFor` is set: if so, inserts the message with `isScheduled: true` and does NOT surface it in `listMessages`
- A Convex scheduled function (using `ctx.scheduler.runAt`) triggers at `scheduledFor` time to flip `isScheduled: false`, making it visible
- `listMessages` filters out `isScheduled: true` messages
- Composer UI: add a "Schedule send" option (date/time picker) alongside the send button
- A "Scheduled messages" panel or indicator showing the user their pending scheduled messages with an option to cancel

**Complexity:** High. Requires schema changes, new scheduler logic, a new UI flow in the composer, and careful edge cases (e.g., what happens to a scheduled message if the channel is archived before it sends, or if the author is deleted).

---

## 5. DM Read Receipts

**Current state:** `chatChannelMembers.lastReadTimestamp` tracks when each user last read a channel, but this is not surfaced in the DM UI. There are no per-message "seen by" indicators.

**What's needed:**
- For 1-on-1 DMs, display a "Seen" / "Delivered" tick below the last message the other user has read
- This requires exposing the other participant's `lastReadTimestamp` (or `lastReadMessageId`) in the DM view — currently only the current user's membership is fetched via `getMyMembership`
- Add a query `getDMReadStatus(channelId)` that returns each participant's `lastReadMessageId` (privacy consideration: only expose within DMs, not in group channels)
- Frontend: compare `lastReadMessageId` of the other user against rendered messages to show "seen" checkmarks

**Complexity:** Medium. The data is already in `chatChannelMembers`. Work is mostly: (1) a targeted query that doesn't leak read position for non-DM channels, (2) frontend message-level indicator rendering, and (3) careful performance handling since this re-renders on every `markAsRead` call.

---

## 6. Edit History Viewer UI

**Current state:** `editHistory` is now stored on messages (backend done). However, the frontend has no way to display it — the "edited" label is shown but clicking it does nothing.

**What's needed:**
- Make the `(edited)` label on `MessageItem` clickable
- Open a small popover or modal showing the full edit history in reverse-chronological order: each entry shows the previous body text and the timestamp when it was replaced
- The current body is implicitly "the latest version" — the history shows what came before
- The popover can use the existing `editHistory` array already returned by `listMessages`

**Complexity:** Low-Medium. The data is there. Work is entirely frontend: a small history popover component, Tiptap read-only rendering for each past body, and wiring the click handler on the `(edited)` label.

---

## 7. Attachment Lifecycle Management

**Current state:** Attachments are deleted from Convex Storage when their message is soft-deleted (fix applied). However:
- If a message is later hard-deleted (currently no hard-delete path), storage is already clean
- If an upload is initiated but the message is never sent (e.g., user uploads then navigates away), the storage object is orphaned — no `generateUploadUrl` tracking exists

**What's needed:**
- Track pending uploads: insert a `chatPendingUploads` record when `generateUploadUrl` is called, delete it when the message is sent or the upload is abandoned
- A periodic cron job that scans `chatPendingUploads` for records older than N minutes and deletes the corresponding storage objects
- Alternatively, use Convex's file metadata API (when available) to find orphaned storage objects

**Complexity:** Medium. Requires a new table, updates to `generateUploadUrl` and `sendMessage`, and a new cron job. The main challenge is defining "abandoned" reliably — a reasonable TTL (e.g., 30 minutes after upload URL generation) works for most cases.

---

## Summary Table

| Feature | Schema Change | Backend Work | Frontend Work | Complexity |
|---|---|---|---|---|
| Full-text search | Search index | New query API | Debounce rework | Medium |
| Notification delivery UI | None | specialRoles scan optimization | Bell + panel + jump-to | Medium |
| Channel visibility/discovery | `visibility` field | Tree filter, discover query | Channel browser | Medium-High |
| Message scheduling | `scheduledFor`, `isScheduled` | Scheduler function | Composer date picker | High |
| DM read receipts | None | `getDMReadStatus` query | Per-message tick UI | Medium |
| Edit history viewer | None (done) | None (done) | Popover component | Low-Medium |
| Attachment lifecycle | `chatPendingUploads` | Cron + cleanup logic | None | Medium |
