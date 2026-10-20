import Raven from "raven-js";
import configs from "./utils/configs";

let userId = undefined;

function initializeTracking() {
  window._paq = window._paq || [];
  (function () {
    //const u = `//analytics.${window.location.origin.split("//")[1]}/`;
    const u = `//analytics.oppiversumi.online/`;
    console.log(`Tracking: Initialize Matomo`);
    window._paq.push(["setTrackerUrl", u + "matomo.php"]);
    window._paq.push(["setSiteId", "1"]);
    const d = document,
      g = d.createElement("script"),
      s = d.getElementsByTagName("script")[0];
    g.async = true;
    g.src = u + "matomo.js";
    s.parentNode.insertBefore(g, s);
  })();
}

function trackLoginEvents() {
  const email = window.APP.store.state.credentials.email;
  if (userId) {
    if (email == null) {
      console.log("Tracking: Logout");
      window._paq.push(["resetUserId"]);
      trackEvent("Authentication", "Logout", userId);
      userId = undefined;
    }
  } else if (email && email.includes("@")) {
    console.log("Tracking: Login");
    window._paq.push(["setUserId"]);
    userId = email;
    trackEvent("Authentication", "Login", userId);
  }
}

function trackPageView() {
  if (window.APP) {
    console.log("Tracking: Found APP");
    const email = window.APP.store.state.credentials.email;
    if (email && email.includes("@")) {
      console.log("Tracking: Found Email");
      window._paq.push(["setUserId", email]);
      userId = email;
    } else if (userId !== undefined) {
      window._paq.push(["resetUserId"]);
      userId = undefined;
    }
    window._paq.push(["trackPageView"]);
    window._paq.push(["enableLinkTracking"]);
    window._paq.push(["enableHeartBeatTimer"]);
    window.APP.store.addEventListener("statechanged", trackLoginEvents);
  } else {
    console.log("Tracking: Waiting for APP");
    setTimeout(trackPageView, 500);
  }
}

export default function registerTelemetry(trackedPage, trackedTitle) {
  const sentryDsn = configs.SENTRY_DSN;

  trackedTitle = "Hubs - " + trackedTitle;

  if (!window._paq) {
    initializeTracking();
  }

  if (sentryDsn) {
    console.log("Tracking: Sentry DSN: " + sentryDsn);
    Raven.config(sentryDsn).install();
  }
  console.log(`Tracking: Page View: ${trackedPage}, ${trackedTitle}`);
  window._paq.push(["setDocumentTitle", trackedTitle]);
  trackPageView(trackedTitle);
}

export function trackEvent(category, action, name, value) {
  if (window._paq) {
    if (window.APP) {
      console.log("Tracking: Found APP");
      const email = window.APP.store.state.credentials.email;
      if (email && email.includes("@")) {
        console.log("Tracking: Found Email");
        window._paq.push(["setUserId", email]);
      }
    }

    console.log(`Tracking: Event: ${category}/${action}`);
    if (typeof value == "number") {
      window._paq.push(["trackEvent", `${category}`, `${action}`, `${name}`, value]);
    } else {
      window._paq.push(["trackEvent", `${category}`, `${action}`, `${name}`]);
    }
  }
}
