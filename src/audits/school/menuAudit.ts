"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { primaryMenuItems } from "../../storage/school/menuItems";
import {
  checkOrder,
  getPageElementDataAttribute,
  getRedirectedUrl,
  loadPageData,
  missingMenuItems,
} from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";
import { CheerioAPI } from "cheerio";
import { MenuItem } from "../../types/menuItem";
import { detectLang, getFirstLevelPages } from "../../utils/school/utils";

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
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
        subItemsHeading: {
          key: "menu_voice",
          itemType: "text",
        },
      },
      {
        key: "found_menu_voices",
        itemType: "text",
        text: "Voci del menù identificate",
        subItemsHeading: {
          key: "inspected_page",
          itemType: "url",
        },
      },
      {
        key: "missing_menu_voices",
        itemType: "text",
        text: "Voci obbligatorie del menù mancanti",
        subItemsHeading: {
          key: "external",
          itemType: "text",
        },
      },
      {
        key: "wrong_order_menu_voices",
        itemType: "text",
        text: "Voci del menù nell'ordine errato",
      },
    ];

    const results = [];
    results.push({
      result: redResult,
      found_menu_voices: "",
      missing_menu_voices: "",
      wrong_order_menu_voices: "",
    });

    const $: CheerioAPI = await loadPageData(url);

    const menuDataElement = '[data-element="menu"]';
    const menuComponent = $(menuDataElement);
    if (menuComponent.length === 0) {
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

    const foundMenuElements = await getPageElementDataAttribute(
      $,
      menuDataElement,
      "> li > a"
    );

    results[0].found_menu_voices = foundMenuElements.join(", ");

    const lang = detectLang(foundMenuElements);

    const mandatoryPrimaryMenuItems: MenuItem[] = primaryMenuItems[lang].map(
      (str) => ({
        name: str,
        regExp: new RegExp(`^${str}$`, "i"),
      })
    );

    const missingMandatoryElements = missingMenuItems(
      foundMenuElements,
      mandatoryPrimaryMenuItems
    );
    results[0].missing_menu_voices = missingMandatoryElements.join(", ");

    const orderResult = checkOrder(
      mandatoryPrimaryMenuItems,
      foundMenuElements
    );
    results[0].wrong_order_menu_voices =
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
      results[0].result = greenResult;
    } else if (
      foundMenuElements.length > 4 &&
      foundMenuElements.length < 8 &&
      containsMandatoryElementsResult &&
      mandatoryElementsCorrectOrder
    ) {
      score = 0.5;
      results[0].result = yellowResult;
    }

    const firstLevelPages = await getFirstLevelPages(url);

    results.push({});

    results.push({
      result: "Voce di menù",
      found_menu_voices: "Link trovato",
      missing_menu_voices: "Pagina interna al dominio",
    });

    const host = new URL(url).hostname.replace("www.", "");
    for (const page of firstLevelPages) {
      const isInternal = (await getRedirectedUrl(page.linkUrl)).includes(host);

      if (!isInternal) {
        score = 0;
      }

      const item = {
        menu_voice: page.linkName,
        inspected_page: page.linkUrl,
        external: isInternal ? "Sì" : "No",
      };

      results.push({
        subItems: {
          type: "subitems",
          items: [item],
        },
      });
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
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
