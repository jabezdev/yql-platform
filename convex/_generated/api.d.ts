/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accessControl from "../accessControl.js";
import type * as admin from "../admin.js";
import type * as announcements from "../announcements.js";
import type * as applications from "../applications.js";
import type * as calendar from "../calendar.js";
import type * as chatBookmarks from "../chatBookmarks.js";
import type * as chatChannels from "../chatChannels.js";
import type * as chatDirectMessages from "../chatDirectMessages.js";
import type * as chatMembers from "../chatMembers.js";
import type * as chatMessages from "../chatMessages.js";
import type * as chatPermissions from "../chatPermissions.js";
import type * as chatPolls from "../chatPolls.js";
import type * as chatReactions from "../chatReactions.js";
import type * as chatThreads from "../chatThreads.js";
import type * as chatTyping from "../chatTyping.js";
import type * as cohorts from "../cohorts.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as forms from "../forms.js";
import type * as hr from "../hr.js";
import type * as hrForms from "../hrForms.js";
import type * as interviews from "../interviews.js";
import type * as onboarding from "../onboarding.js";
import type * as openTasks from "../openTasks.js";
import type * as personalTodos from "../personalTodos.js";
import type * as resources from "../resources.js";
import type * as roleHierarchy from "../roleHierarchy.js";
import type * as scoring from "../scoring.js";
import type * as userProfile from "../userProfile.js";
import type * as users from "../users.js";
import type * as weeklyLogs from "../weeklyLogs.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accessControl: typeof accessControl;
  admin: typeof admin;
  announcements: typeof announcements;
  applications: typeof applications;
  calendar: typeof calendar;
  chatBookmarks: typeof chatBookmarks;
  chatChannels: typeof chatChannels;
  chatDirectMessages: typeof chatDirectMessages;
  chatMembers: typeof chatMembers;
  chatMessages: typeof chatMessages;
  chatPermissions: typeof chatPermissions;
  chatPolls: typeof chatPolls;
  chatReactions: typeof chatReactions;
  chatThreads: typeof chatThreads;
  chatTyping: typeof chatTyping;
  cohorts: typeof cohorts;
  crons: typeof crons;
  files: typeof files;
  forms: typeof forms;
  hr: typeof hr;
  hrForms: typeof hrForms;
  interviews: typeof interviews;
  onboarding: typeof onboarding;
  openTasks: typeof openTasks;
  personalTodos: typeof personalTodos;
  resources: typeof resources;
  roleHierarchy: typeof roleHierarchy;
  scoring: typeof scoring;
  userProfile: typeof userProfile;
  users: typeof users;
  weeklyLogs: typeof weeklyLogs;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
