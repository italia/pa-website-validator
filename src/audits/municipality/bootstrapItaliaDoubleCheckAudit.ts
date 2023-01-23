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
        text: "Risultato totale",
        subItemsHeading: { key: "inspected_page", itemType: "text" },
      },
      {
        key: "title_row_result_0",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "row_result_0", itemType: "text" },
      },
      {
        key: "title_row_result_1",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "row_result_1", itemType: "text" },
      },
    ];

    const correctItems = [];
    const wrongItems = [];

    const resultVersion = [];
    const itemVersion = {
      inspected_page: url,
      row_result_0: "",
      row_result_1: "",
    };

    let score = 0;

    try {
      if (
        bootstrapItaliaVariableVersion !== null &&
        bootstrapItaliaVariableVersion
      ) {
        itemVersion.row_result_1 = bootstrapItaliaVariableVersion;
        itemVersion.row_result_0 = libraryName;

        if (semver.gte(bootstrapItaliaVariableVersion, "2.0.0")) {
          score = 1;
        }
      } else if (
        bootstrapItaliaSelectorVariableVersion !== null &&
        bootstrapItaliaSelectorVariableVersion
      ) {
        itemVersion.row_result_1 = bootstrapItaliaSelectorVariableVersion;
        itemVersion.row_result_0 = libraryName;

        if (semver.gte(bootstrapItaliaSelectorVariableVersion, "2.0.0")) {
          score = 1;
        }
      }
    } catch (e) {
      //eslint-disable-next-line
    }

    let resultTitleVersion = "";
    if (score === 0) {
      resultTitleVersion = "Libreria Bootstrap Italia mancante o errata";
    } else {
      resultTitleVersion =
        "Libreria Bootstrap Italia è presente e ha la versione corretta";
    }

    resultVersion.push({
      result: resultTitleVersion,
      title_row_result_0: "Nome libreria in uso",
      title_row_result_1: "Versione libreria in uso",
    });

    resultVersion.push({
      subItems: {
        type: "subitems",
        items: [itemVersion],
      },
    });

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
        inspected_page: pageToBeAnalyzed,
        row_result_0: "",
        row_result_1: "",
      };

      const foundClasses = await checkCSSClassesOnPage(
        pageToBeAnalyzed,
        cssClasses
      );

      item.row_result_0 = foundClasses.join(", ");

      const missingClasses = cssClasses.filter(
        (x) => !foundClasses.includes(x)
      );

      if (missingClasses.length > 0) {
        if (score === 1) {
          score = 0;
        }
        item.row_result_1 = missingClasses.join(", ");
        wrongItems.push(item);
      } else {
        correctItems.push(item);
      }
    }

    let results = [];
    switch (score) {
      case 1:
        results.push({
          result: auditData.greenResult,
        });
        break;
      case 0:
        results.push({
          result: auditData.redResult,
        });
        break;
    }

    results.push({});

    results = [...results, ...resultVersion];

    results.push({});

    if (correctItems.length > 0) {
      results.push({
        result: auditData.subItem.greenResult,
        title_row_result_0: "Classi CSS trovate",
        title_row_result_1: "Classi CSS non trovate",
      });

      for (const item of correctItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    if (wrongItems.length > 0) {
      results.push({
        result: auditData.subItem.redResult,
        title_row_result_0: "Classi CSS trovate",
        title_row_result_1: "Classi CSS non trovate",
      });

      for (const item of wrongItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
    };
  }
}

module.exports = LoadAudit;
