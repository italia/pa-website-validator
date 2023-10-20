"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  getPageElementDataAttribute,
  getRedirectedUrl,
  loadPageData,
} from "../../utils/utils";
import {
  menuItems,
  customPrimaryMenuItemsDataElement,
  primaryMenuDataElement,
} from "../../storage/school/menuItems";
import { auditDictionary } from "../../storage/auditDictionary";
import { CheerioAPI } from "cheerio";
import { detectLang, getSecondLevelPages } from "../../utils/school/utils";

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
        key: "correct_voices_percentage",
        itemType: "text",
        text: "% di voci corrette tra quelle usate",
        subItemsHeading: {
          key: "inspected_page",
          itemType: "url",
        },
      },
      {
        key: "correct_voices",
        itemType: "text",
        text: "Voci corrette identificate",
        subItemsHeading: {
          key: "external",
          itemType: "text",
        },
      },
      {
        key: "wrong_voices",
        itemType: "text",
        text: "Voci aggiuntive trovate",
      },
    ];

    const results = [];
    results.push({
      result: auditData.redResult,
      correct_voices_percentage: "",
      correct_voices: "",
      wrong_voices: "",
    });

    let totalNumberOfTitleFound = 0;
    const itemsPage: itemPage[] = [];

    const $: CheerioAPI = await loadPageData(url);
    const foundMenuElements = await getPageElementDataAttribute(
      $,
      '[data-element="menu"]',
      "> li > a"
    );

    const lang = detectLang(foundMenuElements);

    // "Panoramica"
    const overviewText = (
      await getPageElementDataAttribute(
        $,
        `[data-element="${primaryMenuDataElement}"]`
      )
    )[0];

    for (const [, secondaryMenuItem] of Object.entries(menuItems)) {
      const item: itemPage = {
        key: secondaryMenuItem.label[lang],
        pagesInVocabulary: [],
        pagesNotInVocabulary: [],
      };

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
        if (element !== overviewText) {
          if (
            secondaryMenuItem.dictionary[lang].includes(element.toLowerCase())
          ) {
            item.pagesInVocabulary.push(element);
          } else {
            item.pagesNotInVocabulary.push(element);
          }
          totalNumberOfTitleFound++;
        }
      }

      itemsPage.push(item);
    }

    const errorVoices = [];

    const headerUlTest = await getPageElementDataAttribute(
      $,
      `[data-element="${customPrimaryMenuItemsDataElement}"]`,
      "a"
    );

    if (headerUlTest.length > 0) {
      for (const element of headerUlTest) {
        if (element !== overviewText) {
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
      results[0].result = auditData.yellowResult;
    } else if (presentVoicesPercentage === 100) {
      score = 1;
      results[0].result = auditData.greenResult;
    }

    results[0].correct_voices = correctTitleFound;
    results[0].correct_voices_percentage =
      presentVoicesPercentage.toString() + "%";
    results[0].wrong_voices = wrongTitleFound;

    const secondLevelPages = await getSecondLevelPages(url);

    results.push({});

    results.push({
      result: "Voce di menù",
      correct_voices: "Pagina interna al dominio",
      correct_voices_percentage: "Link trovato",
    });

    const host = new URL(url).hostname.replace("www.", "");
    for (const page of secondLevelPages) {
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
