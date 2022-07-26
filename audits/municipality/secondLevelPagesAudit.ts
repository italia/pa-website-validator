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
import { secondLevelPageNames } from "../../storage/municipality/controlledVocabulary";
import { auditDictionary } from "../../storage/auditDictionary"
import { CheerioAPI } from "cheerio";

const Audit = lighthouse.Audit;

const auditId = "municipality-second-level-pages"
const auditData = auditDictionary[auditId]

const greenResult = auditData.greenResult
const yellowResult = auditData.yellowResult
const redResult = auditData.redResult
const notExecuted = auditData.nonExecuted

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

    const secondLevelPageHref = await getHREFValuesDataAttribute(
      $,
      '[data-element="all-services"]'
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

    $ = await loadPageData(secondLevelPageUrl);
    const servicesSecondLevelPagesNames = await getPageElementDataAttribute(
      $,
      '[data-element="service-category-link"]'
    );

    const pagesInVocabulary = [];
    const pagesNotInVocabulary = [];
    for (const pageTitle of servicesSecondLevelPagesNames) {
      if (secondLevelPageNames.includes(pageTitle.toLowerCase())) {
        pagesInVocabulary.push(pageTitle.toLowerCase());
      } else {
        pagesNotInVocabulary.push(pageTitle.toLowerCase());
      }
    }

    let pagesFoundInVocabularyPercentage = 0;
    if (servicesSecondLevelPagesNames.length > 0) {
      pagesFoundInVocabularyPercentage = parseInt(
        (
          (pagesInVocabulary.length / servicesSecondLevelPagesNames.length) *
          100
        ).toFixed(0)
      );
    }

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
