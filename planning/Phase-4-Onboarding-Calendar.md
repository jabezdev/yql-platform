# Phase 4: Onboarding & Calendar

## Overview
Once an applicant completes Round 5 (Signing) and enters Round 6 (Onboarding), they transition to Staff status. This phase focuses on the immediate onboarding course they need to consume and the persistent YQL event calendar.

## Goals
- Guide new Staff through standard operational or technical knowledge with a flexible, reconfigurable flow.
- Ensure the calendar acts as the source of truth for cohort timeline events, workshops, interviews, and milestones.

## Key Technical Tasks
- [ ] **Onboarding Engine / Course Renderer:**
  - Minimal LMS (Learning Management System) for Staff.
  - Define `onboarding_modules` in the database.
  - Create views to step through modules (markdown support, embedded video/slides).
  - Track user progress for each module so Admins know who has actively completed Round 6 onboarding.
- [ ] **Onboarding CMS / Reconfigurable Flow:** 
  - Build a robust Admin UI to create, order, edit, and reconfigure the onboarding steps and materials without needing code changes.
- [ ] **Global YQL Calendar:**
  - Store `calendar_events` in Convex with start/end data, tags, and visibility (some events might be Admin/Reviewer only).
  - Render a monthly or list-based view of upcoming events.

