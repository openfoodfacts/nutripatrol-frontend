import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "./analytics";

/**
 * Reports every route change to Matomo as a page view.
 *
 * Mounted next to the app rather than in react-admin's layout, so that it
 * also sees the public pages, which are rendered with `noLayout`. The first
 * render counts as well: index.html loads the tracker without recording a
 * page view of its own.
 */
export default function PageViewTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    trackPageView(pathname + search);
  }, [pathname, search]);

  return null;
}
