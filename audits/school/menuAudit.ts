"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { primaryMenuItems } from "../../storage/school/menuItems";
import {
  checkOrder,
  getPageElementDataAttribute,
  loadPageData,
} from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary"
import { CheerioAPI } from "cheerio";

const Audit = lighthouse.Audit;

const auditId = "school-menu-structure-match-model"
const auditData = auditDictionary[auditId]

const greenResult = auditData.greenResult
const yellowResult = auditData.yellowResult
const redResult = auditData.redResult

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

    let score = 0;
    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      {
        key: "found_menu_voices",
        itemType: "text",
        text: "Voci del menù identificate",
      },
      {
        key: "missing_menu_voices",
        itemType: "text",
        text: "Voci obbligatorie del menù mancanti",
      },
      {
        key: "wrong_order_menu_voices",
        itemType: "text",
        text: "Voci del menù nell'ordine errato",
      },
    ];

    const items = [
      {
        result: redResult,
        found_menu_voices: "",
        missing_menu_voices: "",
        wrong_order_menu_voices: "",
      },
    ];

    const $: CheerioAPI = await loadPageData(url);

    const foundMenuElements = await getPageElementDataAttribute(
      $,
      '[data-element="menu"]',
      "> li > a"
    );

    const menuElements = [];
    for (const element of foundMenuElements) {
      menuElements.push(element.toLowerCase());
    }

    items[0].found_menu_voices = menuElements.join(", ");

    const primaryMenuItemsToLower: string[] = [];
    for (const element of primaryMenuItems) {
      primaryMenuItemsToLower.push(element.toLowerCase());
    }

    const missingMandatoryElements = missingMandatoryItems(
      menuElements,
      primaryMenuItemsToLower
    );
    items[0].missing_menu_voices = missingMandatoryElements.join(", ");

    const orderResult = await checkOrder(primaryMenuItemsToLower, menuElements);
    items[0].wrong_order_menu_voices =
      orderResult.elementsNotInSequence.join(", ");

    const containsMandatoryElementsResult = containsMandatoryElements(
      menuElements,
      primaryMenuItemsToLower
    );
    const mandatoryElementsCorrectOrder = correctOrderMandatoryElements(
      menuElements,
      primaryMenuItemsToLower
    );

    if (
      menuElements.length === 4 &&
      containsMandatoryElementsResult &&
      mandatoryElementsCorrectOrder
    ) {
      score = 1;
      items[0].result = greenResult;
    } else if (
      menuElements.length > 4 &&
      menuElements.length < 8 &&
      containsMandatoryElementsResult &&
      mandatoryElementsCorrectOrder
    ) {
      score = 0.5;
      items[0].result = yellowResult;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;

function containsMandatoryElements(
  menuElements: string[],
  mandatoryElements: string[]
): boolean {
  let result = true;

  for (const element of mandatoryElements) {
    if (!menuElements.includes(element)) {
      result = false;
    }
  }

  return result;
}

function correctOrderMandatoryElements(
  menuElements: string[],
  mandatoryElements: string[]
): boolean {
  let result = true;

  for (let i = 0; i < mandatoryElements.length; i++) {
    if (menuElements[i] !== mandatoryElements[i]) {
      result = false;
    }
  }

  return result;
}

function missingMandatoryItems(
  menuElements: string[],
  mandatoryElements: string[]
): string[] {
  const missingItems: string[] = [];

  for (const mandatoryElement of mandatoryElements) {
    if (!menuElements.includes(mandatoryElement)) {
      missingItems.push(mandatoryElement);
    }
  }

  return missingItems;
}
