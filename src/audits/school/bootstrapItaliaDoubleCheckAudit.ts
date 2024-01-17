"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { compareVersions } from "compare-versions";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

import { gotoRetry, requestTimeout } from "../../utils/utils";
import { auditScanVariables } from "../../storage/school/auditScanVariables";
import { cssClasses } from "../../storage/school/cssClasses";
import puppeteer from "puppeteer";
import {
  errorHandling,
  notExecutedErrorMessage,
} from "../../config/commonAuditsParts";
import { getPages } from "../../utils/school/utils";
import { DataElementError } from "../../utils/DataElementError";

const auditId = "school-ux-ui-consistency-bootstrap-italia-double-check";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

const numberOfServicesToBeScanned = process.env["numberOfServicePages"]
  ? JSON.parse(process.env["numberOfServicePages"])
  : auditVariables.numberOfServicesToBeScanned;

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
  ): Promise<LH.Audit.ProductBase> {
    const url = artifacts.origin;

    const titleSubHeadings = [
      "La libreria Bootstrap Italia è presente",
      "Versione in uso",
      "Classi CSS trovate",
    ];

    const subResults = ["Nessuna", "Almeno una"];

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
    let pagesToBeAnalyzed = [];
    try {
      pagesToBeAnalyzed = [
        url,
        ...(await getPages(url, [
          {
            type: "first_level_pages",
            numberOfPages: auditVariables.numberOfFirstLevelPageToBeScanned,
          },
          {
            type: "second_level_pages",
            numberOfPages: auditVariables.numberOfSecondLevelPageToBeScanned,
          },
          {
            type: "services",
            numberOfPages: numberOfServicesToBeScanned,
          },
        ])),
      ];
    } catch (ex) {
      if (!(ex instanceof DataElementError)) {
        throw ex;
      }

      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: notExecutedErrorMessage.replace("<LIST>", ex.message),
            },
          ]
        ),
      };
    }

    const browser = await puppeteer.launch({
      headless: "new",
      protocolTimeout: requestTimeout,
      args: ["--no-zygote", "--no-sandbox"],
    });
    const browserWSEndpoint = browser.wsEndpoint();

    const pagesInError = [];

    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      let singleResult = 0;
      const item = {
        inspected_page: pageToBeAnalyzed,
        library_name: "No",
        library_version: "",
        classes_found: "",
      };

      const foundClasses = [];
      try {
        const browser2 = await puppeteer.connect({ browserWSEndpoint });
        const page = await browser2.newPage();

        await page.setRequestInterception(true);
        page.on("request", (request) => {
          if (
            ["image", "imageset", "media"].indexOf(request.resourceType()) !==
              -1 ||
            new URL(request.url()).pathname.endsWith(".pdf")
          ) {
            request.abort();
          } else {
            request.continue();
          }
        });

        const res = await gotoRetry(
          page,
          pageToBeAnalyzed,
          errorHandling.gotoRetryTentative
        );
        console.log(res?.url(), res?.status());

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

          if (compareVersions(bootstrapItaliaVariableVersion, "1.6.0") >= 0) {
            singleResult = 1;
          }
        } else if (
          bootstrapItaliaSelectorVariableVersion !== null &&
          bootstrapItaliaSelectorVariableVersion
        ) {
          item.library_version = bootstrapItaliaSelectorVariableVersion;
          item.library_name = "Sì";

          if (
            compareVersions(bootstrapItaliaSelectorVariableVersion, "1.6.0") >=
            0
          ) {
            singleResult = 1;
          }
        }

        for (const cssClass of cssClasses) {
          const elementCount = await page.evaluate(async (cssClass) => {
            const cssElements = document.querySelectorAll(`.${cssClass}`);
            return cssElements.length;
          }, cssClass);

          if (elementCount > 0) {
            foundClasses.push(cssClass);
          }
        }

        await page.goto("about:blank");
        await page.close();
        browser2.disconnect();
      } catch (ex) {
        console.error(`ERROR ${pageToBeAnalyzed}: ${ex}`);
        if (!(ex instanceof Error)) {
          throw ex;
        }

        pagesInError.push({
          inspected_page: pageToBeAnalyzed,
          library_name: ex.message,
        });
        continue;
      }

      if (foundClasses.length === 0) {
        singleResult = 0;
        item.classes_found = subResults[0];
      } else {
        item.classes_found = subResults[1];
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
    if (pagesInError.length > 0) {
      results.push({
        result: errorHandling.errorMessage,
      });

      results.push({});

      results.push({
        result: errorHandling.errorColumnTitles[0],
        title_library_name: errorHandling.errorColumnTitles[1],
        title_library_version: "",
        title_classes_found: "",
      });

      for (const item of pagesInError) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }
    } else {
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
    }

    results.push({});

    if (wrongItems.length > 0) {
      results.push({
        result: auditData.subItem.redResult,
        title_library_name: titleSubHeadings[0],
        title_library_version: titleSubHeadings[1],
        title_classes_found: titleSubHeadings[2],
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
        title_library_name: titleSubHeadings[0],
        title_library_version: titleSubHeadings[1],
        title_classes_found: titleSubHeadings[2],
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
      errorMessage: pagesInError.length > 0 ? errorHandling.popupMessage : "",
    };
  }
}

module.exports = LoadAudit;
