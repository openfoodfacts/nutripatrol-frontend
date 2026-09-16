import type { AuthProvider } from "react-admin";
import off from "../off.ts";


export const authProvider: AuthProvider = {
  login: async () => window.open(`${import.meta.env.VITE_PO_URL}/cgi/session.pl`, '_blank', 'popup'),
  checkAuth: () => Promise.resolve(),
  checkError: (error) => {
    const status = error?.status;
    if (status === 401 || status === 403) {
      // Rejecting triggers react-admin's logout + redirect, which defaults
      // to "/login" - already this app's real login route.
      return Promise.reject();
    }
    return Promise.resolve();
  },
  logout: () => {
    off.deleteCookie("session");
    return Promise.resolve("/login");
  },
  getIdentity: () =>
    Promise.resolve({ id: off.getUsername(), fullName: off.getUsername() }),
};
