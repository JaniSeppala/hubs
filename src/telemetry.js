import Raven from "raven-js";
import configs from "./utils/configs";

let _paq = undefined;

export default function registerTelemetry(trackedPage, trackedTitle) {
  const sentryDsn = configs.SENTRY_DSN;

  if (!_paq) {
    _paq = window._paq = window._paq || [];
    _paq.push(["enableLinkTracking"]);
    (function () {
      const u = `//analytics.${window.location.origin.split("//")[1]}/`;
      console.log(`Tracking: initialize Matomo, ${u}`);
      _paq.push(["setTrackerUrl", u + "matomo.php"]);
      _paq.push(["setSiteId", "1"]);
      const d = document,
        g = d.createElement("script"),
        s = d.getElementsByTagName("script")[0];
      g.async = true;
      g.src = u + "matomo.js";
      s.parentNode.insertBefore(g, s);
    })();
  }

  if (sentryDsn) {
    console.log("Tracking: Sentry DSN: " + sentryDsn);
    Raven.config(sentryDsn).install();
  }

  const email = window.APP.store.state.credentials.email;
  window._paq.push(["setCustomUrl", trackedPage]);
  window._paq.push(["setDocumentTitle", trackedTitle]);
  if (email) {
    window._paq.push(["setUserId", email]);
  }
  console.log(`Tracking: Page View: ${trackedPage}, ${trackedTitle}`);
  window._paq.push(["trackPageView"]);
}
