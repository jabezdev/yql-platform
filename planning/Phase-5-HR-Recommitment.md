# Phase 5: Minimal HR & Recommitment

## Overview
This phase builds out the lightweight community management tools. It avoids becoming a full-blown HR platform but provides enough infrastructure to maintain the cyclical nature of YQL and keep the roster fresh.

## Goals
- Provide Admins with a directory of all active and inactive Staff and Alumni.
- Create an automated "Recommitment Flow" to ensure continuous engagement from Staff.

## Key Technical Tasks
- [x] **Member Directory:**
  - Build a searchable, filterable grid of user profile cards (filtering by cohort, active status, sub-roles).
- [x] **Recommitment Engine:**
  - Define the term lifecycle.
  - Towards the end of a term, display a required block/modal to active Staff asking if they will stay for the next season.
  - If they decline or fail to answer in time, automatically shift their `staffSubRole` to `Alumni`.
- [x] **Alumni State:**
  - Define what features are stripped when transitioned to Alumni (e.g., they lose Reviewer capabilities and active tasks, but keep access to the Calendar and their Profile Card).
- [x] **Admin Roster Management:** Easy bulk-actions to transition people to Alumni manually, or upgrade regular Staff to Reviewers.

## User Notes / Further Information
*(Add notes here...)*
