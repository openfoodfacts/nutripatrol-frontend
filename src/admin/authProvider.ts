import type { AuthProvider } from "react-admin";
import axios from "axios";
import off from "../off.ts";
import { NOT_MODERATOR_ROUTE } from "./routes";
import { devMode, getDevRole, setDevRole } from "./devAuth";

/** What the OFF session cookie, once validated, tells us about the user. */
interface Account {
  username: string;
  isModerator: boolean;
}

// The cookie alone says who the user claims to be; only /cgi/auth.pl says
// whether the session is still valid and whether the account moderates. That
// is a network round-trip, and react-admin calls checkAuth on every route
// change - so the answer is cached, keyed by the cookie it was derived from.
// A new login (or a logout) changes the cookie, which invalidates the entry
// on its own.
let cached: { cookie: string; account: Promise<Account | null> } | null = null;

/** The account dev mode is currently pretending to be signed in as. */
function devAccount(): Account | null {
  const role = getDevRole();
  if (role === "anonymous") return null;
  return {
    username: `DEVMODE_${role.toUpperCase()}`,
    isModerator: role === "moderator",
  };
}

/** The signed-in moderator, or null when nobody is signed in. */
function loadAccount(): Promise<Account | null> {
  // The OFF session cookie is set on an openfoodfacts host, so a front end
  // served from localhost never sees one and would otherwise be locked out of
  // its own admin. Dev mode plays whichever account the login page's switcher
  // last picked - including no account at all.
  if (devMode) return Promise.resolve(devAccount());

  const cookie = off.getCookie("session");
  if (!cookie) {
    cached = null;
    return Promise.resolve(null);
  }
  if (cached?.cookie === cookie) return cached.account;

  const account = axios
    .get<{ user: { moderator: number } }>(
      `${import.meta.env.VITE_PO_URL}/cgi/auth.pl?body=1`,
      // The whole point of the call: it authenticates with the session
      // cookie, which is not sent cross-site by default.
      { withCredentials: true },
    )
    .then((response) => ({
      // The cookie is the only place the username appears - auth.pl reports
      // the account's flags, not its name.
      username: off.getUsername(),
      isModerator: response.data.user.moderator === 1,
    }))
    .catch(() => {
      // A rejected cookie and an unreachable OFF are indistinguishable here,
      // so drop the entry rather than cache the failure: a network blip would
      // otherwise pin the user to "signed out" until they log in again.
      if (cached?.cookie === cookie) cached = null;
      return null;
    });

  cached = { cookie, account };
  return account;
}

/**
 * Whether the OFF session cookie differs from the one the cached verdict was
 * derived from.
 *
 * Signing in and out both happen on Open Food Facts, so that cookie is the
 * only thing that can change who is signed in without this app doing anything
 * - and comparing it is free, where asking OFF is a cross-site round-trip.
 * Lets a caller that re-checks on a schedule (the login page, on every return
 * to the tab) re-check only when there is something new to ask about.
 */
export function sessionCookieChanged(): boolean {
  // No entry means nobody was signed in, which is the same state the reader
  // reports as an empty string - so normalise, or a signed-out visitor would
  // look like a change every single time.
  return (cached?.cookie ?? "") !== off.getCookie("session");
}

export const authProvider: AuthProvider = {
  login: async () => window.open(`${import.meta.env.VITE_PO_URL}/cgi/session.pl`, '_blank', 'popup'),
  // `params` is whatever the page asked for. Moderator rights are the default
  // because that is what every moderation screen needs; the public flag form
  // passes `moderatorOnly: false` (see AdminApp's SignedIn) to ask only that
  // somebody is signed in.
  checkAuth: async (params?: { moderatorOnly?: boolean }) => {
    const account = await loadAccount();
    // Rejecting triggers react-admin's logout + redirect, which defaults
    // to "/login" - already this app's real login route.
    if (!account) return Promise.reject();
    if (!params?.moderatorOnly) return;
    if (!account.isModerator) {
      // Signed in, just not allowed - which is a different answer from "log
      // in", so it gets its own page rather than the login form. `redirectTo`
      // overrides the default "/login"; `message: false` suppresses the error
      // notification, since the page it lands on says the same thing. Note
      // logout() still runs - see there for why the OFF session survives it.
      return Promise.reject({
        redirectTo: NOT_MODERATOR_ROUTE,
        message: false,
      });
    }
  },
  checkError: async (error) => {
    const status = error?.status;
    // 401 means wrong auth tokens.
    // For other 400 errors we just ignore it
    if (status !== 401) return;

    const account = await loadAccount()
    if (!account) {
      cached = null;
      return Promise.reject();
    }
  },
  logout: async (params?: { userInitiated?: boolean }) => {
    if (params?.userInitiated) {
      // Only an explicit "Logout" ends delete the cookie
      // In dev mode there is no cookie to drop - the session is whatever the
      // login page's switcher last picked, so signing out means going back to
      // the signed-out role.
      if (devMode) setDevRole("anonymous");
      else off.deleteCookie("session");
    }
    cached = null;
    return "/login";
  },
  getIdentity: async () => {
    const account = await loadAccount();
    // Rejecting leaves react-admin's user menu empty rather than labelling it
    // with a blank name, which is what the cookie yields when signed out.
    if (!account) return Promise.reject();
    return { id: account.username, fullName: account.username };
  },
  getPermissions: async () => {
    const account = await loadAccount();
    // Resolving (rather than rejecting) when signed out: getPermissions runs
    // on public routes too, and a rejection there is a redirect loop.
    return account?.isModerator ? "moderator" : "";
  },
};
