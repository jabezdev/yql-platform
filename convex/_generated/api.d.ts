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
import type * as calendar from "../calendar.js";
import type * as chat_bookmarks from "../chat/bookmarks.js";
import type * as chat_channels from "../chat/channels.js";
import type * as chat_directMessages from "../chat/directMessages.js";
import type * as chat_lib_access from "../chat/lib/access.js";
import type * as chat_lib_enrich from "../chat/lib/enrich.js";
import type * as chat_lib_moderation from "../chat/lib/moderation.js";
import type * as chat_lib_notifications from "../chat/lib/notifications.js";
import type * as chat_lib_permissions from "../chat/lib/permissions.js";
import type * as chat_lib_rateLimit from "../chat/lib/rateLimit.js";
import type * as chat_members from "../chat/members.js";
import type * as chat_messages from "../chat/messages.js";
import type * as chat_notifications from "../chat/notifications.js";
import type * as chat_permissions from "../chat/permissions.js";
import type * as chat_polls from "../chat/polls.js";
import type * as chat_reactions from "../chat/reactions.js";
import type * as chat_threads from "../chat/threads.js";
import type * as chat_typing from "../chat/typing.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as forms from "../forms.js";
import type * as hr_hr from "../hr/hr.js";
import type * as hr_hrForms from "../hr/hrForms.js";
import type * as hr_onboarding from "../hr/onboarding.js";
import type * as hr_weeklyLogs from "../hr/weeklyLogs.js";
import type * as openTasks from "../openTasks.js";
import type * as org_announcements from "../org/announcements.js";
import type * as org_cohorts from "../org/cohorts.js";
import type * as org_roleHierarchy from "../org/roleHierarchy.js";
import type * as personalTodos from "../personalTodos.js";
import type * as posterDesigns from "../posterDesigns.js";
import type * as posterFolders from "../posterFolders.js";
import type * as recruitment_applications from "../recruitment/applications.js";
import type * as recruitment_history from "../recruitment/history.js";
import type * as recruitment_interviews from "../recruitment/interviews.js";
import type * as recruitment_scoring from "../recruitment/scoring.js";
import type * as resources from "../resources.js";
import type * as userProfile from "../userProfile.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accessControl: typeof accessControl;
  admin: typeof admin;
  announcements: typeof announcements;
  calendar: typeof calendar;
  "chat/bookmarks": typeof chat_bookmarks;
  "chat/channels": typeof chat_channels;
  "chat/directMessages": typeof chat_directMessages;
  "chat/lib/access": typeof chat_lib_access;
  "chat/lib/enrich": typeof chat_lib_enrich;
  "chat/lib/moderation": typeof chat_lib_moderation;
  "chat/lib/notifications": typeof chat_lib_notifications;
  "chat/lib/permissions": typeof chat_lib_permissions;
  "chat/lib/rateLimit": typeof chat_lib_rateLimit;
  "chat/members": typeof chat_members;
  "chat/messages": typeof chat_messages;
  "chat/notifications": typeof chat_notifications;
  "chat/permissions": typeof chat_permissions;
  "chat/polls": typeof chat_polls;
  "chat/reactions": typeof chat_reactions;
  "chat/threads": typeof chat_threads;
  "chat/typing": typeof chat_typing;
  crons: typeof crons;
  files: typeof files;
  forms: typeof forms;
  "hr/hr": typeof hr_hr;
  "hr/hrForms": typeof hr_hrForms;
  "hr/onboarding": typeof hr_onboarding;
  "hr/weeklyLogs": typeof hr_weeklyLogs;
  openTasks: typeof openTasks;
  "org/announcements": typeof org_announcements;
  "org/cohorts": typeof org_cohorts;
  "org/roleHierarchy": typeof org_roleHierarchy;
  personalTodos: typeof personalTodos;
  posterDesigns: typeof posterDesigns;
  posterFolders: typeof posterFolders;
  "recruitment/applications": typeof recruitment_applications;
  "recruitment/history": typeof recruitment_history;
  "recruitment/interviews": typeof recruitment_interviews;
  "recruitment/scoring": typeof recruitment_scoring;
  resources: typeof resources;
  userProfile: typeof userProfile;
  users: typeof users;
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
