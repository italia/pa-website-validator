import { municipalityGatherersFolder } from "../configFolderingConstants";
import { municipalityAuditsFolder } from "../configFolderingConstants";

module.exports = {
  extends: "lighthouse:default",
  settings: {},

  passes: [
    {
      gatherers: [
        municipalityGatherersFolder +
          "/ux-ui-consistency/fontsCheckGatherer.js",
        municipalityGatherersFolder +
          "/ux-ui-consistency/bootstrapCheckGatherer.js",

        municipalityGatherersFolder +
          "/legislation/accessibilityDeclarationIsPresentGatherer.js",
        municipalityGatherersFolder + "/legislation/privacyGatherer.js",

        municipalityGatherersFolder +
          "/informationArchitecture/menuGatherer.js",
      ],
    },
  ],

  audits: [
    municipalityAuditsFolder + "/ux-ui-consistency/fontsCheckAudit.js",
    municipalityAuditsFolder + "/ux-ui-consistency/bootstrapCheckAudit.js",

    municipalityAuditsFolder +
      "/legislation/accessibilityDeclarationIsPresentAudit.js",
    municipalityAuditsFolder + "/legislation/privacyAudit.js",

    municipalityAuditsFolder + "/informationArchitecture/menuAudit.js",
  ],

  categories: {
    uxuiconsistency: {
      title: "Test di consistenza UX/UI",
      description: "Lista degli audit di consistenza eseguiti",
      auditRefs: [
        { id: "municipality-ux-ui-consistency-fonts-check", weight: 10 },
        { id: "municipality-ux-ui-consistency-bootstrap-check", weight: 10 },
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
