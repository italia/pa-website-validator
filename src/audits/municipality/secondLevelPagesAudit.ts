"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  buildUrl,
  getHREFValuesDataAttribute,
  getPageElementDataAttribute,
  isInternalRedirectUrl,
  isInternalUrl,
  loadPageData,
} from "../../utils/utils";
import { getSecondLevelPages } from "../../utils/municipality/utils";
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
        key: "correct_title_percentage",
        itemType: "text",
        text: "% di titoli corretti tra quelli usati",
        subItemsHeading: {
          key: "inspected_page",
          itemType: "url",
        },
      },
      {
        key: "correct_title_found",
        itemType: "text",
        text: "Titoli corretti identificati",
        subItemsHeading: {
          key: "external",
          itemType: "text",
        },
      },
      {
        key: "wrong_title_found",
        itemType: "text",
        text: "Titoli aggiuntivi trovati",
      },
    ];

    const results = [];
    results.push({
      result: auditData.redResult,
      correct_title_percentage: "",
      correct_title_found: "",
      wrong_title_found: "",
    });

    const secondLevelPages = await getSecondLevelPages(url, true);
    const correctPages = [];

    let totalNumberOfTitleFound = 0;
    const itemsPage: itemPage[] = [];

    for (const [key, primaryMenuItem] of Object.entries(primaryMenuItems)) {
      const item: itemPage = {
        key: primaryMenuItem.label,
        pagesInVocabulary: [],
        pagesNotInVocabulary: [],
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const secondLevelPagesSection = secondLevelPages[key];
      for (const page of secondLevelPagesSection) {
        if (primaryMenuItem.dictionary.includes(page.linkName.toLowerCase())) {
          item.pagesInVocabulary.push(page.linkName);
          correctPages.push(page);
        } else {
          item.pagesNotInVocabulary.push(page.linkName);
        }
      }

      totalNumberOfTitleFound += secondLevelPagesSection.length;

      itemsPage.push(item);
    }

    let errorVoices: string[] = [];

    let $: CheerioAPI = await loadPageData(url);

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
      results[0].result = auditData.greenResult;
      score = 1;
    } else if (
      pagesFoundInVocabularyPercentage > 50 &&
      pagesFoundInVocabularyPercentage < 100
    ) {
      results[0].result = auditData.yellowResult;
      score = 0.5;
    }

    results[0].correct_title_percentage =
      pagesFoundInVocabularyPercentage + "%";
    results[0].correct_title_found = correctTitleFound;
    results[0].wrong_title_found = wrongTitleFound;

    results.push({});

    results.push({
      result: "Voce di menù",
      correct_title_percentage: "Link trovato",
      correct_title_found: "Pagina interna al dominio",
    });

    for (const page of correctPages) {
      const isInternal = await isInternalRedirectUrl(url, page.linkUrl);

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
