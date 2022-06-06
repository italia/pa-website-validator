import {
  municipalityGatherersFolder,
  municipalityAuditsFolder,
  commonGatherersFolder,
  commonAuditsFolder
} from "../configFolderingConstants";

import {
  groups,
  performanceAudits,
  accessibilityAudits,
  bestPracticeAudits,
  seoAudits,
  pwaAudits
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
]
const customReccomendationsAudits = [
  { id: "common-security-ip-location", weight: 100 }
]

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

  groups: groups,

  categories: {
    modelCompliance: {
      title: "Test di conformità al modello di sito comunale",
      description:
        "Il validatore mostra i risultati degli audit per i singoli parametri di conformità in riferimento all'allegato 2 dell'Avviso 1.4.1.",
      auditRefs: [...customModelComplianceAudits, ...performanceAudits],
    },

    recommendations: {
      title:
        "Raccomandazioni progettuali al modello di sito comunale e altri test",
      description:
        "Il validatore mostra i risultati degli audit per le raccomandazioni in riferimento all'allegato 2 dell'Avviso 1.4.1. A questi sono aggiunti ulteriori test per facilitare le attività di sviluppo e garantire un buon risultato.",
      auditRefs: [...customReccomendationsAudits, ...accessibilityAudits, ...bestPracticeAudits, ...seoAudits, ...pwaAudits],
    },
  },
};
