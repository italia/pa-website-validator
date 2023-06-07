"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { schoolModelVocabulary } from "../../storage/school/controlledVocabulary";
import {
  getPageElementDataAttribute,
  areAllElementsInVocabulary,
  requestTimeout,
} from "../../utils/utils";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

const auditId = "school-controlled-vocabularies";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const yellowResult = auditData.yellowResult;
const redResult = auditData.redResult;
const notExecuted = auditData.nonExecuted;

class LoadAudit extends lighthouse.Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      {
        key: "element_in_school_model_percentage",
        itemType: "text",
        text: "% di argomenti presenti nell'elenco del modello",
      },
      {
        key: "element_not_in_school_model",
        itemType: "text",
        text: "Argomenti non presenti nell'elenco del modello",
      },
    ];

    const item = [
      {
        result: redResult,
        element_in_school_model_percentage: "",
        element_not_in_school_model: "",
      },
    ];

    const argumentsElements: string[] = await getArgumentsElements(url);
    if (argumentsElements.length <= 0) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [{ result: notExecuted }]
        ),
      };
    }

    const schoolModelCheck = await areAllElementsInVocabulary(
      argumentsElements,
      schoolModelVocabulary
    );

    let numberOfElementsNotInScuoleModelPercentage = 100;

    if (argumentsElements.length > 0) {
      numberOfElementsNotInScuoleModelPercentage =
        (schoolModelCheck.elementNotIncluded.length /
          argumentsElements.length) *
        100;
    }

    let score = 0;
    if (schoolModelCheck.allArgumentsInVocabulary) {
      item[0].result = greenResult;
      score = 1;
    } else if (numberOfElementsNotInScuoleModelPercentage <= 50) {
      item[0].result = yellowResult;
      score = 0.5;
    }

    item[0].element_in_school_model_percentage =
      (100 - numberOfElementsNotInScuoleModelPercentage).toFixed(0).toString() +
      "%";
    item[0].element_not_in_school_model =
      schoolModelCheck.elementNotIncluded.join(", ");

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;

async function getArgumentsElements(url: string): Promise<string[]> {
  let elements: string[] = [];
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--single-process", "--no-zygote", "--no-sandbox"],
  });
  const browserWSEndpoint = browser.wsEndpoint();

  try {
    const browser2 = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser2.newPage();
    page.on("request", (e) => {
      const res = e.response();
      if (res !== null && !res.ok())
        console.log(`Failed to load ${res.url()}: ${res.status()}`);
    });
    const res = await page.goto(url, {
      waitUntil: ["load", "networkidle0"],
      timeout: requestTimeout,
    });
    console.log(res?.url(), res?.status());

    await page.waitForSelector('[data-element="search-modal-button"]', {
      visible: true,
    });

    await page.$eval(
      '[data-element="search-modal-button"]',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el: any) => (el.value = "scuola")
    );

    const button = await page.$('[data-element="search-submit"]');
    if (!button) {
      return elements;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await button?.evaluate((b: any) => b.click());

    await page.waitForNavigation();

    const $ = cheerio.load(await page.content());
    if ($.length <= 0) {
      await browser.close();
      return elements;
    }

    elements = await getPageElementDataAttribute(
      $,
      '[data-element="all-topics"]',
      "li"
    );

    await page.goto("about:blank");
    await page.close();
    browser2.disconnect();

    return elements;
  } catch (ex) {
    await browser.close();

    return [];
  }
}
