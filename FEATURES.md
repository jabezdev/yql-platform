# Platform Features & Roadmap

This document outlines the capabilities of the current backend and proposes a roadmap for enhancements.

## 🚀 Ready-to-Use Features (Current Backend)

These features are fully implemented in the Convex backend and only require frontend integration.

- **Admin & Management Dashboards**:
  - Centralized stats: total staff, active cohorts, pending apps, open tasks.
  - Full visibility into all users and their hierarchical roles.
- **End-to-End Recruitment**:
  - Dynamic cohorts with configurable start/end dates.
  - Multi-round application tracking (Round 1–6, Accepted/Rejected/Withdrawn).
  - Assigned reviews with rubric-based scoring and formal feedback.
  - Interview scheduling with note-taking and status updates.
- **Advanced Workspace Chat**:
  - Gated/Private channels with owner-approval workflow.
  - Message threading, reactions, and pinning.
  - Interactive polls (multiple votes, anonymous support).
  - Cross-channel message mobility (Move Message with audit trail).
  - Silent/Quiet messaging for off-peak updates.
- **Operational Progress**:
  - Weekly log submissions (hours, highlights, challenges).
  - Task board with status (Open/In Progress/Done) and priority levels.
  - Member onboarding progress tracking (module-based).
  - Shared calendar with event RSVPs.

## 🛠️ Minimal Addition Features (Quick Wins)

These can be implemented with < 1 day of backend effort each.

- **Email Alerts**: Integrate a Convex Action (e.g., [Resend](https://resend.com/)) to notify users of mentions, assigned tasks, or application status updates.
- **Automated Nudges**: Extend `crons.ts` to send automated reminders to staff who haven't submitted their weekly logs by Sunday night.
- **Application Status History**: Create a new table to track every status transition for an application (who changed it and when) for a complete audit trail.
- **Staff-Only Announcements**: Add a boolean flag to `announcements` to target specific role tiers (e.g., "Only T2+ see this").

## 🔮 Future Capabilities (Strategic Roadmap)

Strategic features requiring more extensive development.

- **Automated Shortlisting**: Logic to automatically rank or highlight "High Potential" applicants based on average rubric scores across multiple reviewers.
- **Project/Engagement Analytics**: Visual dashboards showing team productivity trends using data from the `weeklyLogs` and `openTasks` tables.
- **Member Portfolios**: Expand `userProfile` to showcase "Milestones" and "Highlights" from their weekly logs automatically.
- **Recruitment Templates**: A system for managing standardized email or message templates for common recruitment outcomes.
- **Pro-active Moderation**: Using OpenAI actions to pre-scan chat messages for toxicity or violations using the `chatRateLimits` and `chatAbuseReports` hooks.
