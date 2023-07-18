"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import semver from "semver";
import { auditDictionary } from "../../storage/auditDictionary";
import { requestTimeout } from "../../utils/utils";
import {
  getRandomFirstLevelPagesUrl,
  getRandomSecondLevelPagesUrl,
  getRandomThirdLevelPagesUrl,
  getPrimaryPageUrl,
} from "../../utils/municipality/utils";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";
import { cssClasses } from "../../storage/municipality/cssClasses";
import puppeteer from "puppeteer";
import { primaryMenuItems } from "../../storage/municipality/menuItems";

const Audit = lighthouse.Audit;

const auditId = "municipality-ux-ui-consistency-bootstrap-italia-double-check";
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

    const randomFirstLevelPagesUrl = await getRandomFirstLevelPagesUrl(
      url,
      auditVariables.numberOfFirstLevelPageToBeScanned
    );

    const randomSecondLevelPagesUrl = await getRandomSecondLevelPagesUrl(
      url,
      auditVariables.numberOfSecondLevelPageToBeScanned
    );

    const randomServicesUrl = await getRandomThirdLevelPagesUrl(
      url,
      await getPrimaryPageUrl(url, primaryMenuItems.services.data_element),
      `[data-element="${primaryMenuItems.services.third_item_data_element}"]`,
      auditVariables.numberOfServicesToBeScanned
    );

    if (
      randomFirstLevelPagesUrl.length === 0 ||
      randomSecondLevelPagesUrl.length === 0 ||
      randomServicesUrl.length === 0
    ) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: auditData.nonExecuted,
            },
          ]
        ),
      };
    }

    const pagesToBeAnalyzed = [
      url,
      ...randomFirstLevelPagesUrl,
      ...randomSecondLevelPagesUrl,
      ...randomServicesUrl,
    ];

    const personalAreaLoginPage = await getPrimaryPageUrl(
      url,
      "personal-area-login"
    );
    if (personalAreaLoginPage !== "") {
      pagesToBeAnalyzed.push(personalAreaLoginPage);
    }

    const servicesPage = await getPrimaryPageUrl(url, "all-services");

    if (servicesPage !== "") {
      const bookingAppointmentPage = await getPrimaryPageUrl(
        servicesPage,
        "appointment-booking"
      );
      if (bookingAppointmentPage !== "") {
        pagesToBeAnalyzed.push(bookingAppointmentPage);
      }
    }

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-zygote", "--no-sandbox"],
    });
    const browserWSEndpoint = browser.wsEndpoint();

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
            -1
          ) {
            request.abort();
          } else {
            request.continue();
          }
        });

        const res = await page.goto(pageToBeAnalyzed, {
          waitUntil: ["load", "networkidle0"],
          timeout: requestTimeout,
        });
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

          if (semver.gte(bootstrapItaliaVariableVersion, "2.0.0")) {
            singleResult = 1;
          }
        } else if (
          bootstrapItaliaSelectorVariableVersion !== null &&
          bootstrapItaliaSelectorVariableVersion
        ) {
          item.library_version = bootstrapItaliaSelectorVariableVersion;
          item.library_name = "Sì";

          if (semver.gte(bootstrapItaliaSelectorVariableVersion, "2.0.0")) {
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
      } catch (e) {
        console.error(`ERROR ${pageToBeAnalyzed}: ${e}`);
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
    };
  }
}

module.exports = LoadAudit;
