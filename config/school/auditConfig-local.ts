import { schoolGatherersFolder } from "../configFolderingConstants";
import { schoolAuditsFolder } from "../configFolderingConstants";

module.exports = {
  extends: "lighthouse:default",
  settings: {},

  passes: [
    {
      gatherers: [
        schoolGatherersFolder + "/ux-ui-consistency/fontsCheckGatherer.js",
        schoolGatherersFolder + "/ux-ui-consistency/bootstrapCheckGatherer.js",
        schoolGatherersFolder + "/ux-ui-consistency/themeCheckGatherer.js",
        schoolGatherersFolder +
          "/ux-ui-consistency/themeVersionCheckGatherer.js",
        schoolGatherersFolder +
          "/ux-ui-consistency/bootstrapItaliaWPCheckGatherer.js",
        schoolGatherersFolder +
          "/ux-ui-consistency/bootstrapItaliaCheckGatherer.js",

        schoolGatherersFolder +
          "/legislation/accessibilityDeclarationIsPresentGatherer.js",
        schoolGatherersFolder + "/legislation/privacyGatherer.js",

        schoolGatherersFolder + "/informationArchitecture/menuGatherer.js",
        schoolGatherersFolder +
          "/informationArchitecture/menuScuolaSecondLevelGatherer.js",
        schoolGatherersFolder +
          "/informationArchitecture/controlledVocabulariesGatherer.js",
      ],
    },
  ],

  audits: [
    schoolAuditsFolder + "/ux-ui-consistency/fontsCheckAudit.js",
    schoolAuditsFolder + "/ux-ui-consistency/bootstrapCheckAudit.js",
    schoolAuditsFolder + "/ux-ui-consistency/themeCheckAudit.js",
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

  categories: {
    uxuiconsistency: {
      title: "Test di consistenza UX/UI",
      description: "Lista degli audit di consistenza eseguiti",
      auditRefs: [
        { id: "school-ux-ui-consistency-fonts-check", weight: 10 },
        { id: "school-ux-ui-consistency-bootstrap-check", weight: 10 },
        {
          id: "school-ux-ui-consistency-bootstrap-italia-double-check",
          weight: 10,
        },
        { id: "school-ux-ui-consistency-theme-check", weight: 10 },
        { id: "school-ux-ui-consistency-theme-version-check", weight: 10 },
      ],
    },
    legislation: {
      title: "Test di normativa",
      description: "Lista degli audit di normativa eseguiti",
      auditRefs: [
        {
          id: "school-legislation-accessibility-declaration-is-present",
          weight: 10,
        },
        { id: "school-legislation-privacy-is-present", weight: 10 },
      ],
    },
    informationArchitecture: {
      title: "Test di architettura delle informazioni",
      description:
        "Lista degli audit di architettura delle informazioni eseguiti",
      auditRefs: [
        { id: "school-menu-structure-match-model", weight: 10 },
        {
          id: "school-menu-scuola-second-level-structure-match-model",
          weight: 10,
        },
        { id: "school-controlled-vocabularies", weight: 10 },
      ],
    },
  },
};
