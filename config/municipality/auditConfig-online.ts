import { municipalityGatherersFolder } from "../configFolderingConstants";
import { municipalityAuditsFolder } from "../configFolderingConstants";

import { commonGatherersFolder } from "../configFolderingConstants";
import { commonAuditsFolder } from "../configFolderingConstants";

module.exports = {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: ["modelCompliance", "recommendations"],
  },

  passes: [
    {
      gatherers: [
        municipalityGatherersFolder + "/security/domainNameCheckGatherer.js",

        municipalityGatherersFolder +
          "/ux-ui-consistency/fontsCheckGatherer.js",

        municipalityGatherersFolder +
          "/legislation/accessibilityDeclarationIsPresentGatherer.js",
        municipalityGatherersFolder + "/legislation/privacyGatherer.js",

        municipalityGatherersFolder +
          "/informationArchitecture/menuGatherer.js",

        commonGatherersFolder + "/legislation/cookieAmountCheckGatherer.js",
        commonGatherersFolder + "/legislation/cookieDomainCheckGatherer.js",

        commonGatherersFolder + "/security/certificateExpirationGatherer.js",
        commonGatherersFolder + "/security/httpsIsPresentGatherer.js",
        commonGatherersFolder + "/security/tlsCheckGatherer.js",
        commonGatherersFolder + "/security/ipLocationGatherer.js",
        commonGatherersFolder + "/security/cipherCheckGatherer.js",
        commonGatherersFolder +
          "/ux-ui-consistency/bootstrapItaliaCheckGatherer.js",
      ],
    },
  ],

  audits: [
    municipalityAuditsFolder + "/security/domainNameCheckAudit.js",

    municipalityAuditsFolder + "/ux-ui-consistency/fontsCheckAudit.js",
    municipalityAuditsFolder +
      "/ux-ui-consistency/bootstrapItaliaCheckAudit.js",

    municipalityAuditsFolder +
      "/legislation/accessibilityDeclarationIsPresentAudit.js",
    municipalityAuditsFolder + "/legislation/privacyAudit.js",

    municipalityAuditsFolder + "/informationArchitecture/menuAudit.js",

    commonAuditsFolder + "/legislation/cookieAmountCheckAudit.js",
    commonAuditsFolder + "/legislation/cookieDomainCheckAudit.js",

    commonAuditsFolder + "/security/certificateExpirationAudit.js",
    commonAuditsFolder + "/security/httpsIsPresentAudit.js",
    commonAuditsFolder + "/security/tlsCheckAudit.js",
    commonAuditsFolder + "/security/ipLocationAudit.js",
    commonAuditsFolder + "/security/cipherCheckAudit.js",
  ],

  groups: {
    "user-experience": {
      title: "Esperienza utente",
    },
    function: {
      title: "Funzionalità",
    },
    legislation: {
      title: "Normativa",
    },
    performance: {
      title: "Performance",
    },
    security: {
      title: "Sicurezza",
    },
    accessibility: {
      title: "Accessibilità",
    },
    "best-practice": {
      title: "Best Practice",
    },
    seo: {
      title: "SEO",
    },
    pwa: {
      title: "PWA",
    },
  },

  categories: {
    modelCompliance: {
      title: "Test di conformità al modello di sito comunale",
      description:
        "Il validatore mostra i risultati degli audit per i singoli parametri di conformità in riferimento all'allegato 2 dell'Avviso 1.4.1.",
      auditRefs: [
        /* CUSTOM AUDITS */
        {
          id: "municipality-ux-ui-consistency-fonts-check",
          weight: 100,
          group: "user-experience",
        },
        {
          id: "municipality-ux-ui-consistency-bootstrap-italia-check",
          weight: 100,
          group: "user-experience",
        },
        {
          id: "municipality-menu-structure-match-model",
          weight: 100,
          group: "user-experience",
        },
        {
          id: "common-legislation-cookie-amount-check",
          weight: 100,
          group: "legislation",
        },
        {
          id: "common-legislation-cookie-domain-check",
          weight: 100,
          group: "legislation",
        },
        {
          id: "municipality-legislation-accessibility-declaration-is-present",
          weight: 100,
          group: "legislation",
        },
        {
          id: "municipality-legislation-privacy-is-present",
          weight: 100,
          group: "legislation",
        },
        {
          id: "common-security-https-is-present",
          weight: 100,
          group: "security",
        },
        {
          id: "common-security-certificate-expiration",
          weight: 100,
          group: "security",
        },
        { id: "common-security-tls-check", weight: 100, group: "security" },
        { id: "common-security-cipher-check", weight: 100, group: "security" },
        {
          id: "municipality-security-domain-name-check",
          weight: 100,
          group: "security",
        },

        /* LIGHTHOUSE CORE PERFORMANCE AUDITS */
        { id: "first-contentful-paint", weight: 10, group: "performance" },
        { id: "interactive", weight: 10, group: "performance" },
        { id: "speed-index", weight: 10, group: "performance" },
        { id: "total-blocking-time", weight: 30, group: "performance" },
        { id: "largest-contentful-paint", weight: 25, group: "performance" },
        { id: "cumulative-layout-shift", weight: 15, group: "performance" },
        { id: "max-potential-fid", weight: 0, group: "performance" },
        { id: "first-meaningful-paint", weight: 0, group: "performance" },
        { id: "render-blocking-resources", weight: 0, group: "performance" },
        { id: "uses-responsive-images", weight: 0, group: "performance" },
        { id: "offscreen-images", weight: 0, group: "performance" },
        { id: "unminified-css", weight: 0, group: "performance" },
        { id: "unminified-javascript", weight: 0, group: "performance" },
        { id: "unused-css-rules", weight: 0, group: "performance" },
        { id: "unused-javascript", weight: 0, group: "performance" },
        { id: "uses-optimized-images", weight: 0, group: "performance" },
        { id: "modern-image-formats", weight: 0, group: "performance" },
        { id: "uses-text-compression", weight: 0, group: "performance" },
        { id: "uses-rel-preconnect", weight: 0, group: "performance" },
        { id: "server-response-time", weight: 0, group: "performance" },
        { id: "redirects", weight: 0, group: "performance" },
        { id: "uses-rel-preload", weight: 0, group: "performance" },
        { id: "uses-http2", weight: 0, group: "performance" },
        { id: "efficient-animated-content", weight: 0, group: "performance" },
        { id: "duplicated-javascript", weight: 0, group: "performance" },
        { id: "legacy-javascript", weight: 0, group: "performance" },
        { id: "preload-lcp-image", weight: 0, group: "performance" },
        { id: "total-byte-weight", weight: 0, group: "performance" },
        { id: "uses-long-cache-ttl", weight: 0, group: "performance" },
        { id: "dom-size", weight: 0, group: "performance" },
        { id: "critical-request-chains", weight: 0, group: "performance" },
        { id: "user-timings", weight: 0, group: "performance" },
        { id: "bootup-time", weight: 0, group: "performance" },
        { id: "mainthread-work-breakdown", weight: 0, group: "performance" },
        { id: "font-display", weight: 0, group: "performance" },
        { id: "resource-summary", weight: 0, group: "performance" },
        { id: "third-party-summary", weight: 0, group: "performance" },
        { id: "third-party-facades", weight: 0, group: "performance" },
        {
          id: "largest-contentful-paint-element",
          weight: 0,
          group: "performance",
        },
        { id: "lcp-lazy-loaded", weight: 0, group: "performance" },
        { id: "layout-shift-elements", weight: 0, group: "performance" },
        { id: "uses-passive-event-listeners", weight: 0, group: "performance" },
        { id: "no-document-write", weight: 0, group: "performance" },
        { id: "long-tasks", weight: 0, group: "performance" },
        { id: "non-composited-animations", weight: 0, group: "performance" },
        { id: "unsized-images", weight: 0, group: "performance" },
        { id: "viewport", weight: 0, group: "performance" },
        { id: "no-unload-listeners", weight: 0, group: "performance" },
        { id: "performance-budget", weight: 0, group: "performance" },
        { id: "timing-budget", weight: 0, group: "performance" },
        { id: "network-requests", weight: 0, group: "performance" },
        { id: "network-rtt", weight: 0, group: "performance" },
        { id: "network-server-latency", weight: 0, group: "performance" },
        { id: "main-thread-tasks", weight: 0, group: "performance" },
        { id: "diagnostics", weight: 0, group: "performance" },
        { id: "metrics", weight: 0, group: "performance" },
        { id: "screenshot-thumbnails", weight: 0, group: "performance" },
        { id: "final-screenshot", weight: 0, group: "performance" },
        { id: "script-treemap-data", weight: 0, group: "performance" },
      ],
    },

    recommendations: {
      title:
        "Raccomandazioni progettuali al modello di sito comunale e altri test",
      description:
        "Il validatore mostra i risultati degli audit per le raccomandazioni in riferimento all'allegato 2 dell'Avviso 1.4.1. A questi sono aggiunti ulteriori test per facilitare le attività di sviluppo e garantire un buon risultato.",
      auditRefs: [
        /* CUSTOM AUDITS */
        { id: "common-security-ip-location", weight: 100 },

        /* LIGHTHOUSE CORE ACCESSIBILITY AUDITS */
        { id: "accesskeys", weight: 3, group: "accessibility" },
        { id: "aria-allowed-attr", weight: 10, group: "accessibility" },
        { id: "aria-command-name", weight: 3, group: "accessibility" },
        { id: "aria-hidden-body", weight: 10, group: "accessibility" },
        { id: "aria-hidden-focus", weight: 3, group: "accessibility" },
        { id: "aria-input-field-name", weight: 3, group: "accessibility" },
        { id: "aria-meter-name", weight: 3, group: "accessibility" },
        { id: "aria-progressbar-name", weight: 3, group: "accessibility" },
        { id: "aria-required-attr", weight: 10, group: "accessibility" },
        { id: "aria-required-children", weight: 10, group: "accessibility" },
        { id: "aria-required-parent", weight: 10, group: "accessibility" },
        { id: "aria-roles", weight: 10, group: "accessibility" },
        { id: "aria-toggle-field-name", weight: 3, group: "accessibility" },
        { id: "aria-tooltip-name", weight: 3, group: "accessibility" },
        { id: "aria-treeitem-name", weight: 3, group: "accessibility" },
        { id: "aria-valid-attr-value", weight: 10, group: "accessibility" },
        { id: "aria-valid-attr", weight: 10, group: "accessibility" },
        { id: "button-name", weight: 10, group: "accessibility" },
        { id: "bypass", weight: 3, group: "accessibility" },
        { id: "color-contrast", weight: 3, group: "a11y-color-contrast" },
        { id: "definition-list", weight: 3, group: "accessibility" },
        { id: "dlitem", weight: 3, group: "accessibility" },
        { id: "document-title", weight: 3, group: "accessibility" },
        { id: "duplicate-id-active", weight: 3, group: "accessibility" },
        { id: "duplicate-id-aria", weight: 10, group: "accessibility" },
        { id: "form-field-multiple-labels", weight: 2, group: "accessibility" },
        { id: "frame-title", weight: 3, group: "accessibility" },
        { id: "heading-order", weight: 2, group: "accessibility" },
        { id: "html-has-lang", weight: 3, group: "accessibility" },
        { id: "html-lang-valid", weight: 3, group: "accessibility" },
        { id: "image-alt", weight: 10, group: "accessibility" },
        { id: "input-image-alt", weight: 10, group: "accessibility" },
        { id: "label", weight: 10, group: "accessibility" },
        { id: "link-name", weight: 3, group: "accessibility" },
        { id: "list", weight: 3, group: "accessibility" },
        { id: "listitem", weight: 3, group: "accessibility" },
        { id: "meta-refresh", weight: 10, group: "accessibility" },
        { id: "meta-viewport", weight: 10, group: "accessibility" },
        { id: "object-alt", weight: 3, group: "accessibility" },
        { id: "tabindex", weight: 3, group: "accessibility" },
        { id: "td-headers-attr", weight: 3, group: "accessibility" },
        { id: "th-has-data-cells", weight: 3, group: "accessibility" },
        { id: "valid-lang", weight: 3, group: "accessibility" },
        { id: "video-caption", weight: 10, group: "accessibility" },
        { id: "logical-tab-order", weight: 0, group: "accessibility" },
        { id: "focusable-controls", weight: 0, group: "accessibility" },
        {
          id: "interactive-element-affordance",
          weight: 0,
          group: "accessibility",
        },
        { id: "managed-focus", weight: 0, group: "accessibility" },
        { id: "focus-traps", weight: 0, group: "accessibility" },
        { id: "custom-controls-labels", weight: 0, group: "accessibility" },
        { id: "custom-controls-roles", weight: 0, group: "accessibility" },
        { id: "visual-order-follows-dom", weight: 0, group: "accessibility" },
        { id: "offscreen-content-hidden", weight: 0, group: "accessibility" },
        { id: "use-landmarks", weight: 0, group: "accessibility" },

        /* LIGHTHOUSE CORE BEST PRACTICE AUDITS */
        { id: "is-on-https", weight: 1, group: "best-practice" },
        { id: "geolocation-on-start", weight: 1, group: "best-practice" },
        { id: "notification-on-start", weight: 1, group: "best-practice" },
        { id: "no-vulnerable-libraries", weight: 1, group: "best-practice" },
        { id: "csp-xss", weight: 0, group: "best-practice" },
        {
          id: "password-inputs-can-be-pasted-into",
          weight: 1,
          group: "best-practice",
        },
        { id: "image-aspect-ratio", weight: 1, group: "best-practice" },
        { id: "image-size-responsive", weight: 1, group: "best-practice" },
        { id: "preload-fonts", weight: 1, group: "best-practice" },
        { id: "doctype", weight: 1, group: "best-practice" },
        { id: "charset", weight: 1, group: "best-practice" },
        { id: "js-libraries", weight: 0, group: "best-practice" },
        { id: "deprecations", weight: 1, group: "best-practice" },
        { id: "errors-in-console", weight: 1, group: "best-practice" },
        { id: "valid-source-maps", weight: 0, group: "best-practice" },
        { id: "inspector-issues", weight: 1, group: "best-practice" },

        /* LIGHTHOUSE CORE SEO AUDITS */
        { id: "viewport", weight: 1, group: "seo" },
        { id: "document-title", weight: 1, group: "seo" },
        { id: "meta-description", weight: 1, group: "seo" },
        { id: "http-status-code", weight: 1, group: "seo" },
        { id: "link-text", weight: 1, group: "seo" },
        { id: "crawlable-anchors", weight: 1, group: "seo" },
        { id: "is-crawlable", weight: 1, group: "seo" },
        { id: "robots-txt", weight: 1, group: "seo" },
        { id: "image-alt", weight: 1, group: "seo" },
        { id: "hreflang", weight: 1, group: "seo" },
        { id: "canonical", weight: 1, group: "seo" },
        { id: "font-size", weight: 1, group: "seo" },
        { id: "plugins", weight: 1, group: "seo" },
        { id: "tap-targets", weight: 1, group: "seo" },
        { id: "structured-data", weight: 0, group: "seo" },

        /* LIGHTHOUSE CORE PWA AUDITS */
        { id: "installable-manifest", weight: 2, group: "pwa" },
        { id: "service-worker", weight: 1, group: "pwa" },
        { id: "splash-screen", weight: 1, group: "pwa" },
        { id: "themed-omnibox", weight: 1, group: "pwa" },
        { id: "content-width", weight: 1, group: "pwa" },
        { id: "viewport", weight: 2, group: "pwa" },
        { id: "apple-touch-icon", weight: 1, group: "pwa" },
        { id: "maskable-icon", weight: 1, group: "pwa" },
        { id: "pwa-cross-browser", weight: 0, group: "pwa" },
        { id: "pwa-page-transitions", weight: 0, group: "pwa" },
        { id: "pwa-each-page-has-url", weight: 0, group: "pwa" },
      ],
    },
  },
};
