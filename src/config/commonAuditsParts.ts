export const groups = {
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
};

export const accessibilityAudits = [
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
  { id: "interactive-element-affordance", weight: 0, group: "accessibility" },
  { id: "managed-focus", weight: 0, group: "accessibility" },
  { id: "focus-traps", weight: 0, group: "accessibility" },
  { id: "custom-controls-labels", weight: 0, group: "accessibility" },
  { id: "custom-controls-roles", weight: 0, group: "accessibility" },
  { id: "visual-order-follows-dom", weight: 0, group: "accessibility" },
  { id: "offscreen-content-hidden", weight: 0, group: "accessibility" },
  { id: "use-landmarks", weight: 0, group: "accessibility" },
];

export const bestPracticeAudits = [
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
];

export const seoAudits = [
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
];

export const pwaAudits = [
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
];

export const errorHandling = {
  errorColumnTitles: [
    "Pagine nelle quali si sono verificati errori:",
    "Errori",
  ],
  errorMessage:
    "In almeno una delle pagine analizzate si sono verificati degli errori.",
  popupMessage:
    "Si sono verificati degli errori. Controlla la tabella sottostante per maggiori dettagli.",
  gotoRetryTentative: 3,
};

export const notExecutedErrorMessage =
  "I seguenti data-element necessari per condurre il test non sono stati trovati: <LIST>. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.";

export const minNumberOfServices = 10;
