# Platform Backend Documentation

This document provides a concise overview of the YQL Platform backend, implemented using [Convex](https://www.convex.dev/).

## 🏗️ Architecture Overview

The backend is built as a set of serverless functions (Queries, Mutations, Actions) and a managed real-time database.

- **Storage**: Convex File Storage is used for profile chips and chat attachments.
- **Authentication**: Integrated with [Clerk](https://clerk.com/). Identity is synced to the `users` table via `convex/users.ts:storeUser`.
- **Authorization**: Custom hierarchical Role-Based Access Control (RBAC) defined in `convex/accessControl.ts` and `convex/org/roleHierarchy.ts`.

## 📂 Core Modules

### 1. User Management (`convex/users.ts`)
- **Identity Sync**: Automatically creates/updates user records on first login.
- **Roles**: Directs access based on `Super Admin`, `T1` (Director) through `T5` (Associate), and `Applicant`.
- **Directory**: Provides a filtered list of staff members for internal networking.

### 2. Recruitment & Admissions (`convex/recruitment/`)
- **Cohorts**: Manages application cycles (dates, status).
- **Applications**: Tracks user applications through multiple rounds (1–6, Accepted/Rejected).
- **Review System**: Scoring rubrics and formal evaluations by assigned reviewers.
- **Interviews**: Scheduling and notes for applicant interviews.

### 3. Community Chat (`convex/chat/`)
- **Channel Types**: Supports Public Channels, Subchannels, Groups, Sidechats, and DMs.
- **Engagement**: Reactions, Polls, Threading, and Pinned messages.
- **Advanced Features**:
  - **Silent Messages**: Send without notifications.
  - **Message Moving**: Shift messages between channels with an audit trail.
  - **Tokenized Search**: Fast full-text search indexed via tokens.
  - **Read State**: Granular tracking of when a user last viewed a channel.

### 4. HR & Operations (`convex/hr/`, `convex/calendar.ts`, etc.)
- **Weekly Logs**: Staff progress tracking (highlights, challenges, hours).
- **Onboarding**: Module-based flow for new members.
- **Calendar**: Event management with RSVP capabilities.
- **Announcements**: Pinned internal news with expiration support.
- **Open Tasks**: Shared task board with priority and assignment.

## 🔒 Security & Access Control

### Role Hierarchy (High to Low)
1. **Super Admin** (Rank 0)
2. **T1 — Director** (Rank 10)
3. **T2 — Manager** (Rank 20)
4. **T3 — Senior** (Rank 30)
5. **T4 — Member** (Rank 40)
6. **T5 — Associate** (Rank 50)
7. **Applicant** (Rank 990)

### Guard Patterns
- `requireUser(ctx)`: Ensures the user is authenticated.
- `requireMinRole(ctx, role)`: Checks for hierarchical permissions.
- `requireCanManage(ctx, targetUserId)`: Ensures the actor outranks the target.
- `assertCanReadChannel(ctx, user, channelId)`: Enforces channel visibility (Private vs Public).

### ⚠️ Security Concerns & Gaps

> [!WARNING]
> **Unguarded Recruitment Queries**: `getApplicationsForUser` and `getApplicationsForCohort` in `convex/recruitment/applications.ts` currently lack role checks. Any authenticated user can theoretically fetch applications and applicant IDs.

> [!CAUTION]
> **Incomplete CRUD Persistence**: Several modules (e.g., `calendar`, `openTasks`) have robust read/write logic but lack comprehensive *delete* or *archive* implementations, leading to potential data bloat over time.

- **Validation**: Many mutations rely on `v.any()` or loose `v.object()` structures for complex data (e.g., `hrFormSubmissions.responses`), which could lead to malformed data if the frontend is compromised.
- **Rate Limiting**: While `chatRateLimits` table exists in the schema, it does not appear to be actively enforced in the `sendMessage` logic yet.
