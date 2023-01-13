"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { getPageElementDataAttribute, loadPageData } from "../../utils/utils";
import {
  menuItems,
  customPrimaryMenuItemsDataElement,
} from "../../storage/school/menuItems";
import { auditDictionary } from "../../storage/auditDictionary";
import { CheerioAPI } from "cheerio";

const Audit = lighthouse.Audit;

const auditId = "school-menu-scuola-second-level-structure-match-model";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const yellowResult = auditData.yellowResult;
const redResult = auditData.redResult;

class LoadAudit extends Audit {
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
    artifacts: LH.Artifacts & {
      origin: string;
    }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      {
        key: "correct_voices_percentage",
        itemType: "text",
        text: "% di voci obbligatorie tra quelle usate",
      },
      {
        key: "correct_voices",
        itemType: "text",
        text: "Voci di menù obbligatorie identificate",
      },
      {
        key: "missing_voices",
        itemType: "text",
        text: "Voci di menù obbligatorie mancanti",
      },
      {
        key: "error_voices",
        itemType: "text",
        text: "Voci aggiuntive errate trovate",
      },
    ];

    const items = [
      {
        result: redResult,
        correct_voices_percentage: "",
        correct_voices: "",
        wrong_voices_order: "",
        missing_voices: "",
        error_voices: "",
      },
    ];

    let elementsFound: string[] = [];
    let correctElementsFound: string[] = [];
    let missingElements: string[] = [];
    for (const [, value] of Object.entries(menuItems)) {
      const secondaryMenuItem = value;

      const singleElementElementsFound: string[] = [];
      const singleElementCorrectElementsFound: string[] = [];

      const secondaryMenuItems: string[] = [];
      for (const element of secondaryMenuItem.dictionary) {
        secondaryMenuItems.push(element.toLowerCase());
      }

      const $: CheerioAPI = await loadPageData(url);
      const headerUlTest = await getPageElementDataAttribute(
        $,
        `[data-element="${secondaryMenuItem.data_element}"]`,
        "a"
      );

      if (headerUlTest[0] === "Panoramica") headerUlTest.shift();

      for (const element of headerUlTest) {
        if (secondaryMenuItems.includes(element.toLowerCase())) {
          singleElementCorrectElementsFound.push(element.toLowerCase());
        }

        singleElementElementsFound.push(element.toLowerCase());
      }

      elementsFound = [...elementsFound, ...singleElementElementsFound];
      correctElementsFound = [
        ...correctElementsFound,
        ...singleElementCorrectElementsFound,
      ];

      missingElements = [
        ...missingElements,
        ...secondaryMenuItems.filter(
          (x) => !singleElementCorrectElementsFound.includes(x)
        ),
      ];
    }

    let j = 0;
    let checkExistence = true;
    const errorVoices = [];

    while (checkExistence) {
      const $: CheerioAPI = await loadPageData(url);
      const headerUlTest = await getPageElementDataAttribute(
        $,
        `[data-element="${customPrimaryMenuItemsDataElement + j.toString()}"]`,
        "a"
      );

      if (headerUlTest.length === 0) {
        checkExistence = false;
        continue;
      }

      if (headerUlTest[0] === "Panoramica") headerUlTest.shift();

      for (const element of headerUlTest) {
        errorVoices.push(element.toLowerCase());
      }
      j++;
    }

    const presentVoicesPercentage: number = parseInt(
      (
        (correctElementsFound.length /
          (elementsFound.length + errorVoices.length)) *
        100
      ).toFixed(0)
    );

    let score = 0;
    if (presentVoicesPercentage >= 30 && presentVoicesPercentage < 100) {
      score = 0.5;
      items[0].result = yellowResult;
    } else if (presentVoicesPercentage === 100) {
      score = 1;
      items[0].result = greenResult;
    }

    items[0].correct_voices = correctElementsFound.join(", ");
    items[0].correct_voices_percentage =
      presentVoicesPercentage.toString() + "%";
    items[0].missing_voices = missingElements.join(", ");
    items[0].error_voices = errorVoices.join(", ");

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
