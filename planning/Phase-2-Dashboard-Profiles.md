# Phase 2: Core Dashboards & Profiles

## Overview
This phase focuses on the primary views that each user will experience based on their role upon logging in. We'll introduce the playful, geometric UI and the concept of customizable profile "cards".

## Goals
- Build the skeleton dashboard layout (sidebar navigation or top-nav based on role).
- Implement personalized cards for Staff, Reviewers, Alumni, and Admins.
- Ensure the UI conveys the fun, YQL aesthetic while remaining clean and usable.

## Key Technical Tasks
- [ ] **Role-Specific Dashboards:**
  - *Applicant Dashboard:* Displays their application status and forms.
  - *Staff/Reviewer Dashboard:* Standard internal tools, access to Calendar, Profile, etc.
  - *Admin Dashboard:* Hub for oversight.
- [ ] **User Profile Card Engine:**
  - Build UI where Staff can customize simple fields (bio, favorite shape/color, preferred tech stack icon).
  - Store customization settings in the `users` table.
- [ ] **Layout System:** Provide robust top/side navigation showing routing only to accessible areas (e.g., non-reviewers shouldn't see Review tasks).
- [ ] **Interactive Elements:** Add hover states, subtle animations, and smooth transitions that fit the geometric brand design.

## User Notes / Further Information
- Note that being a reviewer is specific to a cycle / cohort of the YQL.