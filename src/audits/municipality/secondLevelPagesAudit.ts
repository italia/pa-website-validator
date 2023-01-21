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

const greenResult = auditData.greenResult;
const yellowResult = auditData.yellowResult;
const redResult = auditData.redResult;
const notExecuted = auditData.nonExecuted;

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
        text: "% dei titoli corretti identificati",
      },
      {
        key: "correct_title_found",
        itemType: "text",
        text: "Titoli corretti identificati",
      },
      {
        key: "wrong_title_found",
        itemType: "text",
        text: "Titoli errati identificati",
      },
    ];

    const items = [
      {
        result: redResult,
        correct_title_percentage: "",
        correct_title_found: "",
        wrong_title_found: "",
      },
    ];

    let $: CheerioAPI = await loadPageData(url);

    const pagesInVocabulary = [];
    const pagesNotInVocabulary = [];
    let totalNumberOfTitleFound = 0;

    for (const [, primaryMenuItem] of Object.entries(primaryMenuItems)) {
      const primaryMenuDataElement = `[data-element="${primaryMenuItem.data_element}"]`;
      const secondLevelPageHref = await getHREFValuesDataAttribute(
        $,
        primaryMenuDataElement
      );
      if (secondLevelPageHref.length <= 0) {
        items[0].result = notExecuted;
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
            pagesInVocabulary.push(pageTitle.toLowerCase());
          } else {
            pagesNotInVocabulary.push(pageTitle.toLowerCase());
          }
        }

        totalNumberOfTitleFound += secondLevelPagesNames.length;
      }
    }

    let j = 0;
    let checkExistence = true;
    let numberOfErrorVoices = 0;

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

      numberOfErrorVoices += secondLevelPagesNames.length;
      j++;
    }

    if (totalNumberOfTitleFound === 0) {
      return {
        score: score,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    const pagesFoundInVocabularyPercentage = parseInt(
      (
        (pagesInVocabulary.length /
          (totalNumberOfTitleFound + numberOfErrorVoices)) *
        100
      ).toFixed(0)
    );

    if (pagesFoundInVocabularyPercentage === 100) {
      items[0].result = greenResult;
      score = 1;
    } else if (
      pagesFoundInVocabularyPercentage > 50 &&
      pagesFoundInVocabularyPercentage < 100
    ) {
      items[0].result = yellowResult;
      score = 0.5;
    }

    items[0].correct_title_percentage = pagesFoundInVocabularyPercentage + "%";
    items[0].correct_title_found = pagesInVocabulary.join(", ");
    items[0].wrong_title_found = pagesNotInVocabulary.join(", ");

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
