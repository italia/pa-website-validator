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

const customReccomendationsAudits: [] = [];

module.exports = {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: ["modelCompliance", "recommendations"],
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
  ],

  groups: groups,

  categories: {
    modelCompliance: {
      title: "Test di conformità al modello di sito scuole",
      description:
        "Il validatore mostra i risultati degli audit per i singoli parametri di conformità in riferimento all'allegato 2 dell'Avviso 1.4.1.",
      auditRefs: [...customModelComplianceAudits, ...performanceAudits],
    },

    recommendations: {
      title:
        "Raccomandazioni progettuali al modello di sito per le scuole e altri test",
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
  },
};
