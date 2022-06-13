import {
  municipalityGatherersFolder,
  municipalityAuditsFolder,
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
    id: "common-security",
    weight: 100,
    group: "security",
  }
];
const customReccomendationsAudits = [
  { id: "common-security-ip-location", weight: 100 },
];

module.exports = {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: ["modelCompliance", "recommendations", "performance"],
  },

  passes: [
    {
      gatherers: [
        municipalityGatherersFolder + "/fontsCheckGatherer.js",
        commonGatherersFolder + "/originGatherer.js",
        commonGatherersFolder + "/bootstrapItaliaCheckGatherer.js",
        commonGatherersFolder + "/hostnameGatherer.js",
      ],
    },
  ],

  audits: [
    municipalityAuditsFolder + "/domainNameCheckAudit.js",

    municipalityAuditsFolder + "/fontsCheckAudit.js",
    municipalityAuditsFolder +
      "/bootstrapItaliaCheckAudit.js",

    municipalityAuditsFolder +
      "/accessibilityDeclarationIsPresentAudit.js",
    municipalityAuditsFolder + "/privacyAudit.js",

    municipalityAuditsFolder + "/menuAudit.js",

    commonAuditsFolder + "/cookieDomainCheckAudit.js",

    commonAuditsFolder + "/securityAudit.js",
    commonAuditsFolder + "/ipLocationAudit.js",
  ],

  groups: groups,

  categories: {
    modelCompliance: {
      title: "Test di conformità al modello di sito comunale",
      description:
        "Il validatore mostra i risultati degli audit per i singoli parametri di conformità in riferimento all'allegato 2 dell'Avviso 1.4.1.",
      auditRefs: [...customModelComplianceAudits],
    },

    recommendations: {
      title:
        "Raccomandazioni progettuali al modello di sito comunale e altri test",
      description:
        "Il validatore mostra i risultati degli audit per le raccomandazioni in riferimento all'allegato 2 dell'Avviso 1.4.1. A questi sono aggiunti ulteriori test per facilitare le attività di sviluppo e garantire un buon risultato.",
      auditRefs: [
        ...customReccomendationsAudits,
        ...accessibilityAudits,
        ...bestPracticeAudits,
        ...seoAudits,
        ...pwaAudits,
      ],
    },

    performance: {
      title: "Raccomandazione progettuale: Velocità e tempi di risposta",
      description: "Nel caso in cui il sito presenti livelli di prestazioni inferiori a 50, la scuola deve pubblicare sul sito della scuola un \"Piano di miglioramento del sito\" che mostri, per ciascuna voce che impatta negativamente la performance, le azioni future di miglioramento della performance stessa, e le relative tempistiche di realizzazione attese. RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Scuole.](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/v2022.1/index.html), [LIGHTHOUSE performance scoring guide](https://web.dev/performance-scoring/)"
    }
  },
};
