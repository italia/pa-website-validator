import {
  schoolGatherersFolder,
  schoolAuditsFolder,
  commonGatherersFolder,
  commonAuditsFolder,
} from "../configFolderingConstants";

import {
  groups,
  performanceAudits,
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
    id: "school-controlled-vocabularies",
    weight: 100,
    group: "user-experience",
  },
];

const customReccomendationsAudits = [
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
    onlyCategories: ["modelCompliance", "recommendations", "customPerformance"],
  },

  passes: [
    {
      gatherers: [
        schoolGatherersFolder + "/ux-ui-consistency/fontsCheckGatherer.js",
        schoolGatherersFolder +
          "/ux-ui-consistency/themeVersionCheckGatherer.js",
        schoolGatherersFolder +
          "/ux-ui-consistency/bootstrapItaliaWPCheckGatherer.js",

        schoolGatherersFolder +
          "/legislation/accessibilityDeclarationIsPresentGatherer.js",
        schoolGatherersFolder + "/legislation/privacyGatherer.js",

        schoolGatherersFolder + "/informationArchitecture/menuGatherer.js",
        schoolGatherersFolder +
          "/informationArchitecture/menuScuolaSecondLevelGatherer.js",
        schoolGatherersFolder +
          "/informationArchitecture/controlledVocabulariesGatherer.js",

        commonGatherersFolder +
          "/ux-ui-consistency/bootstrapItaliaCheckGatherer.js",
      ],
    },
  ],

  audits: [
    schoolAuditsFolder + "/ux-ui-consistency/fontsCheckAudit.js",
    schoolAuditsFolder + "/ux-ui-consistency/themeVersionCheckAudit.js",
    schoolAuditsFolder +
      "/ux-ui-consistency/bootstrapItaliaDoubleCheckAudit.js",

    schoolAuditsFolder +
      "/legislation/accessibilityDeclarationIsPresentAudit.js",
    schoolAuditsFolder + "/legislation/privacyAudit.js",

    schoolAuditsFolder + "/informationArchitecture/menuAudit.js",
    schoolAuditsFolder +
      "/informationArchitecture/menuScuolaSecondLevelAudit.js",
    schoolAuditsFolder +
      "/informationArchitecture/controlledVocabulariesAudit.js",

    schoolAuditsFolder + "/informative/reuseAudit.js",
    schoolAuditsFolder + "/informative/licenseAndAttributionAudit.js",
    schoolAuditsFolder + "/informative/cloudInfrastructureAudit.js",
  ],

  groups: groups,

  categories: {
    modelCompliance: {
      title: "Test di conformità al modello di sito scuole",
      description:
        "Il validatore mostra i risultati degli audit per i singoli parametri di conformità in riferimento all'Allegato 2 dell' [Avviso 1.4.1](https://areariservata.padigitale2026.gov.it/Pa_digitale2026_dettagli_avviso?id=a017Q00000dk82wQAA#allegati).",
      auditRefs: [...customModelComplianceAudits],
    },

    recommendations: {
      title:
        "Raccomandazioni progettuali e test aggiuntivi",
      description:
        "Il validatore mostra i risultati degli audit per le raccomandazioni in riferimento all'Allegato 2 dell' [Avviso 1.4.1](https://areariservata.padigitale2026.gov.it/Pa_digitale2026_dettagli_avviso?id=a017Q00000dk82wQAA#allegati). A questi sono aggiunti ulteriori test per facilitare le attività di sviluppo e garantire un buon risultato.",
      auditRefs: [
        ...customReccomendationsAudits,
        ...accessibilityAudits,
        ...bestPracticeAudits,
        ...seoAudits,
        ...pwaAudits,
      ],
    },

    customPerformance: {
      title: "Raccomandazione progettuale: Velocità e tempi di risposta",
      description:
        'Nel caso in cui il sito presenti livelli di prestazioni inferiori a 50, la scuola deve pubblicare sul sito della scuola un "Piano di miglioramento del sito" che mostri, per ciascuna voce che impatta negativamente la performance, le azioni future di miglioramento della performance stessa, e le relative tempistiche di realizzazione attese. RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Scuole.](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/v2022.1/index.html), [LIGHTHOUSE performance scoring guide](https://web.dev/performance-scoring/)',
      auditRefs: [...performanceAudits],
    },
  },
};
