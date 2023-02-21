"use strict";
import * as cheerio from "cheerio";
import puppeteer, { ElementHandle, Page } from "puppeteer";
import { primaryMenuItems } from "../../storage/municipality/menuItems";
import {
  areAllElementsInVocabulary,
  buildUrl,
  getHREFValuesDataAttribute,
  getRandomNString,
  isInternalUrl,
  loadPageData,
} from "../utils";
import { CheerioAPI } from "cheerio";
import { feedbackComponentStructure } from "../../storage/municipality/feedbackComponentStructure";

const getRandomFirstLevelPagesUrl = async (
  url: string,
  numberOfPages = 1
): Promise<string[]> => {
  const $ = await loadPageData(url);
  const pagesUrls: string[] = [];

  for (const [, primaryMenuItem] of Object.entries(primaryMenuItems)) {
    const dataElement = `[data-element="${primaryMenuItem.data_element}"]`;
    let primaryLevelPageUrl = "";
    const element = $(dataElement);
    if (element) {
      primaryLevelPageUrl = $(element).attr()?.href ?? "";
      if (
        primaryLevelPageUrl &&
        primaryLevelPageUrl !== "#" &&
        primaryLevelPageUrl !== ""
      ) {
        if (
          (await isInternalUrl(primaryLevelPageUrl)) &&
          !primaryLevelPageUrl.includes(url)
        ) {
          primaryLevelPageUrl = await buildUrl(url, primaryLevelPageUrl);
        }
      }
    }
    if (primaryLevelPageUrl === "") {
      return [];
    }
    pagesUrls.push(primaryLevelPageUrl);
  }

  return getRandomNString(pagesUrls, numberOfPages);
};

const getRandomSecondLevelPagesUrl = async (
  url: string,
  numberOfPages = 1
): Promise<string[]> => {
  const $ = await loadPageData(url);
  let pagesUrls: string[] = [];

  for (const [key, primaryMenuItem] of Object.entries(primaryMenuItems)) {
    const dataElement = `[data-element="${primaryMenuItem.data_element}"]`;

    const element = $(dataElement);
    if (element) {
      let primaryLevelPageUrl = $(element).attr()?.href;
      if (
        primaryLevelPageUrl &&
        primaryLevelPageUrl !== "#" &&
        primaryLevelPageUrl !== ""
      ) {
        if (
          (await isInternalUrl(primaryLevelPageUrl)) &&
          !primaryLevelPageUrl.includes(url)
        ) {
          primaryLevelPageUrl = await buildUrl(url, primaryLevelPageUrl);
        }
        const $2 = await loadPageData(primaryLevelPageUrl);
        let secondPageUrls = [];
        if (key !== "live") {
          const dataElementSecondaryItem = `[data-element="${primaryMenuItem.secondary_item_data_element[0]}"]`;
          secondPageUrls = await getHREFValuesDataAttribute(
            $2,
            dataElementSecondaryItem
          );
        } else {
          for (const secondaryItemDataElement of primaryMenuItem.secondary_item_data_element) {
            const dataElementSecondaryItem = `[data-element="${secondaryItemDataElement}"]`;
            const buttonUrl = await getButtonUrl(
              $2,
              url,
              dataElementSecondaryItem
            );
            if (buttonUrl !== "") {
              secondPageUrls.push(buttonUrl);
            }
          }
        }
        if (secondPageUrls === []) {
          return [];
        }
        pagesUrls = [...pagesUrls, ...new Set(secondPageUrls)];
      }
    }
  }

  for (let i = 0; i < pagesUrls.length; i++) {
    if ((await isInternalUrl(pagesUrls[i])) && !pagesUrls[i].includes(url)) {
      pagesUrls[i] = await buildUrl(url, pagesUrls[i]);
    }
  }

  return getRandomNString(pagesUrls, numberOfPages);
};

const getRandomThirdLevelPagesUrl = async (
  url: string,
  pageUrl: string,
  linkDataElement: string,
  numberOfPages = 1
) => {
  if (pageUrl.length === 0) {
    return [];
  }
  let $ = await loadPageData(url);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
  });
  try {
    const page: Page = await browser.newPage();
    await page.goto(pageUrl, {
      waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
    });

    let clickButton = true;
    while (clickButton) {
      try {
        const element = await page.$('[data-element="load-other-cards"]');
        if (!element) {
          clickButton = false;
          continue;
        }
        const xhrCatcher = page.waitForResponse(
          (r) => r.request().method() != "OPTIONS"
        );
        await element.click({ delay: 500 });
        await xhrCatcher;
        break;
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
    const data = await page.content();
    $ = cheerio.load(data);
    await browser.close();
  } catch (e) {
    await browser.close();
  }

  const pagesUrls = await getHREFValuesDataAttribute($, linkDataElement);

  for (let i = 0; i < pagesUrls.length; i++) {
    if ((await isInternalUrl(pagesUrls[i])) && !pagesUrls[i].includes(url)) {
      pagesUrls[i] = await buildUrl(url, pagesUrls[i]);
    }
  }

  return getRandomNString(pagesUrls, numberOfPages);
};

const getPrimaryPageUrl = async (url: string, dataElement: string) => {
  const $ = await loadPageData(url);

  const servicesPageHref = await getHREFValuesDataAttribute(
    $,
    `[data-element="${dataElement}"]`
  );
  if (servicesPageHref.length <= 0) {
    return "";
  }

  let allServicesUrl = servicesPageHref[0];
  if ((await isInternalUrl(allServicesUrl)) && !allServicesUrl.includes(url)) {
    allServicesUrl = await buildUrl(url, allServicesUrl);
  }

  return allServicesUrl;
};

const checkFeedbackComponent = async (url: string) => {
  let score = 1;
  const errors: string[] = [];

  const $: CheerioAPI = await loadPageData(url);

  const feedbackComponent = $(
    `[data-element="${feedbackComponentStructure.component.dataElement}"]`
  );
  if (feedbackComponent.length !== 1) {
    errors.push(feedbackComponentStructure.component.missingError);
    score = 0;
    return {
      score: score,
      errors: errors,
    };
  }

  const feedbackTitleElement = $(feedbackComponent).find(
    `[data-element="${feedbackComponentStructure.title.dataElement}"]`
  );
  if (feedbackTitleElement.length !== 1) {
    if (score > 0.5) score = 0.5;
    errors.push(feedbackComponentStructure.title.missingError);
  }

  if (
    feedbackTitleElement.length === 1 &&
    feedbackTitleElement.text().trim().toLocaleLowerCase() !==
      feedbackComponentStructure.title.text.toLowerCase()
  ) {
    if (score > 0) score = 0;
    errors.push(feedbackComponentStructure.title.error);
  }

  let existsRateComponents = false; //true if there is at least one rating inputs
  let checkRateComponent = true; //false if there are not the right amount of rating inputs
  let existsRatingQAComponents = true; //false if there is not a rating component (positive or negative)
  let checkRateComponentAssociation = true; //false if the association between rating input and rating components is incorrect
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
  });
  try {
    const page: Page = await browser.newPage();
    await page.goto(url, {
      waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
    });

    const feedbackRatingPositiveElement = await page.$(
      `[data-element="${feedbackComponentStructure.positive_rating.dataElement}"]`
    );
    const feedbackRatingNegativeElement = await page.$(
      `[data-element="${feedbackComponentStructure.negative_rating.dataElement}"]`
    );

    for (
      let i = 1;
      i <= feedbackComponentStructure.rate.numberOfComponents;
      i++
    ) {
      const feedbackRateElement = await page.$(
        `[data-element="${feedbackComponentStructure.rate.dataElement + i}"]`
      );
      if (feedbackRateElement && !existsRateComponents) {
        existsRateComponents = true;
      }

      if (!feedbackRateElement) {
        checkRateComponent = false;
        continue;
      }

      await feedbackRateElement.click({ delay: 100 });
      if (!feedbackRatingPositiveElement || !feedbackRatingNegativeElement) {
        existsRatingQAComponents = false;
        break;
      }

      if (
        i <= feedbackComponentStructure.rate.positiveThreshold &&
        ((await isLocatorReady(feedbackRatingPositiveElement, page)) ||
          !(await isLocatorReady(feedbackRatingNegativeElement, page)))
      ) {
        checkRateComponentAssociation = false;
      }

      if (
        i > feedbackComponentStructure.rate.positiveThreshold &&
        (!(await isLocatorReady(feedbackRatingPositiveElement, page)) ||
          (await isLocatorReady(feedbackRatingNegativeElement, page)))
      ) {
        checkRateComponentAssociation = false;
      }
    }
    await browser.close();
  } catch (e) {
    await browser.close();
  }

  if (!existsRateComponents) {
    if (score > 0.5) score = 0.5;
    errors.push(feedbackComponentStructure.rate.missingError);
  }

  if (existsRateComponents && !checkRateComponent) {
    if (score > 0) score = 0;
    errors.push(feedbackComponentStructure.rate.error);
  }

  if (!existsRatingQAComponents) {
    if (score > 0.5) score = 0.5;
  }

  if (existsRatingQAComponents && !checkRateComponentAssociation) {
    if (score > 0) score = 0;
    errors.push(feedbackComponentStructure.rate.errorAssociation);
  }

  const feedbackRatingPositiveElement = $(feedbackComponent).find(
    `[data-element="${feedbackComponentStructure.positive_rating.dataElement}"]`
  );
  if (feedbackRatingPositiveElement.length !== 1) {
    if (score > 0.5) score = 0.5;
    errors.push(feedbackComponentStructure.positive_rating.missingError);
  }
  if (feedbackRatingPositiveElement.length === 1) {
    const feedbackRatingPositiveQuestionElement = $(
      feedbackRatingPositiveElement
    ).find(
      `[data-element="${feedbackComponentStructure.positive_rating.question.dataElement}"]`
    );
    if (feedbackRatingPositiveQuestionElement.length === 0) {
      if (score > 0.5) score = 0.5;
      errors.push(
        feedbackComponentStructure.positive_rating.question.missingError
      );
    }
    if (
      feedbackRatingPositiveQuestionElement.length === 1 &&
      feedbackRatingPositiveQuestionElement.text().trim().toLowerCase() !==
        feedbackComponentStructure.positive_rating.question.text.toLowerCase()
    ) {
      if (score > 0) score = 0;
      errors.push(feedbackComponentStructure.positive_rating.question.error);
    }

    const feedbackRatingPositiveAnswersElements = $(
      feedbackRatingPositiveElement
    ).find(
      `[data-element="${feedbackComponentStructure.positive_rating.answers.dataElement}"]`
    );
    const feedbackRatingPositiveAnswers: string[] = [];
    for (const feedbackRatingPositiveAnswersElement of feedbackRatingPositiveAnswersElements) {
      feedbackRatingPositiveAnswers.push(
        $(feedbackRatingPositiveAnswersElement).text().trim()
      );
    }

    const allCorrectAnswers = await areAllElementsInVocabulary(
      feedbackRatingPositiveAnswers,
      feedbackComponentStructure.positive_rating.answers.texts
    );

    if (feedbackRatingPositiveAnswersElements.length === 0) {
      if (score > 0.5) score = 0.5;
      errors.push(
        feedbackComponentStructure.positive_rating.answers.missingError
      );
    }
    if (
      feedbackRatingPositiveAnswersElements.length > 0 &&
      !allCorrectAnswers.allArgumentsInVocabulary
    ) {
      if (score > 0) score = 0;
      errors.push(feedbackComponentStructure.positive_rating.answers.error);
    }
  }

  const feedbackRatingNegativeElement = $(feedbackComponent).find(
    `[data-element="${feedbackComponentStructure.negative_rating.dataElement}"]`
  );
  if (feedbackRatingNegativeElement.length !== 1) {
    if (score > 0.5) score = 0.5;
    errors.push(feedbackComponentStructure.negative_rating.missingError);
  }
  if (feedbackRatingNegativeElement.length === 1) {
    const feedbackRatingNegativeQuestionElement = $(
      feedbackRatingNegativeElement
    ).find(
      `[data-element="${feedbackComponentStructure.negative_rating.question.dataElement}"]`
    );
    if (feedbackRatingNegativeQuestionElement.length === 0) {
      if (score > 0.5) score = 0.5;
      errors.push(
        feedbackComponentStructure.negative_rating.question.missingError
      );
    }
    if (
      feedbackRatingNegativeQuestionElement.length === 1 &&
      feedbackRatingNegativeQuestionElement.text().trim().toLowerCase() !==
        feedbackComponentStructure.negative_rating.question.text.toLowerCase()
    ) {
      if (score > 0) score = 0;
      errors.push(feedbackComponentStructure.negative_rating.question.error);
    }

    const feedbackRatingNegativeAnswersElements = $(
      feedbackRatingNegativeElement
    ).find(
      `[data-element="${feedbackComponentStructure.negative_rating.answers.dataElement}"]`
    );
    const feedbackRatingNegativeAnswers: string[] = [];
    for (const feedbackRatingNegativeAnswersElement of feedbackRatingNegativeAnswersElements) {
      feedbackRatingNegativeAnswers.push(
        $(feedbackRatingNegativeAnswersElement).text().trim()
      );
    }

    const allCorrectAnswers = await areAllElementsInVocabulary(
      feedbackRatingNegativeAnswers,
      feedbackComponentStructure.negative_rating.answers.texts
    );

    if (feedbackRatingNegativeAnswersElements.length === 0) {
      if (score > 0.5) score = 0.5;
      errors.push(
        feedbackComponentStructure.negative_rating.answers.missingError
      );
    }
    if (
      feedbackRatingNegativeAnswersElements.length > 0 &&
      !allCorrectAnswers.allArgumentsInVocabulary
    ) {
      if (score > 0) score = 0;
      errors.push(feedbackComponentStructure.negative_rating.answers.error);
    }
  }

  const feedbackInputText = $(feedbackComponent).find(
    `[data-element="${feedbackComponentStructure.input_text.dataElement}"]`
  );
  if (feedbackInputText.length !== 1) {
    if (score > 0.5) score = 0.5;
    errors.push(feedbackComponentStructure.input_text.missingError);
  }

  return {
    score: score,
    errors: errors,
  };
};

async function isLocatorReady(element: ElementHandle<Element>, page: Page) {
  const isVisibleHandle = await page.evaluateHandle((e) => {
    const style = window.getComputedStyle(e);
    return (
      style &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }, element);

  const visible = await isVisibleHandle.jsonValue();
  const box = await element.boxModel();
  return !!(visible && box);
}

const getButtonUrl = async (
  $: CheerioAPI,
  url: string,
  dataElement: string
) => {
  const button = $(dataElement).attr();
  if (
    button !== null &&
    button !== undefined &&
    "onclick" in button &&
    button.onclick.includes("location.href")
  ) {
    const onClick: string = button.onclick;
    let secondPageLink = onClick.substring(
      onClick.indexOf("'") + 1,
      onClick.lastIndexOf("'")
    );
    if (!secondPageLink.includes(url)) {
      secondPageLink = await buildUrl(url, secondPageLink);
    }
    return secondPageLink;
  }
  return "";
};

export {
  getRandomFirstLevelPagesUrl,
  getRandomSecondLevelPagesUrl,
  getRandomThirdLevelPagesUrl,
  checkFeedbackComponent,
  getPrimaryPageUrl,
  getButtonUrl,
};
