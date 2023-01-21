"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import semver from "semver";
import { auditDictionary } from "../../storage/auditDictionary";
import {
  checkCSSClassesOnPage,
  getRandomMunicipalityFirstLevelPagesUrl,
  getRandomMunicipalitySecondLevelPagesUrl,
  getRandomMunicipalityServicesUrl,
} from "../../utils/utils";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";

const Audit = lighthouse.Audit;

const auditId = "municipality-ux-ui-consistency-bootstrap-italia-double-check";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

const greenResult = auditData.greenResult;
const redResult = auditData.redResult;

const libraryName = "Bootstrap italia";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      requiredArtifacts: [
        "bootstrapItaliaSelectorCheck",
        "bootstrapItaliaCheck",
        "origin",
      ],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & {
      bootstrapItaliaCheck: string;
      bootstrapItaliaSelectorCheck: string;
      origin: string;
    }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

    const bootstrapItaliaVariableVersion =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      artifacts.bootstrapItaliaCheck?.toString().trim().replaceAll('"', "") ??
      "";
    const bootstrapItaliaSelectorVariableVersion =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      artifacts.bootstrapItaliaSelectorCheck
        ?.toString()
        .trim()
        .replaceAll('"', "") ?? "";

    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
        subItemsHeading: { key: "inspected_page", itemType: "text" },
      },
      {
        key: null,
        itemType: "text",
        text: "Risultato singolo",
        subItemsHeading: { key: "single_result", itemType: "text" },
      },
      {
        key: null,
        itemType: "text",
        text: "Nome libreria in uso",
        subItemsHeading: { key: "library_name", itemType: "text" },
      },
      {
        key: null,
        itemType: "text",
        text: "Versione libreria in uso",
        subItemsHeading: { key: "library_version", itemType: "text" },
      },
      {
        key: null,
        itemType: "text",
        text: "Classi CSS non trovate",
        subItemsHeading: { key: "missing_classes", itemType: "text" },
      },
    ];
    const items = [
      {
        single_result: "Errato",
        inspected_page: url,
        library_name: "",
        library_version: "",
        missing_classes: "",
      },
    ];
    let score = 0;

    try {
      if (
        bootstrapItaliaVariableVersion !== null &&
        bootstrapItaliaVariableVersion
      ) {
        items[0].library_version = bootstrapItaliaVariableVersion;
        items[0].library_name = libraryName;

        if (semver.gte(bootstrapItaliaVariableVersion, "2.0.0")) {
          score = 1;
          items[0].single_result = "Corretto";
        }
      } else if (
        bootstrapItaliaSelectorVariableVersion !== null &&
        bootstrapItaliaSelectorVariableVersion
      ) {
        items[0].library_version = bootstrapItaliaSelectorVariableVersion;
        items[0].library_name = libraryName;

        if (semver.gte(bootstrapItaliaSelectorVariableVersion, "2.0.0")) {
          score = 1;
          items[0].single_result = "Corretto";
        }
      }
    } catch (e) {
      //eslint-disable-next-line
    }

    const pagesToBeAnalyzed = [
      url,
      ...(await getRandomMunicipalityFirstLevelPagesUrl(
        url,
        auditVariables.numberOfFirstLevelPageToBeScanned
      )),
      ...(await getRandomMunicipalitySecondLevelPagesUrl(
        url,
        auditVariables.numberOfSecondLevelPageToBeScanned
      )),
      ...(await getRandomMunicipalityServicesUrl(
        url,
        auditVariables.numberOfServicesToBeScanned
      )),
    ];

    const cssClasses = ["nav-link"];

    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      const item = {
        single_result: "Corretto",
        inspected_page: pageToBeAnalyzed,
        library_name: "",
        library_version: "",
        missing_classes: "",
      };

      const foundClasses = await checkCSSClassesOnPage(
        pageToBeAnalyzed,
        cssClasses
      );
      const missingClasses = cssClasses.filter(
        (x) => !foundClasses.includes(x)
      );

      if (missingClasses.length > 0) {
        if (score === 1) {
          score = 0;
        }
        item.missing_classes = missingClasses.join(", ");
        item.single_result = "Errato";
      }
      items.push(item);
    }

    const results = [];
    switch (score) {
      case 1:
        results.push({
          result: greenResult,
        });
        break;
      case 0:
        results.push({
          result: redResult,
        });
        break;
    }

    for (const item of items) {
      results.push({
        subItems: {
          type: "subitems",
          items: [item],
        },
      });
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
    };
  }
}

module.exports = LoadAudit;
