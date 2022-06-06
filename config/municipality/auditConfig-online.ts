import { municipalityGatherersFolder } from "../configFolderingConstants";
import { municipalityAuditsFolder } from "../configFolderingConstants";

import { commonGatherersFolder } from "../configFolderingConstants";
import { commonAuditsFolder } from "../configFolderingConstants";

module.exports = {
  extends: "lighthouse:default",
  settings: {},

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
      ],
    },
  ],

  audits: [
    municipalityAuditsFolder + "/security/domainNameCheckAudit.js",

    municipalityAuditsFolder + "/ux-ui-consistency/fontsCheckAudit.js",

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

  categories: {
    security: {
      title: "Test di sicurezza",
      description: "Lista degli audit di sicurezza eseguiti",
      auditRefs: [
        { id: "municipality-security-domain-name-check", weight: 10 },

        { id: "common-security-https-is-present", weight: 10 },
        { id: "common-security-certificate-expiration", weight: 10 },
        { id: "common-security-tls-check", weight: 10 },
        { id: "common-security-ip-location", weight: 10 },
        { id: "common-security-cipher-check", weight: 10 },
      ],
    },
    uxuiconsistency: {
      title: "Test di consistenza UX/UI",
      description: "Lista degli audit di consistenza eseguiti",
      auditRefs: [
        { id: "municipality-ux-ui-consistency-fonts-check", weight: 10 }
      ],
    },
    legislation: {
      title: "Test di normativa",
      description: "Lista degli audit di normativa eseguiti",
      auditRefs: [
        {
          id: "municipality-legislation-accessibility-declaration-is-present",
          weight: 10,
        },
        { id: "municipality-legislation-privacy-is-present", weight: 10 },

        { id: "common-legislation-cookie-amount-check", weight: 10 },
        { id: "common-legislation-cookie-domain-check", weight: 10 },
      ],
    },
    informationArchitecture: {
      title: "Test di architettura delle informazioni",
      description:
        "Lista degli audit di architettura delle informazioni eseguiti",
      auditRefs: [
        { id: "municipality-menu-structure-match-model", weight: 10 },
      ],
    },
  },
};
