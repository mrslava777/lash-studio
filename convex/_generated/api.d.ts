/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ViktorSpacesEmail from "../ViktorSpacesEmail.js";
import type * as auth from "../auth.js";
import type * as availableSlots from "../availableSlots.js";
import type * as bookings from "../bookings.js";
import type * as constants from "../constants.js";
import type * as customSections from "../customSections.js";
import type * as gallery from "../gallery.js";
import type * as http from "../http.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as seedTestUser from "../seedTestUser.js";
import type * as services from "../services.js";
import type * as siteSettings from "../siteSettings.js";
import type * as testAuth from "../testAuth.js";
import type * as users from "../users.js";
import type * as viktorTools from "../viktorTools.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ViktorSpacesEmail: typeof ViktorSpacesEmail;
  auth: typeof auth;
  availableSlots: typeof availableSlots;
  bookings: typeof bookings;
  constants: typeof constants;
  customSections: typeof customSections;
  gallery: typeof gallery;
  http: typeof http;
  reviews: typeof reviews;
  seed: typeof seed;
  seedTestUser: typeof seedTestUser;
  services: typeof services;
  siteSettings: typeof siteSettings;
  testAuth: typeof testAuth;
  users: typeof users;
  viktorTools: typeof viktorTools;
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
