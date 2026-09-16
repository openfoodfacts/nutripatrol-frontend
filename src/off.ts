const offService = {
  // Get cookie by name return empty string if not found
  getCookie(name: any) {
      const cookies = document.cookie
          .split(";")
          .filter((item) => item.trim().startsWith(`${name}=`));
      if (cookies.length) {
          const cookie = cookies[0];
          return cookie.split("=", 2)[1];
      }
      return "";
  },

  // Deleting a cookie means re-setting it expired, and the browser only
  // considers it the same cookie when the name, the path AND the domain all
  // match. Open Food Facts sets `session` on the registrable domain
  // (openfoodfacts.org) so that every OFF host shares it - including this one -
  // so an expiry that names no domain does not touch it: it creates, then
  // immediately drops, a host-only cookie of the same name, and the shared one
  // survives. Hence the walk up the host's own domains: only the one the cookie
  // was actually set on has any effect, and setting a cookie for a domain the
  // page is not under is ignored, so the rest cost nothing.
  deleteCookie(name: any) {
      const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      // Host-only, which is the only kind there is on localhost.
      document.cookie = `${expired};`;

      const labels = window.location.hostname.split(".");
      // Stops at two labels: a single one is either a public suffix ("org"),
      // which browsers refuse, or a host like "localhost", already covered.
      for (let i = 0; i < labels.length - 1; i += 1) {
          const domain = labels.slice(i).join(".");
          document.cookie = `${expired}; domain=${domain};`;
          // The leading dot is how the cookie's domain used to be spelled; it
          // is equivalent under RFC 6265 but not every browser normalises it.
          document.cookie = `${expired}; domain=.${domain};`;
      }
  },

  // Get user id from cookie return empty string if not found
  getUsername() {
    const sessionCookie = this.getCookie("session");

    if (!sessionCookie.length) {
      return "";
    }

    let isNext = false;
    let username = "";
    sessionCookie.split("&").forEach((el) => {
      if (el === "user_id") {
        isNext = true;
      } else if (isNext) {
        username = el;
        isNext = false;
      }
    });
    return username;
  },
};

export default offService;