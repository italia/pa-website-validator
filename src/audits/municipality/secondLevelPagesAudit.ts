"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  buildUrl,
  getHREFValuesDataAttribute,
  getPageElementDataAttribute,
  isInternalUrl,
  loadPageData,
} from "../../utils/utils";
import {getButtonUrl, getRandomSecondLevelPages} from "../../utils/municipality/utils";
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
        text: "Titoli aggiuntivi trovati",
      },
    ];

    const items = [
      {
        result: auditData.redResult,
        correct_title_percentage: "",
        correct_title_found: "",
        wrong_title_found: "",
      },
    ];

    console.log(await getRandomSecondLevelPages(url, true));

    let $: CheerioAPI = await loadPageData(url);

    let totalNumberOfTitleFound = 0;
    const itemsPage: itemPage[] = [];

    for (const [key, primaryMenuItem] of Object.entries(primaryMenuItems)) {
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

      if (secondLevelPageHref.length === 0) {
        return {
          score: 0,
          details: Audit.makeTableDetails(
            [{ key: "result", itemType: "text", text: "Risultato" }],
            [
              {
                result: auditData.nonExecuted + primaryMenuItem.data_element,
              },
            ]
          ),
        };
      }

      let secondLevelPagesNames: string[] = [];
      let secondLevelPageUrl = secondLevelPageHref[0];
      if (
        (await isInternalUrl(secondLevelPageUrl)) &&
        !secondLevelPageUrl.includes(url)
      ) {
        secondLevelPageUrl = await buildUrl(url, secondLevelPageHref[0]);
      }

      $ = await loadPageData(secondLevelPageUrl);
      const secondaryMenuDataElement = `[data-element="${primaryMenuItem.secondary_item_data_element[0]}"]`;

      if (key !== "live" && primaryMenuItem.dictionary.length > 0) {
        secondLevelPagesNames = await getPageElementDataAttribute(
          $,
          secondaryMenuDataElement
        );
      } else {
        for (const dataElement of primaryMenuItem.secondary_item_data_element) {
          const buttonDataElement = `[data-element="${dataElement}"]`;
          const pageLinkUrl = await getButtonUrl($, url, buttonDataElement);

          if (pageLinkUrl.length > 0) {
            const $2 = await loadPageData(pageLinkUrl);
            const pageName =
              $2('[data-element="page-name"]').text().trim() ?? "";
            if (pageName.length > 0) {
              secondLevelPagesNames.push(pageName);
            }
          }
        }
      }

      if (secondLevelPagesNames.length === 0) {
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

      for (const pageTitle of secondLevelPagesNames) {
        if (primaryMenuItem.dictionary.includes(pageTitle.toLowerCase())) {
          item.pagesInVocabulary.push(pageTitle);
        } else {
          item.pagesNotInVocabulary.push(pageTitle);
        }
      }

      totalNumberOfTitleFound += secondLevelPagesNames.length;

      itemsPage.push(item);
    }

    let errorVoices: string[] = [];

    const customPrimaryMenuDataElement = `[data-element="${customPrimaryMenuItemsDataElement}"]`;
    const customSecondLevelPageHref = await getHREFValuesDataAttribute(
      $,
      customPrimaryMenuDataElement
    );

    for (let customSecondLevelPageUrl of customSecondLevelPageHref) {
      if (
        (await isInternalUrl(customSecondLevelPageUrl)) &&
        !customSecondLevelPageUrl.includes(url)
      ) {
        customSecondLevelPageUrl = await buildUrl(
          url,
          customSecondLevelPageUrl
        );
      }

      $ = await loadPageData(customSecondLevelPageUrl);

      const customSecondaryMenuDataElement = `[data-element="${customSecondaryMenuItemsDataElement}"]`;
      const customSecondLevelPagesNames = await getPageElementDataAttribute(
        $,
        customSecondaryMenuDataElement
      );

      errorVoices = [...errorVoices, ...customSecondLevelPagesNames];
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
      wrongTitleFound += "ALTRI TITOLI: ";
      wrongTitleFound += errorVoices.join(", ");
      wrongTitleFound += "; ";
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

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
