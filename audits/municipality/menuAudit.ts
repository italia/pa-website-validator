"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { primaryMenuItems } from "../../storage/municipality/menuItems";
import {
  checkOrder,
  getPageElementDataAttribute,
  loadPageData,
  missingMenuItems,
} from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

const auditId = "municipality-menu-structure-match-model";
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
        text: "Voci del menù mancanti",
      },
      {
        key: "wrong_order_menu_voices",
        itemType: "text",
        text: "Voci del menù in ordine errato",
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
      '[data-element="main-navigation"]',
      "> li > a"
    );

    items[0].found_menu_voices = foundMenuElements.join(", ");

    const missingMandatoryElements = missingMenuItems(
      foundMenuElements,
      primaryMenuItems
    );
    items[0].missing_menu_voices = missingMandatoryElements.join(", ");

    const orderResult = checkOrder(primaryMenuItems, foundMenuElements);
    items[0].wrong_order_menu_voices =
      orderResult.elementsNotInSequence.join(", ");

    const containsMandatoryElementsResult =
      missingMandatoryElements.length === 0;

    if (
      foundMenuElements.length === 4 &&
      containsMandatoryElementsResult &&
      orderResult.numberOfElementsNotInSequence === 0
    ) {
      score = 1;
      items[0].result = greenResult;
    } else if (
      foundMenuElements.length > 4 &&
      foundMenuElements.length < 8 &&
      containsMandatoryElementsResult &&
      orderResult.numberOfElementsNotInSequence === 0
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
