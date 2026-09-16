import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { saveReturnUrl } from "./utils/url";
import { trackPageView } from "./analytics.ts";
import { AdminApp } from "./admin/AdminApp.tsx";

/**
 * Everything below this point is routed by react-admin - see AdminApp for the
 * route table. What is left here is the two things that have to happen once,
 * above the router, for the whole app.
 */
export default function App() {
  const location = useLocation();

  // Matomo only counts full page loads on its own, so client-side navigation
  // has to be reported by hand.
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  // Where the user came from is only knowable from the URL the app was loaded
  // with; ThanksPage reads it back several navigations later, so it has to be
  // captured before the first one.
  useEffect(() => {
    saveReturnUrl();
  }, []);

  return <AdminApp />;
}
