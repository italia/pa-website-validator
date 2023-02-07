"use strict";
import crawlerTypes from "../types/crawler-types";
import orderType = crawlerTypes.orderResult;
import * as cheerio from "cheerio";
import puppeteer, { ElementHandle, Page } from "puppeteer";
import { CheerioAPI } from "cheerio";
import axios from "axios";
import vocabularyResult = crawlerTypes.vocabularyResult;
import NodeCache from "node-cache";
import { MenuItem } from "../types/menuItem";
import { feedbackComponentStructure } from "../storage/municipality/feedbackComponentStructure";

const loadPageCache = new NodeCache();

const loadPageData = async (url: string): Promise<CheerioAPI> => {
  let data = "";
  const data_from_cache = loadPageCache.get(url);
  if (data_from_cache !== undefined) {
    return <CheerioAPI>data_from_cache;
  }
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    // await page.goto(url, {waitUntil: 'networkidle2'});
    data = await page.content();
    await browser.close();
    loadPageCache.set(url, cheerio.load(data));
    return cheerio.load(data);
  } catch (ex) {
    await browser.close();
    loadPageCache.set(url, cheerio.load(data));
    return cheerio.load(data);
  }
};

const getPageElementDataAttribute = async (
  $: CheerioAPI,
  elementDataAttribute: string,
  tag = ""
): Promise<string[]> => {
  const returnValues: string[] = [];

  let elements = $(elementDataAttribute);

  if (tag !== "") {
    if (Object.keys(elements).length === 0) {
      return returnValues;
    }

    elements = $(elements).find(tag);
  }

  if (Object.keys(elements).length === 0) {
    return returnValues;
  }

  for (const element of elements) {
    const stringElement = $(element).text().trim() ?? null;
    if (stringElement) {
      returnValues.push(stringElement);
    }
  }

  return [...new Set(returnValues)];
};

const getElementHrefValuesDataAttribute = async (
  $: CheerioAPI,
  elementDataAttribute: string,
  tag = ""
): Promise<Array<{ label: string; url: string }> | []> => {
  const elements = $(elementDataAttribute);

  if (Object.keys(elements).length === 0) {
    return [];
  }

  const innerElements = $(elements).find(tag);

  if (Object.keys(innerElements).length === 0) {
    return [];
  }

  const urls = [];
  for (const innerElement of innerElements) {
    const label = $(innerElement).text().trim() ?? "";
    const url = $(innerElement).attr()?.href;
    if (url && url !== "#" && url !== "") {
      urls.push({
        label: label,
        url: url,
      });
    }
  }

  return urls;
};

const getHREFValuesDataAttribute = async (
  $: CheerioAPI,
  elementDataAttribute: string
): Promise<string[]> => {
  const serviceUrls = [];

  const elements = $(elementDataAttribute);
  for (const element of elements) {
    const elementObj = $(element).attr();
    if (
      elementObj &&
      "href" in elementObj &&
      elementObj.href !== "#" &&
      elementObj.href !== ""
    ) {
      serviceUrls.push(elementObj.href);
    }
  }

  if (serviceUrls.length <= 0) {
    return [];
  }

  return serviceUrls;
};

const checkCSSClassesOnPage = async (url: string, cssClasses: string[]) => {
  const $ = await loadPageData(url);
  const foundClasses: string[] = [];

  for (const cssClass of cssClasses) {
    const elements = $(`.${cssClass}`);
    if (elements.length > 0) {
      foundClasses.push(cssClass);
    }
  }

  return foundClasses;
};

const buildUrl = async (url: string, path: string): Promise<string> => {
  return new URL(path, url).href;
};

const isInternalUrl = async (url: string) => {
  return (
    !url.includes("www") && !url.includes("http") && !url.includes("https")
  );
};

const isHttpsUrl = async (url: string) => {
  return url.includes("https");
};

const toMenuItem = (str: string): MenuItem => ({
  name: str,
  regExp: new RegExp(`^${str}$`),
});

const checkOrder = (
  mandatoryElements: MenuItem[],
  foundElements: string[]
): orderType => {
  const newMandatoryElements = mandatoryElements.filter((e) =>
    foundElements.some((f) => e.regExp.test(f))
  );
  const newFoundElements = foundElements.filter((e) =>
    newMandatoryElements.some((f) => f.regExp.test(e))
  );
  let numberOfElementsNotInSequence = 0;
  const elementsNotInSequence = [];

  //The first element is always in the right order
  for (let i = 1; i < newFoundElements.length; i++) {
    const indexInMandatory = newMandatoryElements.findIndex((e) =>
      e.regExp.test(newFoundElements[i])
    );
    let isInSequence = true;

    if (indexInMandatory !== newMandatoryElements.length - 1) {
      if (i === newFoundElements.length - 1) {
        isInSequence = false;
      } else if (
        !newMandatoryElements[indexInMandatory + 1].regExp.test(
          newFoundElements[i + 1]
        )
      ) {
        isInSequence = false;
      }
    }

    if (indexInMandatory !== 0) {
      if (i === 0) {
        isInSequence = false;
      } else if (
        !newMandatoryElements[indexInMandatory - 1].regExp.test(
          newFoundElements[i - 1]
        )
      ) {
        isInSequence = false;
      }
    }

    if (!isInSequence) {
      numberOfElementsNotInSequence++;
      elementsNotInSequence.push(newFoundElements[i]);
    }
  }

  return {
    numberOfElementsNotInSequence: numberOfElementsNotInSequence,
    elementsNotInSequence: elementsNotInSequence,
  };
};

const missingMenuItems = (
  menuElements: string[],
  mandatoryElements: MenuItem[]
): string[] =>
  mandatoryElements
    .filter((e) => menuElements.every((f) => !e.regExp.test(f)))
    .map((e) => e.name);

const urlExists = async (
  url: string,
  href: string,
  checkHttps = false
): Promise<{ result: boolean; reason: string; inspectedUrl: string }> => {
  let inspectUrl = href;
  if ((await isInternalUrl(href)) && !href.includes(url)) {
    inspectUrl = await buildUrl(url, href);
  }

  try {
    if (checkHttps) {
      if (!(await isHttpsUrl(inspectUrl))) {
        return {
          result: false,
          reason: " Protocollo HTTPS mancante nell'URL.",
          inspectedUrl: inspectUrl,
        };
      }
    }

    let statusCode = undefined;
    try {
      const response = await axios.get(inspectUrl);
      statusCode = response.status;
    } catch (e) {
      return {
        result: false,
        reason: " Hostname non valido.",
        inspectedUrl: inspectUrl,
      };
    }

    if (statusCode === undefined || statusCode < 200 || statusCode >= 400) {
      return {
        result: false,
        reason: " Pagina non trovata.",
        inspectedUrl: inspectUrl,
      };
    }

    return {
      result: true,
      reason: "",
      inspectedUrl: inspectUrl,
    };
  } catch (ex) {
    console.log(ex);

    return {
      result: false,
      reason: "",
      inspectedUrl: inspectUrl,
    };
  }
};

const checkFeedbackComponent = async (url: string) => {
  const errors: string[] = [];

  const $: CheerioAPI = await loadPageData(url);

  const feedbackComponent = $(
    `[data-element="${feedbackComponentStructure.component.dataElement}"]`
  );
  if (feedbackComponent.length !== 1) {
    errors.push(feedbackComponentStructure.component.error);
    return errors;
  }

  const feedbackTitleElement = $(feedbackComponent).find(
    `[data-element="${feedbackComponentStructure.title.dataElement}"]`
  );
  if (
    feedbackTitleElement.length !== 1 ||
    feedbackTitleElement.text().trim() !== feedbackComponentStructure.title.text
  ) {
    errors.push(feedbackComponentStructure.title.error);
  }

  let checkRateComponent = true;
  let checkRateComponentAssociation = true;
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

    for (let i = 1; i <= feedbackComponentStructure.rate.number; i++) {
      const feedbackRateElement = await page.$(
        `[data-element="${feedbackComponentStructure.rate.dataElement + i}"]`
      );
      if (!feedbackRateElement) {
        checkRateComponent = false;
        continue;
      }
      await feedbackRateElement.click({ delay: 200 });
      if (i <= 3) {
        if (
          !feedbackRatingPositiveElement ||
          !feedbackRatingNegativeElement ||
          (await isLocatorReady(feedbackRatingPositiveElement, page)) ||
          !(await isLocatorReady(feedbackRatingNegativeElement, page))
        ) {
          checkRateComponentAssociation = false;
        }
      } else {
        if (
          !feedbackRatingPositiveElement ||
          !feedbackRatingNegativeElement ||
          !(await isLocatorReady(feedbackRatingPositiveElement, page)) ||
          (await isLocatorReady(feedbackRatingNegativeElement, page))
        ) {
          checkRateComponentAssociation = false;
        }
      }
    }
    await browser.close();
  } catch (e) {
    await browser.close();
  }

  if (!checkRateComponent) {
    errors.push(feedbackComponentStructure.rate.error);
  }

  if (!checkRateComponentAssociation) {
    errors.push(feedbackComponentStructure.rate.errorAssociation);
  }

  const feedbackRatingPositiveElement = $(feedbackComponent).find(
    `[data-element="${feedbackComponentStructure.positive_rating.dataElement}"]`
  );
  if (feedbackRatingPositiveElement.length !== 1) {
    errors.push(feedbackComponentStructure.positive_rating.error);
  } else {
    const feedbackRatingPositiveQuestionElement = $(
      feedbackRatingPositiveElement
    ).find(
      `[data-element="${feedbackComponentStructure.positive_rating.question.dataElement}"]`
    );
    if (
      feedbackRatingPositiveQuestionElement.length === 0 ||
      feedbackRatingPositiveQuestionElement.text().trim() !==
        feedbackComponentStructure.positive_rating.question.text
    ) {
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

    if (
      feedbackRatingPositiveAnswersElements.length === 0 ||
      !allCorrectAnswers.allArgumentsInVocabulary
    ) {
      errors.push(feedbackComponentStructure.positive_rating.answers.error);
    }
  }

  const feedbackRatingNegativeElement = $(feedbackComponent).find(
    `[data-element="${feedbackComponentStructure.negative_rating.dataElement}"]`
  );
  if (feedbackRatingNegativeElement.length !== 1) {
    errors.push(feedbackComponentStructure.negative_rating.error);
  } else {
    const feedbackRatingNegativeQuestionElement = $(
      feedbackRatingNegativeElement
    ).find(
      `[data-element="${feedbackComponentStructure.negative_rating.question.dataElement}"]`
    );
    if (
      feedbackRatingNegativeQuestionElement.length === 0 ||
      feedbackRatingNegativeQuestionElement.text().trim() !==
        feedbackComponentStructure.negative_rating.question.text
    ) {
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

    if (
      feedbackRatingNegativeAnswersElements.length === 0 ||
      !allCorrectAnswers.allArgumentsInVocabulary
    ) {
      errors.push(feedbackComponentStructure.negative_rating.answers.error);
    }
  }

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

  const feedbackInputText = $(feedbackComponent).find(
    `[data-element="${feedbackComponentStructure.input_text.dataElement}"]`
  );
  if (
    feedbackInputText.length !== 1 ||
    feedbackInputText.attr("type") !== "text"
  ) {
    errors.push(feedbackComponentStructure.input_text.error);
  }

  return errors;
};
const areAllElementsInVocabulary = async (
  pageArguments: string[],
  vocabularyElements: string[]
): Promise<vocabularyResult> => {
  let result = true;

  if (pageArguments.length <= 0) {
    result = false;
  }

  const lowerCasedVocabulary = vocabularyElements.map((vocabularyElements) =>
    vocabularyElements.toLowerCase()
  );

  const elementNotIncluded = [];
  const elementIncluded = [];
  for (const pageArgument of pageArguments) {
    if (lowerCasedVocabulary.indexOf(pageArgument.toLowerCase()) === -1) {
      result = false;
      elementNotIncluded.push(pageArgument.toLowerCase());
    } else {
      elementIncluded.push(pageArgument.toLowerCase());
    }
  }

  return {
    allArgumentsInVocabulary: result,
    elementNotIncluded: elementNotIncluded,
    elementIncluded: elementIncluded,
  };
};

const getRandomNString = async (array: string[], numberOfElements: number) => {
  if (array.length <= 0) {
    return [];
  }

  array = [...new Set(array)];

  if (numberOfElements > array.length || numberOfElements === -1) {
    return array;
  }

  array = array.sort(() => Math.random() - 0.5);
  array = array.slice(0, numberOfElements);

  return array;
};

const checkBreadcrumb = (array: string[]) => {
  if (array.length === 0) return false;

  const indexService = array.indexOf("servizi");

  if (indexService < 0 || indexService + 1 >= array.length) return false;

  return array[indexService + 1].length >= 3;
};

const cmsThemeRx =
  /\/\*!\s*Theme Name:.*\s+Author:.*\s+Description:\s+Design (Comuni|Scuole) Italia .*(?<name>WordPress|Drupal).*\s+Version:\s+(?<version>.*)\s+License:.*\s+Text Domain: design_(comuni|scuole)_italia\s*\*\//;

const getAllPageHTML = async (url: string): Promise<string> => {
  const $: CheerioAPI = await loadPageData(url);

  return $("html").text() ?? "";
};

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
  toMenuItem,
  checkOrder,
  missingMenuItems,
  loadPageData,
  checkCSSClassesOnPage,
  getRandomNString,
  checkFeedbackComponent,
  getPageElementDataAttribute,
  getHREFValuesDataAttribute,
  getElementHrefValuesDataAttribute,
  getButtonUrl,
  isInternalUrl,
  isHttpsUrl,
  buildUrl,
  urlExists,
  areAllElementsInVocabulary,
  checkBreadcrumb,
  cmsThemeRx,
  getAllPageHTML,
};
