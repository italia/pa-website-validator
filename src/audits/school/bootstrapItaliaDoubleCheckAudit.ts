"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import semver from "semver";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

import {
  checkCSSClassesOnPage,
  getRandomSchoolFirstLevelPagesUrl,
  getRandomSchoolSecondLevelPagesUrl,
  getRandomSchoolServicesUrl,
} from "../../utils/utils";
import { auditScanVariables } from "../../storage/school/auditScanVariables";
import puppeteer from "puppeteer";

const auditId = "school-ux-ui-consistency-bootstrap-italia-double-check";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

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
        key: "title_library_name",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "library_name", itemType: "text" },
      },
      {
        key: "title_library_version",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "library_version", itemType: "text" },
      },
      {
        key: "title_classes_found",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "classes_found", itemType: "text" },
      },
    ];

    const correctItems = [];
    const wrongItems = [];

    let score = 1;

    const pagesToBeAnalyzed = [
      url,
      ...(await getRandomSchoolFirstLevelPagesUrl(
        url,
        auditVariables.numberOfFirstLevelPageToBeScanned
      )),
      ...(await getRandomSchoolSecondLevelPagesUrl(
        url,
        auditVariables.numberOfSecondLevelPageToBeScanned
      )),
      ...(await getRandomSchoolServicesUrl(
        url,
        auditVariables.numberOfServicesToBeScanned
      )),
    ];

    const cssClasses = ["nav-link", 'pippo'];

    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
    });

    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      let singleResult = 0;
      const item = {
        inspected_page: pageToBeAnalyzed,
        library_name: "No",
        library_version: "",
        classes_found: "",
      };

      try {
        const page = await browser.newPage();
        await page.goto(pageToBeAnalyzed);

        let bootstrapItaliaVariableVersion = await page.evaluate(
          async function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            return window.BOOTSTRAP_ITALIA_VERSION || null;
          }
        );

        if (bootstrapItaliaVariableVersion !== null)
          bootstrapItaliaVariableVersion = bootstrapItaliaVariableVersion
            .trim()
            .replaceAll('"', "");

        let bootstrapItaliaSelectorVariableVersion = await page.evaluate(
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

        if (bootstrapItaliaSelectorVariableVersion !== null)
          bootstrapItaliaSelectorVariableVersion =
            bootstrapItaliaSelectorVariableVersion.trim().replaceAll('"', "");

        if (
          bootstrapItaliaVariableVersion !== null &&
          bootstrapItaliaVariableVersion
        ) {
          item.library_version = bootstrapItaliaVariableVersion;
          item.library_name = "Sì";

          if (semver.gte(bootstrapItaliaVariableVersion, "1.6.0")) {
            singleResult = 1;
          }
        } else if (
          bootstrapItaliaSelectorVariableVersion !== null &&
          bootstrapItaliaSelectorVariableVersion
        ) {
          item.library_version = bootstrapItaliaSelectorVariableVersion;
          item.library_name = "Sì";

          if (semver.gte(bootstrapItaliaSelectorVariableVersion, "1.6.0")) {
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

      if (foundClasses.length === 0) {
        singleResult = 0;
      } else {
        item.classes_found = foundClasses.join(", ");
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

    if (wrongItems.length > 0) {
      results.push({
        result: auditData.subItem.redResult,
        title_library_name: "La libreria Bootstrap Italia è presente",
        title_library_version: "Versione in uso",
        title_classes_found: "Classi CSS trovate",
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

    if (correctItems.length > 0) {
      results.push({
        result: auditData.subItem.greenResult,
        title_library_name: "La libreria Bootstrap Italia è presente",
        title_library_version: "Versione in uso",
        title_classes_found: "Classi CSS trovate",
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

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
    };
  }
}

module.exports = LoadAudit;
