/**
 * Dev-only account switching.
 *
 * The Open Food Facts `session` cookie is set on an openfoodfacts host, so a
 * front end served from localhost never sees one and cannot sign anybody in.
 * Dev mode therefore fakes the account - and since the app behaves in three
 * quite different ways depending on who is looking (signed out, signed in,
 * signed in with moderator rights), the fake account is picked by hand on the
 * login page rather than being fixed at "moderator".
 *
 * None of this exists outside dev mode: every export is inert unless
 * `devMode` is true, and authProvider only consults it behind that flag.
 */

import axios from "axios";

/** The escape hatch itself - set by VITE_DEVELOPPEMENT_MODE in .env.local. */
export const devMode = import.meta.env.VITE_DEVELOPPEMENT_MODE === "development";

/** Which of the three kinds of visitor the app should be shown as. */
export type DevRole = "anonymous" | "contributor" | "moderator";

/** The choices offered on the login page, in the order they are shown. */
export const devRoles: {
  id: DevRole;
  label: string;
  description: string;
}[] = [
  {
    id: "anonymous",
    label: "Signed out",
    description:
      "No session at all: the moderation screens and the flag form both send you back here.",
  },
  {
    id: "contributor",
    label: "Contributor",
    description:
      "Signed in without moderator rights: the flag form works, the moderation screens bounce to the “not a moderator” page.",
  },
  {
    id: "moderator",
    label: "Moderator",
    description: "Signed in with moderator rights: the whole app is open.",
  },
];

// Kept in localStorage so that the choice survives the reload that applies it
// (see applyDevRole) and the rest of the session's page loads.
const STORAGE_KEY = "nutripatrol.devRole";

// Matches what dev mode used to do unconditionally, so a developer who never
// opens the switcher sees the app exactly as before.
const DEFAULT_ROLE: DevRole = "moderator";

function isDevRole(value: unknown): value is DevRole {
  return devRoles.some((role) => role.id === value);
}

/** The role currently being played, defaulting to moderator. */
export function getDevRole(): DevRole {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isDevRole(stored) ? stored : DEFAULT_ROLE;
  } catch {
    // Storage can be unavailable (private windows, blocked site data); the
    // switcher is a convenience, so fall back rather than break the app.
    return DEFAULT_ROLE;
  }
}

export function setDevRole(role: DevRole): void {
  try {
    localStorage.setItem(STORAGE_KEY, role);
  } catch {
    // Ignored: the role just will not survive the reload.
  }
}

/**
 * Switches role and lands on `nextPath`.
 *
 * A full page load rather than a client-side navigation, because react-admin
 * caches the authProvider's answers in react-query - identity, permissions and
 * the checkAuth verdict of every page already visited would otherwise still
 * describe the previous role. Reloading is the one thing that certainly clears
 * all of it, and this only ever runs in dev mode.
 */
export function applyDevRole(role: DevRole, nextPath: string): void {
  setDevRole(role);
  window.location.assign(nextPath);
}

/**
 * The Open Food Facts user id each role acts as - null while signed out.
 *
 * One name per role, and the same name on both sides of the API: it is what
 * the front end reports as the identity (authProvider.getIdentity), what a
 * flag filed from here is recorded under, and what the API is told to filter
 * on (see below). They have to agree, or a contributor would not find the
 * ticket they just opened.
 */
export function devUserId(role: DevRole): string | null {
  return role === "anonymous" ? null : `DEVMODE_${role.toUpperCase()}`;
}

// The API's matching escape hatch, AUTH_DEV_USERS - see the nutripatrol
// README, "Switching between users in local dev". It authenticates the user
// these headers name, and applies the same permission checks it would to a
// real account, which is what makes a non-moderator here behave like one.
const DEV_USER_ID_HEADER = "X-Dev-User-Id";
const DEV_MODERATOR_HEADER = "X-Dev-Moderator";

/**
 * Makes every API call act as the role the switcher last picked.
 *
 * An interceptor rather than `axios.defaults`, so that it can leave alone the
 * requests that do not go to the NutriPatrol API: the flag form loads product
 * images straight from Open Food Facts, and an unexpected header on those
 * would cost a CORS preflight they would fail.
 *
 * Signed out sends nothing at all, which is the point: the API then answers
 * 401 exactly as it does to a real logged-out visitor, rather than the front
 * end alone pretending to be signed out.
 */
export function installDevAuth(): void {
  if (!devMode) return;
  const apiUrl = import.meta.env.VITE_API_URL;

  axios.interceptors.request.use((config) => {
    if (!config.url?.startsWith(apiUrl)) return config;
    const role = getDevRole();
    const userId = devUserId(role);
    if (!userId) return config;
    config.headers.set(DEV_USER_ID_HEADER, userId);
    if (role === "moderator") config.headers.set(DEV_MODERATOR_HEADER, "1");
    // The API reads the dev headers before anything else, but the endpoints
    // that write to Open Food Facts on a moderator's behalf still need a real
    // session cookie - sent here for the dev stacks that have one.
    config.withCredentials = true;
    return config;
  });
}
