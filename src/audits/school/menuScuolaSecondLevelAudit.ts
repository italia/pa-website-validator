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
        key: "wrong_voices",
        itemType: "text",
        text: "Voci aggiuntive trovate",
      },
    ];

    const items = [
      {
        result: auditData.redResult,
        correct_voices_percentage: "",
        correct_voices: "",
        wrong_voices: "",
      },
    ];

    let totalNumberOfTitleFound = 0;
    const itemsPage: itemPage[] = [];

    for (const [, secondaryMenuItem] of Object.entries(menuItems)) {
      const item: itemPage = {
        key: secondaryMenuItem.label,
        pagesInVocabulary: [],
        pagesNotInVocabulary: [],
      };

      const $: CheerioAPI = await loadPageData(url);
      const menuDataElement = `[data-element="${secondaryMenuItem.data_element}"]`;

      const headerUlTest = await getPageElementDataAttribute(
        $,
        menuDataElement,
        "a"
      );

      if (headerUlTest.length === 0) {
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

      for (const element of headerUlTest) {
        if (element !== "Panoramica") {
          if (secondaryMenuItem.dictionary.includes(element.toLowerCase())) {
            item.pagesInVocabulary.push(element);
          } else {
            item.pagesNotInVocabulary.push(element);
          }
        }
        totalNumberOfTitleFound++;
      }

      itemsPage.push(item);
    }

    const errorVoices = [];

    const $: CheerioAPI = await loadPageData(url);
    const headerUlTest = await getPageElementDataAttribute(
      $,
      `[data-element="${customPrimaryMenuItemsDataElement}"]`,
      "a"
    );

    if (headerUlTest.length > 0) {
      for (const element of headerUlTest) {
        if (element !== "Panoramica") {
          errorVoices.push(element.toLowerCase());
        }
      }
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

    if (errorVoices.length > 0) {
      wrongTitleFound += "ALTRE VOCI: ";
      wrongTitleFound += errorVoices.join(", ");
      wrongTitleFound += "; ";
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
    items[0].wrong_voices = wrongTitleFound;

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
