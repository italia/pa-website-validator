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
import puppeteer from "puppeteer";

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
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & {
      origin: string;
    }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato totale",
        subItemsHeading: { key: "inspected_page", itemType: "url" },
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
      {
        key: "title_row_result_2",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "row_result_2", itemType: "text" },
      },
    ];

    const correctItems = [];
    const wrongItems = [];

    let score = 1;

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

    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
    });

    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      let singleResult = 0;
      const item = {
        inspected_page: pageToBeAnalyzed,
        row_result_0: "",
        row_result_1: "",
        row_result_2: "",
      };

      try {
        const page = await browser.newPage();
        await page.goto(pageToBeAnalyzed);

        const bootstrapItaliaVariableVersion = await page.evaluate(
          async function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            return window.BOOTSTRAP_ITALIA_VERSION || null;
          }
        );
        const bootstrapItaliaSelectorVariableVersion = await page.evaluate(
          async function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            return (
              getComputedStyle(document.body).getPropertyValue(
                "--bootstrap-italia-version"
              ) || null
            );
          }
        );

        if (
          bootstrapItaliaVariableVersion !== null &&
          bootstrapItaliaVariableVersion
        ) {
          item.row_result_1 = bootstrapItaliaVariableVersion;
          item.row_result_0 = libraryName;

          if (semver.gte(bootstrapItaliaVariableVersion, "2.0.0")) {
            singleResult = 1;
          }
        } else if (
          bootstrapItaliaSelectorVariableVersion !== null &&
          bootstrapItaliaSelectorVariableVersion
        ) {
          item.row_result_1 = bootstrapItaliaSelectorVariableVersion;
          item.row_result_0 = libraryName;

          if (semver.gte(bootstrapItaliaSelectorVariableVersion, "2.0.0")) {
            singleResult = 1;
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-empty
      }

      const foundClasses = await checkCSSClassesOnPage(
        pageToBeAnalyzed,
        cssClasses
      );

      const missingClasses = cssClasses.filter(
        (x) => !foundClasses.includes(x)
      );

      if (missingClasses.length > 0) {
        singleResult = 0;
        item.row_result_2 = missingClasses.join(", ");
      }

      if (singleResult === 1) {
        correctItems.push(item);
      } else {
        score = 0;
        wrongItems.push(item);
      }
    }

    await browser.close();

    const results = [];
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

    if (correctItems.length > 0) {
      results.push({
        result: auditData.subItem.greenResult,
        title_row_result_0: "Nome libreria in uso",
        title_row_result_1: "Versione libreria in uso",
        title_row_result_2: "Classi CSS non trovate",
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
        title_row_result_0: "Nome libreria in uso",
        title_row_result_1: "Versione libreria in uso",
        title_row_result_2: "Classi CSS non trovate",
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
