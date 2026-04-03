# YQL Platform Architecture & Organization

Based on an in-depth analysis of the Convex schema (`schema.ts`), the platform is built to handle dynamic, complex workflows (e.g., custom form builders, rubric building, availability scheduling, design studio). 

To cleanly support this level of depth, the platform uses a **Domain-Driven Architecture**. The UI is split into four fully distinct "Apps" (accessed via a top navigation bar) rather than a monolithic, flat dashboard.

```text
+-----------------------------------------------------------------------------------+
|  [Logo] YQL    [ Me ]    [ Academy ]    [ Workspace ]    [ HQ / Ops ]             |
+-----------------------------------------------------------------------------------+
```

---

### 1. "Me" (Personal Space)
_The default landing area focused purely on the individual user's needs._

*   **For Applicants (`/me/application`)**:
    *   **Dynamic Intake:** Fill out custom `applicationForms` built specifically for their cohort.
    *   **Status Tracking**: See exactly where they are in Rounds 1-6.
*   **For Staff (`/me/feed` & `/me/tasks`)**:
    *   **Feed:** Pinned organizational `announcements`, personal event RSVPs.
    *   **To-Dos:** Personal to-do list (`personalTodos`), distinct from global tasks.
    *   **My HR Hub:** Submit and track `hrFormSubmissions` (e.g., Leave of Absence, Purchase Requests).

---

### 2. "Academy" (Learning & Resources)
_The centralized knowledge base and Learning Management System (LMS)._

*   **Quantum 101 Courses (`/academy/onboarding`)**: Consume markdown/video `onboardingModules`. Tracks `onboardingProgress` visually.
*   **Resource Library (`/academy/resources`)**: A categorized hub of shared `resources` (links, documents, videos) with tagging.
*   **Course Creator (Admins Only)**: UI to seamlessly build and reorder the onboarding curriculum.

---

### 3. "Workspace" (Collaboration & Operations)
_The shared environment where Staff (T5+) execute their daily work._

*   **The Task Board (`/workspace/tasks`)**: Global `openTasks` Kanban tracking priorities (`low`, `medium`, `high`) and assignees.
*   **HR & Operations (`/workspace/hr`)**: 
    *   **Weekly Logs**: Shared submission interface for staff to log hours, highlights, and blockers (`weeklyLogs`).
*   **Global Calendar (`/workspace/calendar`)**: Master schedule of `calendarEvents` (workshops, interviews, meetings) tightly integrated with `weeklyMeetingRSVP`.
*   **Design Studio (`/workspace/posters`)**: Full visual manager combining nested `posterFolders` and `posterDesigns`. Features a "Like" system (`posterLikes`) and private/public toggling.
*   **Staff Directory (`/workspace/directory`)**: "Face book" using user profiles and group mapping (e.g., tags, tech stack icons).

---

### 4. "HQ / Ops" (Leadership Command Center)
_Gated to Managers (T3+) and Admins. This focuses on managing pipelines, not doing individual work._

*   **Recruitment Command (`/hq/recruitment`)**:
    *   **Setup Engine**: Define `cohorts`, build custom `applicationForms`, and configure per-round `rubrics`.
    *   **Applications Board**: Kanban view to transition applicants between status stages (generates `applicationStatusHistory` audit logs).
    *   **Review Hub**: Reviewers log their `evaluations` (scores based on the custom rubric).
    *   **Interview Command**: Match `interviews` against `reviewerAvailabilities`.
*   **Staff Command (`/hq/staff`)**:
    *   **Logs Reader**: Aggregated view to read what the team logged in `weeklyLogs` and unblock them.
    *   **Access Control**: Promote/demote members across T1-T5 tiers and manage Special Roles (Evaluator/Alumni).

---

## Technical Flow & Routing Matrix

| Route Path | Accessibility | Backed by Convex Tables |
| :--- | :--- | :--- |
| `/me` | Everyone | `personalTodos`, `announcements`, `hrFormSubmissions`, `applications` |
| `/academy` | Everyone | `onboardingModules`, `resources` |
| `/workspace/*` | Staff (T5+) | `openTasks`, `calendarEvents`, `weeklyLogs`, `posterDesigns`, `users` |
| `/hq/*` | Management (T3+) | `cohorts`, `rubrics`, `interviews`, `applicationStatusHistory`, `forms` |
