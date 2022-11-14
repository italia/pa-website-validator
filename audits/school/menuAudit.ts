"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { primaryMenuItems } from "../../storage/school/menuItems";
import {
  checkOrder,
  getPageElementDataAttribute,
  loadPageData,
  missingMenuItems,
} from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";
import { CheerioAPI } from "cheerio";
import { MenuItem } from "../../types/menuItem";

const Audit = lighthouse.Audit;

const auditId = "school-menu-structure-match-model";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const yellowResult = auditData.yellowResult;
const redResult = auditData.redResult;

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

    items[0].found_menu_voices = foundMenuElements.join(", ");

    const mandatoryPrimaryMenuItems: MenuItem[] = primaryMenuItems.map(
      (str) => ({
        name: str,
        regExp: new RegExp(`^${str}$`, "i"),
      })
    );

    const missingMandatoryElements = missingMenuItems(
      foundMenuElements,
      mandatoryPrimaryMenuItems
    );
    items[0].missing_menu_voices = missingMandatoryElements.join(", ");

    const orderResult = checkOrder(
      mandatoryPrimaryMenuItems,
      foundMenuElements
    );
    items[0].wrong_order_menu_voices =
      orderResult.elementsNotInSequence.join(", ");

    const containsMandatoryElementsResult =
      missingMandatoryElements.length === 0;
    const mandatoryElementsCorrectOrder = correctOrderMandatoryElements(
      foundMenuElements,
      mandatoryPrimaryMenuItems
    );

    if (
      foundMenuElements.length === 4 &&
      containsMandatoryElementsResult &&
      mandatoryElementsCorrectOrder
    ) {
      score = 1;
      items[0].result = greenResult;
    } else if (
      foundMenuElements.length > 4 &&
      foundMenuElements.length < 8 &&
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

function correctOrderMandatoryElements(
  menuElements: string[],
  mandatoryElements: MenuItem[]
): boolean {
  let result = true;

  for (let i = 0; i < mandatoryElements.length; i++) {
    if (!mandatoryElements[i].regExp.test(menuElements[i])) {
      result = false;
    }
  }

  return result;
}
