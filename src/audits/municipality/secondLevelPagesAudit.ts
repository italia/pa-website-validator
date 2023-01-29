"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  buildUrl,
  getHREFValuesDataAttribute,
  getPageElementDataAttribute,
  loadPageData,
} from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";
import { CheerioAPI } from "cheerio";
import {
  customSecondaryMenuItemsDataElement,
  primaryMenuItems,
} from "../../storage/municipality/menuItems";
import { customPrimaryMenuItemsDataElement } from "../../storage/municipality/menuItems";

const Audit = lighthouse.Audit;

const auditId = "municipality-second-level-pages";
const auditData = auditDictionary[auditId];

interface itemPage {
  key: string;
  pagesInVocabulary: string[];
  pagesNotInVocabulary: string[];
}

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
        key: "correct_title_percentage",
        itemType: "text",
        text: "% di titoli corretti tra quelli usati",
      },
      {
        key: "correct_title_found",
        itemType: "text",
        text: "Titoli corretti identificati",
      },
      {
        key: "wrong_title_found",
        itemType: "text",
        text: "Titoli non usati",
      },
    ];

    const items = [
      {
        result: auditData.redResult,
        correct_title_percentage: "",
        correct_title_found: "",
        wrong_title_found: "",
        error_voices: "",
      },
    ];

    let $: CheerioAPI = await loadPageData(url);

    let totalNumberOfTitleFound = 0;
    const itemsPage: itemPage[] = [];

    for (const [, primaryMenuItem] of Object.entries(primaryMenuItems)) {
      const item: itemPage = {
        key: primaryMenuItem.label,
        pagesInVocabulary: [],
        pagesNotInVocabulary: [],
      };

      const primaryMenuDataElement = `[data-element="${primaryMenuItem.data_element}"]`;
      const secondLevelPageHref = await getHREFValuesDataAttribute(
        $,
        primaryMenuDataElement
      );
      if (secondLevelPageHref.length <= 0) {
        items[0].result = auditData.nonExecuted;
        return {
          score: score,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      let secondLevelPageUrl = secondLevelPageHref[0];
      if (!secondLevelPageUrl.includes(url)) {
        secondLevelPageUrl = await buildUrl(url, secondLevelPageHref[0]);
      }

      if (primaryMenuItem.dictionary.length > 0) {
        $ = await loadPageData(secondLevelPageUrl);
        const secondaryMenuDataElement = `[data-element="${primaryMenuItem.secondary_item_data_element}"]`;
        const secondLevelPagesNames = await getPageElementDataAttribute(
          $,
          secondaryMenuDataElement
        );

        for (const pageTitle of secondLevelPagesNames) {
          if (primaryMenuItem.dictionary.includes(pageTitle.toLowerCase())) {
            item.pagesInVocabulary.push(pageTitle.toLowerCase());
          } else {
            item.pagesNotInVocabulary.push(pageTitle.toLowerCase());
          }
        }

        totalNumberOfTitleFound += secondLevelPagesNames.length;
      }

      itemsPage.push(item);
    }

    let j = 0;
    let checkExistence = true;
    let errorVoices: string[] = [];

    while (checkExistence) {
      const primaryMenuDataElement = `[data-element="${
        customPrimaryMenuItemsDataElement + j.toString()
      }"]`;
      const secondLevelPageHref = await getHREFValuesDataAttribute(
        $,
        primaryMenuDataElement
      );
      if (secondLevelPageHref.length <= 0) {
        checkExistence = false;
        continue;
      }

      let secondLevelPageUrl = secondLevelPageHref[0];
      if (!secondLevelPageUrl.includes(url)) {
        secondLevelPageUrl = await buildUrl(url, secondLevelPageHref[0]);
      }

      $ = await loadPageData(secondLevelPageUrl);
      const secondaryMenuDataElement = `[data-element="${customSecondaryMenuItemsDataElement}"]`;
      const secondLevelPagesNames = await getPageElementDataAttribute(
        $,
        secondaryMenuDataElement
      );

      errorVoices = [...errorVoices, ...secondLevelPagesNames];
      j++;
    }

    if (totalNumberOfTitleFound === 0) {
      return {
        score: score,
        details: Audit.makeTableDetails(headings, items),
      };
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
        correctTitleFound += "; ";
      }
    }

    const pagesFoundInVocabularyPercentage = parseInt(
      (
        (pagesInVocabulary / (totalNumberOfTitleFound + errorVoices.length)) *
        100
      ).toFixed(0)
    );

    if (pagesFoundInVocabularyPercentage === 100) {
      items[0].result = auditData.greenResult;
      score = 1;
    } else if (
      pagesFoundInVocabularyPercentage > 50 &&
      pagesFoundInVocabularyPercentage < 100
    ) {
      items[0].result = auditData.yellowResult;
      score = 0.5;
    }

    items[0].correct_title_percentage = pagesFoundInVocabularyPercentage + "%";
    items[0].correct_title_found = correctTitleFound;
    items[0].wrong_title_found = wrongTitleFound;
    items[0].error_voices = errorVoices.join(", ");

    if (errorVoices.length > 0) {
      headings.push({
        key: "error_voices",
        itemType: "text",
        text: "Titoli aggiuntivi trovati",
      });
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
