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

interface itemPage {
  key: string;
  pagesInVocabulary: string[];
  pagesNotInVocabulary: string[];
}

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
        text: "% di voci corrette tra quelle usate",
      },
      {
        key: "correct_voices",
        itemType: "text",
        text: "Voci corrette identificate",
      },
      {
        key: "missing_voices",
        itemType: "text",
        text: "Voci non usate",
      },
    ];

    const items = [
      {
        result: auditData.redResult,
        correct_voices_percentage: "",
        correct_voices: "",
        wrong_voices_order: "",
        missing_voices: "",
        error_voices: "",
      },
    ];

    let totalNumberOfTitleFound = 0;
    const itemsPage: itemPage[] = [];

    for (const [, value] of Object.entries(menuItems)) {
      const item: itemPage = {
        key: value.label,
        pagesInVocabulary: [],
        pagesNotInVocabulary: [],
      };

      const secondaryMenuItem = value;

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
          item.pagesInVocabulary.push(element.toLowerCase());
        }

        totalNumberOfTitleFound++;
      }

      item.pagesNotInVocabulary = secondaryMenuItems.filter(
        (x) => !item.pagesInVocabulary.includes(x)
      );

      itemsPage.push(item);
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

    let pagesInVocabulary = 0;
    let correctTitleFound = "";
    let wrongTitleFound = "";

    for (const itemPage of itemsPage) {
      pagesInVocabulary += itemPage.pagesInVocabulary.length;

      if (itemPage.pagesInVocabulary.length > 0) {
        correctTitleFound += itemPage.key + ": ";
        correctTitleFound += itemPage.pagesInVocabulary.join(", ");
        correctTitleFound += "; ";
      }

      if (itemPage.pagesNotInVocabulary.length > 0) {
        wrongTitleFound += itemPage.key + ": ";
        wrongTitleFound += itemPage.pagesNotInVocabulary.join(", ");
        wrongTitleFound += "; ";
      }
    }

    const presentVoicesPercentage: number = parseInt(
      (
        (pagesInVocabulary / (totalNumberOfTitleFound + errorVoices.length)) *
        100
      ).toFixed(0)
    );

    let score = 0;
    if (presentVoicesPercentage >= 30 && presentVoicesPercentage < 100) {
      score = 0.5;
      items[0].result = auditData.yellowResult;
    } else if (presentVoicesPercentage === 100) {
      score = 1;
      items[0].result = auditData.greenResult;
    }

    items[0].correct_voices = correctTitleFound;
    items[0].correct_voices_percentage =
      presentVoicesPercentage.toString() + "%";
    items[0].missing_voices = wrongTitleFound;
    items[0].error_voices = errorVoices.join(", ");

    if (errorVoices.length > 0) {
      headings.push({
        key: "error_voices",
        itemType: "text",
        text: "Voci aggiuntive trovate",
      });
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
