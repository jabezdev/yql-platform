# Phase 1: Foundation & Authentication

## Overview
This phase establishes the foundational architecture and database models required for the YQL platform. It focuses heavily on authentication via Clerk, and defining schemas in Convex that accommodate our three primary roles and specialized sub-roles.

## Goals
- Set up the initial `yql-platform` Next.js/Vite environment.
- Integrate Clerk for Auth and Convex for standard DB operations.
- Define a strict Role-Based Access Control (RBAC) model.
- Configure fundamental Design System tokens (fonts, colors, core geometric UI components).

## Robust Role Models
1. **Applicant** (Default state)
2. **Staff** (Those who pass recruitment or have been part of the org)
   - *Regular Staff*
   - *Reviewer* (Assigned to evaluate applications)
   - *Alumni* (Completed term but still retaining staff login for archive/calendar)
3. **Admin** (Super-user overseeing the hub, pipeline, and assignment of roles)

## Key Technical Tasks
- [ ] **Auth Sync:** Create an action or webhook that syncs Clerk users into the Convex `users` table on registration.
- [ ] **Schema Definition - `users`:** Needs fields for `role` (Applicant, Staff, Admin) and `staffSubRole` (Regular, Reviewer, Alumni).
- [ ] **Schema Definition - `cohorts`:** Define application windows, term dates.
- [ ] **Auth Protections:** Build reusable layouts/guards based on the user's role and sub-role.
- [ ] **Design Setup:** Add Outfit/Space Grotesk and Inter fonts. Define core Tailwind color palette. Create foundational UI components (buttons, text inputs, form wrappers).

## User Notes / Further Information
- Note that being a reviewer is specific to a cycle / cohort of the YQL.