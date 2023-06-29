"use strict";
import * as cheerio from "cheerio";
import { CheerioAPI } from "cheerio";
import puppeteer from "puppeteer";
import {
  customPrimaryMenuItemsDataElement,
  customSecondaryMenuItemsDataElement,
  primaryMenuItems,
} from "../../storage/municipality/menuItems";
import {
  buildUrl,
  getHREFValuesDataAttribute,
  getRandomNString,
  isInternalUrl,
  loadPageData,
  requestTimeout,
} from "../utils";
import { feedbackComponentStructure } from "../../storage/municipality/feedbackComponentStructure";

const getRandomFirstLevelPagesUrl = async (
  url: string,
  numberOfPages = 1
): Promise<string[]> => {
  const $ = await loadPageData(url);
  let pagesUrls: string[] = [];

  const menuDataElements = [];

  for (const [, value] of Object.entries(primaryMenuItems)) {
    menuDataElements.push(value.data_element);
  }

  menuDataElements.push(customPrimaryMenuItemsDataElement);

  for (const value of menuDataElements) {
    const dataElement = `[data-element="${value}"]`;

    const elements = $(dataElement);
    const primaryLevelPageUrls = [];
    if (Object.keys(elements).length > 0) {
      for (const element of elements) {
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
          primaryLevelPageUrls.push(primaryLevelPageUrl);
        }
      }

      if (
        primaryLevelPageUrls.length === 0 &&
        value !== customPrimaryMenuItemsDataElement
      ) {
        return [];
      }

      pagesUrls = [...pagesUrls, ...new Set(primaryLevelPageUrls)];
    }
  }

  return getRandomNString(pagesUrls, numberOfPages);
};

const getRandomSecondLevelPagesUrl = async (
  url: string,
  numberOfPages = 1
): Promise<string[]> => {
  const $ = await loadPageData(url);
  let pagesUrls: string[] = [];

  const customMenuElement = {
    custom: {
      data_element: customPrimaryMenuItemsDataElement,
      secondary_item_data_element: customSecondaryMenuItemsDataElement,
    },
  };

  const menuItems = Object.assign({}, primaryMenuItems, customMenuElement);

  for (const [key, primaryMenuItem] of Object.entries(menuItems)) {
    const dataElement = `[data-element="${primaryMenuItem.data_element}"]`;

    const elements = $(dataElement);
    if (Object.keys(elements).length > 0) {
      for (const element of elements) {
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
          if (secondPageUrls.length === 0 && key !== "custom") {
            return [];
          }
          pagesUrls = [...pagesUrls, ...new Set(secondPageUrls)];
        }
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
    headless: "new",
    args: ["--no-zygote", "--no-sandbox"],
  });
  const browserWSEndpoint = browser.wsEndpoint();
  try {
    const browser2 = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser2.newPage();
    page.on("request", (e) => {
      const res = e.response();
      if (res !== null && !res.ok())
        console.log(`Failed to load ${res.url()}: ${res.status()}`);
    });
    const res = await page.goto(pageUrl, {
      waitUntil: ["load", "networkidle0"],
      timeout: requestTimeout,
    });
    console.log(res?.url(), res?.status());

    let clickButton = true;
    while (clickButton) {
      try {
        const element = await page.$('[data-element="load-other-cards"]');
        if (!element) {
          clickButton = false;
          continue;
        }
        await element.click({
          delay: 500,
        });
        // eslint-disable-next-line no-empty
      } catch (e) {
        clickButton = false;
      }
    }
    const data = await page.content();
    $ = cheerio.load(data);

    await page.goto("about:blank");
    await page.close();
    browser2.disconnect();
  } catch (e) {
    console.error(`ERROR ${pageUrl}: ${e}`);
  }

  await browser.close();
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

  const pageElements = await getHREFValuesDataAttribute(
    $,
    `[data-element="${dataElement}"]`
  );
  if (pageElements.length <= 0) {
    return "";
  }

  let pageUrl = pageElements[0];
  if ((await isInternalUrl(pageUrl)) && !pageUrl.includes(url)) {
    pageUrl = await buildUrl(url, pageUrl);
  }

  return pageUrl;
};

const checkFeedbackComponent = async (url: string) => {
  const score = 1;
  const errors: string[] = [];

  let returnValues = {
    score: score,
    errors: errors,
  };
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-zygote", "--no-sandbox"],
  });
  const browserWSEndpoint = browser.wsEndpoint();

  try {
    const browser2 = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser2.newPage();
    page.on("request", (e) => {
      const res = e.response();
      if (res !== null && !res.ok())
        console.log(`Failed to load ${res.url()}: ${res.status()}`);
    });
    const res = await page.goto(url, {
      waitUntil: ["load", "networkidle0"],
      timeout: requestTimeout,
    });
    console.log(res?.url(), res?.status());

    returnValues = await page.evaluate(async (feedbackComponentStructure) => {
      let score = 1;
      const errors: string[] = [];

      const feedbackComponent = document.querySelector(
        `[data-element="${feedbackComponentStructure.component.dataElement}"]`
      );
      if (!feedbackComponent) {
        errors.push(feedbackComponentStructure.component.missingError);
        score = 0;
        return {
          score: score,
          errors: errors,
        };
      }

      const feedbackTitleElement = feedbackComponent.querySelector(
        `[data-element="${feedbackComponentStructure.title.dataElement}"]`
      );
      if (!feedbackTitleElement) {
        if (score > 0.5) score = 0.5;
        errors.push(feedbackComponentStructure.title.missingError);
      }

      if (
        feedbackTitleElement &&
        feedbackTitleElement.textContent &&
        feedbackTitleElement.textContent.trim().toLocaleLowerCase() !==
          feedbackComponentStructure.title.text.toLowerCase()
      ) {
        if (score > 0) score = 0;
        errors.push(feedbackComponentStructure.title.error);
      }
      let existsRateComponents = false; //true if there is at least one rating inputs
      let checkRateComponent = true; //false if there are not the right amount of rating inputs
      let existsRatingQAComponents = true; //false if there is not a rating component (positive or negative)
      let checkRateComponentAssociation = true; //false if the association between rating input and rating components is incorrect

      const feedbackRatingPositiveElement = document.querySelector(
        `[data-element="${feedbackComponentStructure.positive_rating.dataElement}"]`
      ) as HTMLElement;
      const feedbackRatingNegativeElement = document.querySelector(
        `[data-element="${feedbackComponentStructure.negative_rating.dataElement}"]`
      ) as HTMLElement;

      for (
        let i = 1;
        i <= feedbackComponentStructure.rate.numberOfComponents;
        i++
      ) {
        const feedbackRateElement = document.querySelector(
          `[data-element="${feedbackComponentStructure.rate.dataElement + i}"]`
        ) as HTMLElement;
        if (feedbackRateElement && !existsRateComponents) {
          existsRateComponents = true;
        }

        if (!feedbackRateElement) {
          checkRateComponent = false;
          continue;
        }

        if (!feedbackRatingPositiveElement || !feedbackRatingNegativeElement) {
          existsRatingQAComponents = false;
          checkRateComponentAssociation = false;
          continue;
        }

        feedbackRateElement.click();

        if (
          i <= feedbackComponentStructure.rate.positiveThreshold &&
          (feedbackRatingPositiveElement.offsetParent ||
            !feedbackRatingNegativeElement.offsetParent)
        ) {
          checkRateComponentAssociation = false;
        }

        if (
          i > feedbackComponentStructure.rate.positiveThreshold &&
          (!feedbackRatingPositiveElement.offsetParent ||
            feedbackRatingNegativeElement.offsetParent)
        ) {
          checkRateComponentAssociation = false;
        }
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

      if (!feedbackRatingPositiveElement) {
        if (score > 0.5) score = 0.5;
        errors.push(feedbackComponentStructure.positive_rating.missingError);
      } else {
        const feedbackRatingPositiveQuestionElement =
          feedbackRatingPositiveElement.querySelector(
            `[data-element="${feedbackComponentStructure.positive_rating.question.dataElement}"]`
          );

        if (!feedbackRatingPositiveQuestionElement) {
          if (score > 0.5) score = 0.5;
          errors.push(
            feedbackComponentStructure.positive_rating.question.missingError
          );
        }

        if (
          feedbackRatingPositiveQuestionElement &&
          feedbackRatingPositiveQuestionElement.textContent &&
          feedbackRatingPositiveQuestionElement.textContent
            .trim()
            .toLowerCase() !==
            feedbackComponentStructure.positive_rating.question.text.toLowerCase()
        ) {
          if (score > 0) score = 0;
          errors.push(
            feedbackComponentStructure.positive_rating.question.error
          );
        }

        const feedbackRatingPositiveAnswersElements =
          feedbackRatingPositiveElement.querySelectorAll(
            `[data-element="${feedbackComponentStructure.positive_rating.answers.dataElement}"]`
          );

        if (feedbackRatingPositiveAnswersElements) {
          const feedbackRatingPositiveAnswers: string[] = [];

          for (const feedbackRatingPositiveAnswersElement of feedbackRatingPositiveAnswersElements) {
            const feedbackAnswer =
              feedbackRatingPositiveAnswersElement.textContent?.trim() ?? "";
            feedbackRatingPositiveAnswers.push(feedbackAnswer);
          }

          const lowerCasedVocabulary =
            feedbackComponentStructure.positive_rating.answers.texts.map(
              (vocabularyElements) => vocabularyElements.toLowerCase()
            );

          let allCorrectAnswers = true;
          for (const feedbackRatingPositiveAnswer of feedbackRatingPositiveAnswers) {
            if (
              lowerCasedVocabulary.indexOf(
                feedbackRatingPositiveAnswer.toLowerCase()
              ) === -1
            ) {
              allCorrectAnswers = false;
            }
          }

          if (!feedbackRatingPositiveAnswersElements) {
            if (score > 0.5) score = 0.5;
            errors.push(
              feedbackComponentStructure.positive_rating.answers.missingError
            );
          }

          if (
            feedbackRatingPositiveAnswersElements.length > 0 &&
            !allCorrectAnswers
          ) {
            if (score > 0) score = 0;
            errors.push(
              feedbackComponentStructure.positive_rating.answers.error
            );
          }
        }
      }
      if (!feedbackRatingNegativeElement) {
        if (score > 0.5) score = 0.5;
        errors.push(feedbackComponentStructure.negative_rating.missingError);
      } else {
        const feedbackRatingNegativeQuestionElement =
          feedbackRatingNegativeElement.querySelector(
            `[data-element="${feedbackComponentStructure.negative_rating.question.dataElement}"]`
          );

        if (!feedbackRatingNegativeQuestionElement) {
          if (score > 0.5) score = 0.5;
          errors.push(
            feedbackComponentStructure.negative_rating.question.missingError
          );
        }

        if (
          feedbackRatingNegativeQuestionElement &&
          feedbackRatingNegativeQuestionElement.textContent &&
          feedbackRatingNegativeQuestionElement.textContent
            .trim()
            .toLowerCase() !==
            feedbackComponentStructure.negative_rating.question.text.toLowerCase()
        ) {
          if (score > 0) score = 0;
          errors.push(
            feedbackComponentStructure.negative_rating.question.error
          );
        }

        const feedbackRatingNegativeAnswersElements =
          feedbackRatingNegativeElement.querySelectorAll(
            `[data-element="${feedbackComponentStructure.negative_rating.answers.dataElement}"]`
          );

        if (feedbackRatingNegativeAnswersElements) {
          const feedbackRatingNegativeAnswers: string[] = [];

          for (const feedbackRatingNegativeAnswersElement of feedbackRatingNegativeAnswersElements) {
            const feedbackAnswer =
              feedbackRatingNegativeAnswersElement.textContent?.trim() ?? "";
            feedbackRatingNegativeAnswers.push(feedbackAnswer);
          }

          const lowerCasedVocabulary =
            feedbackComponentStructure.negative_rating.answers.texts.map(
              (vocabularyElements) => vocabularyElements.toLowerCase()
            );

          let allCorrectAnswers = true;
          for (const feedbackRatingNegativeAnswer of feedbackRatingNegativeAnswers) {
            if (
              lowerCasedVocabulary.indexOf(
                feedbackRatingNegativeAnswer.toLowerCase()
              ) === -1
            ) {
              allCorrectAnswers = false;
            }
          }

          if (!feedbackRatingNegativeAnswersElements) {
            if (score > 0.5) score = 0.5;
            errors.push(
              feedbackComponentStructure.negative_rating.answers.missingError
            );
          }

          if (
            feedbackRatingNegativeAnswersElements.length > 0 &&
            !allCorrectAnswers
          ) {
            if (score > 0) score = 0;
            errors.push(
              feedbackComponentStructure.negative_rating.answers.error
            );
          }
        }
      }

      const feedbackInputText = feedbackComponent.querySelector(
        `[data-element="${feedbackComponentStructure.input_text.dataElement}"]`
      );
      if (!feedbackInputText) {
        if (score > 0.5) score = 0.5;
        errors.push(feedbackComponentStructure.input_text.missingError);
      }

      return {
        score: score,
        errors: errors,
      };
    }, feedbackComponentStructure);

    await page.goto("about:blank");
    await page.close();
    browser2.disconnect();
  } catch (e) {
    console.error(`ERROR ${url}: ${e}`);
  }

  await browser.close();

  return returnValues;
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
  } else if (button !== null && button !== undefined && "href" in button) {
    // tag 'A'
    let secondPageLink = button.href;
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
