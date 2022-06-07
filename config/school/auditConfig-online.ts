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
  { id: "common-security-https-is-present", weight: 100, group: "legislation" },
  {
    id: "common-security-certificate-expiration",
    weight: 100,
    group: "security",
  },
  { id: "common-security-tls-check", weight: 100, group: "security" },
  { id: "common-security-cipher-check", weight: 100, group: "security" },
  { id: "school-security-domain-name-check", weight: 100, group: "security" },
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
];

module.exports = {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: ["modelCompliance", "recommendations"],
  },

  passes: [
    {
      gatherers: [
        schoolGatherersFolder + "/security/domainNameCheckGatherer.js",

        schoolGatherersFolder + "/ux-ui-consistency/fontsCheckGatherer.js",
        schoolGatherersFolder +
          "/ux-ui-consistency/bootstrapItaliaWPCheckGatherer.js",
        schoolGatherersFolder +
          "/ux-ui-consistency/themeVersionCheckGatherer.js",

        schoolGatherersFolder +
          "/legislation/accessibilityDeclarationIsPresentGatherer.js",
        schoolGatherersFolder + "/legislation/privacyGatherer.js",

        schoolGatherersFolder + "/informationArchitecture/menuGatherer.js",
        schoolGatherersFolder +
          "/informationArchitecture/menuScuolaSecondLevelGatherer.js",
        schoolGatherersFolder + "/informationArchitecture/serviziGatherer.js",
        schoolGatherersFolder +
          "/informationArchitecture/controlledVocabulariesGatherer.js",

        commonGatherersFolder +
          "/ux-ui-consistency/bootstrapItaliaCheckGatherer.js",

        commonGatherersFolder + "/legislation/cookieDomainCheckGatherer.js",

        commonGatherersFolder + "/security/certificateExpirationGatherer.js",
        commonGatherersFolder + "/security/httpsIsPresentGatherer.js",
        commonGatherersFolder + "/security/tlsCheckGatherer.js",
        commonGatherersFolder + "/security/ipLocationGatherer.js",
        commonGatherersFolder + "/security/cipherCheckGatherer.js",
      ],
    },
  ],

  audits: [
    schoolAuditsFolder + "/security/domainNameCheckAudit.js",

    schoolAuditsFolder + "/ux-ui-consistency/fontsCheckAudit.js",
    schoolAuditsFolder +
      "/ux-ui-consistency/bootstrapItaliaDoubleCheckAudit.js",
    schoolAuditsFolder + "/ux-ui-consistency/themeVersionCheckAudit.js",

    schoolAuditsFolder +
      "/legislation/accessibilityDeclarationIsPresentAudit.js",
    schoolAuditsFolder + "/legislation/privacyAudit.js",

    schoolAuditsFolder + "/informationArchitecture/menuAudit.js",
    schoolAuditsFolder +
      "/informationArchitecture/menuScuolaSecondLevelAudit.js",
    schoolAuditsFolder + "/informationArchitecture/serviziAudit.js",
    schoolAuditsFolder +
      "/informationArchitecture/controlledVocabulariesAudit.js",

    commonAuditsFolder + "/legislation/cookieDomainCheckAudit.js",

    commonAuditsFolder + "/security/certificateExpirationAudit.js",
    commonAuditsFolder + "/security/httpsIsPresentAudit.js",
    commonAuditsFolder + "/security/tlsCheckAudit.js",
    commonAuditsFolder + "/security/ipLocationAudit.js",
    commonAuditsFolder + "/security/cipherCheckAudit.js",
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
