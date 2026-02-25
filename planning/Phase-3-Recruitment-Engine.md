# Phase 3: Recruitment Engine

## Overview
The heart of the cyclical YQL process. This phase builds the mechanisms for applicants to apply, for reviewers to assess them, and for admins to push candidates through a structured 6-round recruitment pipeline.

## 6-Round Pipeline
1. **Round 1 - Written Application:** Initial form submission with reconfigurable questions.
2. **Round 2 - Skills Showcase:** Portfolio and technical assessment submission.
3. **Round 3 - Interviews:** Live interview scheduling and assessment.
4. **Round 4 - Deliberation:** Internal reviewer discussion and final scoring based on set criteria.
5. **Round 5 - Commitment Agreement & Signing:** Formal acceptance of terms by the applicant.
6. **Round 6 - Onboarding:** Transition to Staff status and initiation of the onboarding course (Detailed in Phase 4).

## Goals
- Facilitate long-term, cohort-based applications with clear status tracking for the applicant.
- Build dynamic, reconfigurable forms so Admins can easily change questions and fields.
- Support file uploads (resumes, portfolios) with an integrated built-in PDF viewer.
- Implement an integrated interview scheduling system.
- Create a comprehensive end-to-end profile view for Reviewers to track an applicant's entire journey and score them consistently.
- Provide Admins with a bird's-eye view of the pipeline to confidently assign roles and progress candidates.

## Key Technical Tasks
- [ ] **Dynamic Forms Engine:** Build a UI and schema structure so Admins can reconfigure application form questions per cohort.
- [ ] **Applicant Tracking & File Management:**
  - Clear progress UI showing the Applicant exactly where they are in the 6-round flow.
  - Integration with Convex file storage for resumes, portfolios, and skills showcases.
  - Implement a built-in React PDF viewer component for seamless in-app reading.
- [ ] **Interview Scheduling (Round 3):**
  - *Reviewer View:* Interface to set and manage availability time slots.
  - *Applicant View:* Interface to book an available interview slot.
- [ ] **Reviewer Flow & Scoring:**
  - A specialized **End-to-End Profile Window**. Reviewers can see all data from Round 1 answers up to Round 3 interview notes in one unified view.
  - Reconfigurable, multi-criteria scoring rubric to evaluate the applicant fairly at each stage.
- [ ] **Admin Flow:**
  - Pipeline dashboard (Table/Kanban) showing applicants sorted by their current Round.
  - UI to assign/mass-assign Applicants to specific Reviewers.
  - Controls to transition applicant status through the rounds (e.g., Reject or move to next Round).

## User Notes / Further Information
- Note that being a reviewer is specific to a cycle / cohort of the YQL.