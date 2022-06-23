import {
  schoolAuditsFolder,
  commonGatherersFolder,
  commonAuditsFolder,
} from "../configFolderingConstants";

import {
  groups,
  accessibilityAudits,
  bestPracticeAudits,
  seoAudits,
  pwaAudits,
} from "../commonAuditsParts";

const customModelComplianceAudits = [
  {
    id: "school-ux-ui-consistency-fonts-check",
    weight: 100,
    group: "user-experience",
  },
  {
    id: "school-ux-ui-consistency-bootstrap-italia-double-check",
    weight: 100,
    group: "user-experience",
  },
  {
    id: "school-ux-ui-consistency-theme-version-check",
    weight: 100,
    group: "user-experience",
  },
  {
    id: "school-menu-structure-match-model",
    weight: 100,
    group: "user-experience",
  },
  {
    id: "school-menu-scuola-second-level-structure-match-model",
    weight: 100,
    group: "user-experience",
  },
  {
    id: "common-legislation-cookie-domain-check",
    weight: 100,
    group: "legislation",
  },
  {
    id: "school-legislation-accessibility-declaration-is-present",
    weight: 100,
    group: "legislation",
  },
  {
    id: "school-legislation-privacy-is-present",
    weight: 100,
    group: "legislation",
  },
  {
    id: "common-security",
    weight: 100,
    group: "security",
  },
];
const customReccomendationsAudits = [
  {
    id: "school-servizi-structure-match-model",
    weight: 100,
    group: "user-experience",
  },
  {
    id: "school-controlled-vocabularies",
    weight: 100,
    group: "user-experience",
  },
  { id: "common-security-ip-location", weight: 100, group: "security" },
  { id: "school-informative-reuse", weight: 100, group: "legislation" },
  {
    id: "school-informative-license-and-attribution",
    weight: 100,
    group: "legislation",
  },
  {
    id: "school-informative-cloud-infrastructure",
    weight: 100,
    group: "legislation",
  },
];

module.exports = {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: ["modelCompliance", "recommendations", "additionalTests", "performance"],
  },

  passes: [
    {
      gatherers: [
        commonGatherersFolder + "/bootstrapItaliaCheckGatherer.js",
        commonGatherersFolder + "/bootstrapItaliaSelectorCheckGatherer.js",
        commonGatherersFolder + "/originGatherer.js",
        commonGatherersFolder + "/hostnameGatherer.js",
      ],
    },
  ],

  audits: [
    schoolAuditsFolder + "/fontsCheckAudit.js",
    schoolAuditsFolder + "/themeVersionCheckAudit.js",

    schoolAuditsFolder + "/accessibilityDeclarationIsPresentAudit.js",
    schoolAuditsFolder + "/privacyAudit.js",

    schoolAuditsFolder + "/menuAudit.js",
    schoolAuditsFolder + "/menuScuolaSecondLevelAudit.js",
    schoolAuditsFolder + "/serviziAudit.js",
    schoolAuditsFolder + "/controlledVocabulariesAudit.js",

    schoolAuditsFolder + "/reuseAudit.js",
    schoolAuditsFolder + "/licenseAndAttributionAudit.js",
    schoolAuditsFolder + "/cloudInfrastructureAudit.js",

    commonAuditsFolder + "/cookieDomainCheckAudit.js",
    commonAuditsFolder + "/bootstrapItaliaDoubleCheckAudit.js",
    commonAuditsFolder + "/securityAudit.js",
    commonAuditsFolder + "/ipLocationAudit.js",
  ],

  groups: groups,

  categories: {
    modelCompliance: {
      title: "Criteri di conformità",
      description:
        "Vengono mostrati i risultati degli audit, relativi ad alcuni dei criteri di conformità, in riferimento all'[Allegato 2 dell'Avviso 1.4.1](https://areariservata.padigitale2026.gov.it/Pa_digitale2026_dettagli_avviso?id=a017Q00000dk82wQAA#allegati).",
      auditRefs: [...customModelComplianceAudits],
    },

    recommendations: {
      title: "Raccomandazioni progettuali",
      description:
        "Vengono mostrati i risultati degli audit, relativi ad alcune delle raccomandazioni progettuali, in riferimento all'[Allegato 2 dell'Avviso 1.4.1](https://areariservata.padigitale2026.gov.it/Pa_digitale2026_dettagli_avviso?id=a017Q00000dk82wQAA#allegati). A questi sono aggiunti ulteriori test per facilitare le attività di sviluppo e garantire un buon risultato.",
      auditRefs: [...customReccomendationsAudits],
    },

    additionalTests: {
      title: "Test aggiuntivi",
      description: "Vengono mostrati i risultati di test aggiuntivi di Lighthouse utili a facilitare le attività di sviluppo e garantire un buon risultato.",
      auditRefs: [
        ...accessibilityAudits,
        ...bestPracticeAudits,
        ...seoAudits,
        ...pwaAudits,
      ],
    },

    performance: {
      title: "Raccomandazioni progettuali: Velocità e tempi di risposta",
      description:
        "Nel caso in cui il sito presenti livelli di prestazioni (media pesata di 6 metriche standard) inferiori a 50 secondo quanto calcolato e verificato tramite le librerie Lighthouse, la scuola deve pubblicare sul sito un “Piano di miglioramento del sito” che mostri, per ciascuna delle 6 metriche che impatta negativamente le prestazioni, le azioni future di miglioramento e le relative tempistiche di realizzazione attese; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Scuole.](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/v2022.1/index.html)",
    },
  },
};
