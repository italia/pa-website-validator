"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { primaryMenuItems } from "../../storage/municipality/menuItems";
import {
  checkOrder,
  getRedirectedUrl,
  missingMenuItems,
} from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";
import { MenuItem } from "../../types/menuItem";
import { getFirstLevelPages } from "../../utils/municipality/utils";

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
    artifacts: LH.Artifacts & { origin: string },
  ): Promise<LH.Audit.ProductBase> {
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
        text: "Voci del menù mancanti",
        subItemsHeading: {
          key: "external",
          itemType: "text",
        },
      },
      {
        key: "wrong_order_menu_voices",
        itemType: "text",
        text: "Voci del menù in ordine errato",
      },
    ];

    const results = [];
    results.push({
      result: redResult,
      found_menu_voices: "",
      missing_menu_voices: "",
      wrong_order_menu_voices: "",
    });

    const firstLevelPages = await getFirstLevelPages(url, false);

    const foundMenuElements = firstLevelPages.map((page) => {
      return page.linkName;
    });

    results[0].found_menu_voices = foundMenuElements.join(", ");

    const menuItem: MenuItem[] = [];

    for (const [, primaryMenuItem] of Object.entries(primaryMenuItems)) {
      menuItem.push({
        name: primaryMenuItem.name,
        regExp: primaryMenuItem.regExp,
      });
    }

    const missingMandatoryElements = missingMenuItems(
      foundMenuElements,
      menuItem,
    );
    results[0].missing_menu_voices = missingMandatoryElements.join(", ");

    const orderResult = checkOrder(menuItem, foundMenuElements);
    results[0].wrong_order_menu_voices =
      orderResult.elementsNotInSequence.join(", ");

    const containsMandatoryElementsResult =
      missingMandatoryElements.length === 0;

    if (
      foundMenuElements.length === 4 &&
      containsMandatoryElementsResult &&
      orderResult.numberOfElementsNotInSequence === 0
    ) {
      score = 1;
      results[0].result = greenResult;
    } else if (
      foundMenuElements.length > 4 &&
      foundMenuElements.length < 8 &&
      containsMandatoryElementsResult &&
      orderResult.numberOfElementsNotInSequence === 0
    ) {
      score = 0.5;
      results[0].result = yellowResult;
    }

    results.push({});

    results.push({
      result: "Voce di menù",
      found_menu_voices: "Link trovato",
      missing_menu_voices: "Pagina interna al dominio",
    });

    const host = new URL(url).hostname.replace("www.", "");
    for (const page of firstLevelPages) {
      const redirectedUrl = await getRedirectedUrl(page.linkUrl);
      const pageHost = new URL(redirectedUrl).hostname.replace("www.", "");
      const isInternal = pageHost.includes(host);

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
