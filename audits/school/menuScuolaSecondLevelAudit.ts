"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  checkOrder,
  getPageElementDataAttribute,
  loadPageData,
} from "../../utils/utils";
import { secondaryMenuItems } from "../../storage/school/menuItems";
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
        text: "% di voci obbligatorie identificate",
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
        key: "wrong_voices_order",
        itemType: "text",
        text: "Voci di menù obbligatorie in ordine errato",
      },
    ];

    const items = [
      {
        result: redResult,
        correct_voices_percentage: "",
        correct_voices: "",
        wrong_voices_order: "",
        missing_voices: "",
      },
    ];

    let score = 0;

    const secondaryMenuScuolaItems: string[] = [];
    for (const element of secondaryMenuItems.Scuola) {
      secondaryMenuScuolaItems.push(element.toLowerCase());
    }

    const $: CheerioAPI = await loadPageData(url);
    const headerUlTest = await getPageElementDataAttribute(
      $,
      '[data-element="school-submenu"]',
      "li"
    );

    const elementsFound: string[] = [];
    const correctElementsFound: string[] = [];
    for (const element of headerUlTest) {
      if (secondaryMenuScuolaItems.includes(element.toLowerCase())) {
        correctElementsFound.push(element.toLowerCase());
      }

      elementsFound.push(element.toLowerCase());
    }

    const presentVoicesPercentage: number = parseInt(
      (
        (correctElementsFound.length / secondaryMenuScuolaItems.length) *
        100
      ).toFixed(0)
    );
    const missingVoicesPercentage: number = 100 - presentVoicesPercentage;

    let correctOrder = true;
    const correctOrderResult = await checkOrder(
      secondaryMenuScuolaItems,
      elementsFound
    );
    if (correctOrderResult.numberOfElementsNotInSequence > 0) {
      correctOrder = false;
    }

    if (missingVoicesPercentage > 30) {
      score = 0;
    } else if (missingVoicesPercentage <= 30 && !correctOrder) {
      score = 0.5;
      items[0].result = yellowResult;
    } else if (missingVoicesPercentage <= 30 && correctOrder) {
      score = 1;
      items[0].result = greenResult;
    }

    items[0].correct_voices = correctElementsFound.join(", ");
    items[0].correct_voices_percentage =
      presentVoicesPercentage.toString() + "%";
    items[0].wrong_voices_order =
      correctOrderResult.elementsNotInSequence.join(", ");
    items[0].missing_voices = secondaryMenuScuolaItems
      .filter((x) => !correctElementsFound.includes(x))
      .join(", ");

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
