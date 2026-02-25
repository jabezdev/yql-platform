/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as applications from "../applications.js";
import type * as calendar from "../calendar.js";
import type * as cohorts from "../cohorts.js";
import type * as files from "../files.js";
import type * as forms from "../forms.js";
import type * as hr from "../hr.js";
import type * as interviews from "../interviews.js";
import type * as onboarding from "../onboarding.js";
import type * as scoring from "../scoring.js";
import type * as userProfile from "../userProfile.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  applications: typeof applications;
  calendar: typeof calendar;
  cohorts: typeof cohorts;
  files: typeof files;
  forms: typeof forms;
  hr: typeof hr;
  interviews: typeof interviews;
  onboarding: typeof onboarding;
  scoring: typeof scoring;
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
