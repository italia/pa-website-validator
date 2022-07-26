"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  buildUrl,
  getHREFValuesDataAttribute,
  loadPageData,
} from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

const auditId = "municipality-feedback-element";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const redResult = auditData.redResult;
const notExecuted = auditData.nonExecuted;

class LoadAudit extends lighthouse.Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

    let score = 0;
    let pagesWithComponent = "";
    let pagesWithoutComponent = "";

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      {
        key: "page_with_component",
        itemType: "text",
        text: "Pagine dove è stato rilevato il componente",
      },
      {
        key: "page_without_component",
        itemType: "text",
        text: "Pagine dove non è stato rilevato il componente",
      },
    ];

    const items = [
      {
        result: redResult,
        page_with_component: pagesWithComponent,
        page_without_component: pagesWithoutComponent,
      },
    ];

    let $ = await loadPageData(url);

    const administrationPage = await getHREFValuesDataAttribute(
      $,
      '[data-element="management"]'
    );
    const servicesPage = await getHREFValuesDataAttribute(
      $,
      '[data-element="all-services"]'
    );
    const newsPage = await getHREFValuesDataAttribute(
      $,
      '[data-element="news"]'
    );
    const lifePage = await getHREFValuesDataAttribute(
      $,
      '[data-element="live"]'
    );

    const firstLevelPages = [
      ...administrationPage,
      ...servicesPage,
      ...lifePage,
      ...newsPage,
    ];

    if (firstLevelPages.length <= 0) {
      items[0].result = notExecuted;
      return {
        score: 0,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    let randomFirstLevelPage =
      firstLevelPages[Math.floor(Math.random() * firstLevelPages.length)];
    if (!randomFirstLevelPage.includes(url)) {
      randomFirstLevelPage = await buildUrl(url, randomFirstLevelPage);
    }

    $ = await loadPageData(randomFirstLevelPage);
    let feedbackElement = $('[data-element="feedback"]');
    let firstLevelFeedbackElement = true;
    if (
      !feedbackElement ||
      feedbackElement.length === 0 ||
      feedbackElement.text().trim() === ""
    ) {
      firstLevelFeedbackElement = false;
    }

    if (servicesPage.length <= 0) {
      items[0].result = notExecuted;
      return {
        score: 0,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    let secondLevelPageUrl = servicesPage[0];
    if (!secondLevelPageUrl.includes(url)) {
      secondLevelPageUrl = await buildUrl(url, servicesPage[0]);
    }

    $ = await loadPageData(secondLevelPageUrl);
    const servicesSecondLevelPages = await getHREFValuesDataAttribute(
      $,
      '[data-element="service-category-link"]'
    );

    if (servicesSecondLevelPages.length <= 0) {
      items[0].result = notExecuted;
      return {
        score: 0,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    let randomSecondLevelServicePage =
      servicesSecondLevelPages[
        Math.floor(Math.random() * servicesSecondLevelPages.length)
      ];
    if (!randomSecondLevelServicePage.includes(url)) {
      randomSecondLevelServicePage = await buildUrl(
        url,
        randomSecondLevelServicePage
      );
    }

    $ = await loadPageData(randomSecondLevelServicePage);
    feedbackElement = $('[data-element="feedback"]');
    let secondLevelFeedbackElement = true;
    if (
      !feedbackElement ||
      feedbackElement.length === 0 ||
      feedbackElement.text().trim() === ""
    ) {
      secondLevelFeedbackElement = false;
    }

    if (firstLevelFeedbackElement && secondLevelFeedbackElement) {
      pagesWithComponent =
        randomFirstLevelPage + " " + randomSecondLevelServicePage;
      items[0].result = greenResult;
      score = 1;
    } else if (firstLevelFeedbackElement && !randomSecondLevelServicePage) {
      pagesWithComponent = randomFirstLevelPage;
      pagesWithoutComponent = randomSecondLevelServicePage;
    } else if (!firstLevelFeedbackElement && randomSecondLevelServicePage) {
      pagesWithComponent = randomSecondLevelServicePage;
      pagesWithoutComponent = randomFirstLevelPage;
    } else {
      pagesWithoutComponent =
        randomFirstLevelPage + " " + randomSecondLevelServicePage;
    }

    items[0].page_with_component = pagesWithComponent;
    items[0].page_without_component = pagesWithoutComponent;

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
