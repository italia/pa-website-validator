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
  cmsThemeRx,
  getHREFValuesDataAttribute,
  getRandomNString,
  gotoRetry,
  isInternalUrl,
  loadPageData,
  requestTimeout,
} from "../utils";
import { feedbackComponentStructure } from "../../storage/municipality/feedbackComponentStructure";
import { errorHandling } from "../../config/commonAuditsParts";
import axios from "axios";
import { DataElementError } from "../DataElementError";
import crawlerTypes from "../../types/crawler-types";
import requestPages = crawlerTypes.requestPages;

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
      throw new DataElementError(value);
    }

    pagesUrls = [...pagesUrls, ...new Set(primaryLevelPageUrls)];
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

        let dataElementSecondary = "";

        if (key !== "live") {
          dataElementSecondary = primaryMenuItem.secondary_item_data_element[0];
          const dataElementSecondaryItem = `[data-element="${dataElementSecondary}"]`;
          secondPageUrls = await getHREFValuesDataAttribute(
            $2,
            dataElementSecondaryItem
          );
        } else {
          for (const secondaryItemDataElement of primaryMenuItem.secondary_item_data_element) {
            dataElementSecondary = secondaryItemDataElement;
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

        for (let i = 0; i < secondPageUrls.length; i++) {
          if (
            (await isInternalUrl(secondPageUrls[i])) &&
            !secondPageUrls[i].includes(primaryLevelPageUrl)
          ) {
            secondPageUrls[i] = await buildUrl(
              primaryLevelPageUrl,
              secondPageUrls[i]
            );
          }
        }

        if (secondPageUrls.length === 0 && key !== "custom") {
          throw new DataElementError(dataElementSecondary);
        }
        pagesUrls = [...pagesUrls, ...new Set(secondPageUrls)];
      }
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
    protocolTimeout: requestTimeout,
    args: ["--no-zygote", "--no-sandbox"],
  });
  const browserWSEndpoint = browser.wsEndpoint();
  try {
    const browser2 = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser2.newPage();
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (
        ["image", "imageset", "media"].indexOf(request.resourceType()) !== -1
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    const res = await gotoRetry(
      page,
      pageUrl,
      errorHandling.gotoRetryTentative
    );
    console.log(res?.url(), res?.status());

    let maxCountPages = (await page.$$(linkDataElement)).length;
    let clickButton = true;
    while (clickButton) {
      try {
        clickButton = await page.evaluate(async () => {
          const button = document.querySelector(
            '[data-element="load-other-cards"]'
          ) as HTMLElement;
          if (!button) {
            return false;
          }
          button.click();
          return true;
        });

        if (!clickButton) {
          continue;
        }

        await page.waitForNetworkIdle({
          idleTime: 1000,
        });

        const currentCountPages = (await page.$$(linkDataElement)).length;
        if (currentCountPages === maxCountPages) {
          clickButton = false;
          continue;
        }
        maxCountPages = currentCountPages;

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
    await browser.close();
  } catch (ex) {
    console.error(`ERROR ${pageUrl}: ${ex}`);
    await browser.close();
    throw new Error(
      `Il test è stato interrotto perché nella prima pagina analizzata ${url} si è verificato l'errore "${ex}". Verificarne la causa e rifare il test.`
    );
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
    protocolTimeout: requestTimeout,
    args: ["--no-zygote", "--no-sandbox"],
  });
  const browserWSEndpoint = browser.wsEndpoint();

  try {
    const browser2 = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser2.newPage();
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (
        ["image", "imageset", "media"].indexOf(request.resourceType()) !== -1
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });
    const res = await gotoRetry(page, url, errorHandling.gotoRetryTentative);
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

        const feedbackPositiveRect =
          feedbackRatingPositiveElement.getBoundingClientRect();
        const feedbackPositiveStyle = window.getComputedStyle(
          feedbackRatingPositiveElement
        );
        const feedbackPositiveVisible =
          feedbackRatingPositiveElement.offsetParent &&
          feedbackPositiveStyle.display !== "none" &&
          feedbackPositiveStyle.visibility !== "hidden" &&
          feedbackPositiveRect.bottom > 0 &&
          feedbackPositiveRect.top > 0 &&
          feedbackPositiveRect.height > 0 &&
          feedbackPositiveRect.width > 0;

        const feedbackNegativeRect =
          feedbackRatingNegativeElement.getBoundingClientRect();
        const feedbackNegativeStyle = window.getComputedStyle(
          feedbackRatingNegativeElement
        );
        const feedbackNegativeVisible =
          feedbackRatingNegativeElement.offsetParent &&
          feedbackNegativeStyle.display !== "none" &&
          feedbackNegativeStyle.visibility !== "hidden" &&
          feedbackNegativeRect.bottom > 0 &&
          feedbackNegativeRect.top > 0 &&
          feedbackNegativeRect.height > 0 &&
          feedbackNegativeRect.width > 0;

        if (
          i <= feedbackComponentStructure.rate.positiveThreshold &&
          (feedbackPositiveVisible || !feedbackNegativeVisible)
        ) {
          checkRateComponentAssociation = false;
        }

        if (i <= feedbackComponentStructure.rate.positiveThreshold) {
          if (!feedbackRatingNegativeElement) {
            if (score > 0.5) score = 0.5;
            errors.push(
              feedbackComponentStructure.negative_rating.missingError
            );
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
                  feedbackRatingNegativeAnswersElement.textContent?.trim() ??
                  "";
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
                  feedbackComponentStructure.negative_rating.answers
                    .missingError
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
        }

        if (
          i > feedbackComponentStructure.rate.positiveThreshold &&
          (!feedbackPositiveVisible || feedbackNegativeVisible)
        ) {
          checkRateComponentAssociation = false;
        }

        if (i > feedbackComponentStructure.rate.positiveThreshold) {
          if (!feedbackRatingPositiveElement) {
            if (score > 0.5) score = 0.5;
            errors.push(
              feedbackComponentStructure.positive_rating.missingError
            );
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
                  feedbackRatingPositiveAnswersElement.textContent?.trim() ??
                  "";
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
                  feedbackComponentStructure.positive_rating.answers
                    .missingError
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
  } catch (ex) {
    console.error(`ERROR ${url}: ${ex}`);
    await browser.close();
    throw new Error(
      `Il test è stato interrotto perché nella prima pagina analizzata ${url} si è verificato l'errore "${ex}". Verificarne la causa e rifare il test.`
    );
  }

  await browser.close();

  returnValues.errors = [...new Set(returnValues.errors)];

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

const isDrupal = async (url: string): Promise<boolean> => {
  const $: CheerioAPI = await loadPageData(url);
  const linkTags = $("link");

  let styleCSSUrl = "";
  for (const linkTag of linkTags) {
    if (!linkTag.attribs || !("href" in linkTag.attribs)) {
      continue;
    }

    if (linkTag.attribs.href.includes(".css")) {
      styleCSSUrl = linkTag.attribs.href;
      if ((await isInternalUrl(styleCSSUrl)) && !styleCSSUrl.includes(url)) {
        styleCSSUrl = await buildUrl(url, styleCSSUrl);
      }

      let CSScontent = "";
      try {
        const response = await axios.get(styleCSSUrl);
        CSScontent = response.data;
      } catch (e) {
        CSScontent = "";
      }

      const match = CSScontent.match(cmsThemeRx);

      if (match === null || !match.groups) {
        continue;
      }

      if (match?.groups?.name?.toLowerCase() === "drupal") {
        return true;
      }
    }
  }

  return false;
};

const getPages = async (
  url: string,
  requests: requestPages[]
): Promise<string[]> => {
  let pagesUrl: string[] = [];
  const missingDataElements: string[] = [];

  for (const request of requests) {
    try {
      switch (request.type) {
        case "first_level_pages": {
          const randomFirstLevelPagesUrl = await getRandomFirstLevelPagesUrl(
            url,
            request.numberOfPages
          );
          pagesUrl = [...pagesUrl, ...randomFirstLevelPagesUrl];
          break;
        }
        case "second_level_pages": {
          const randomSecondLevelPagesUrl = await getRandomSecondLevelPagesUrl(
            url,
            request.numberOfPages
          );
          pagesUrl = [...pagesUrl, ...randomSecondLevelPagesUrl];
          break;
        }
        case "services_page": {
          const servicesPage = await getPrimaryPageUrl(
            url,
            primaryMenuItems.services.data_element
          );
          if (servicesPage === "") {
            throw new DataElementError(primaryMenuItems.services.data_element);
          }
          pagesUrl.push(servicesPage);
          break;
        }
        case "services": {
          const allServicePage = await getPrimaryPageUrl(
            url,
            primaryMenuItems.services.data_element
          );
          if (allServicePage.length === 0) {
            throw new DataElementError(primaryMenuItems.services.data_element);
          }

          const randomServicesUrl = await getRandomThirdLevelPagesUrl(
            url,
            allServicePage,
            `[data-element="${primaryMenuItems.services.third_item_data_element}"]`,
            request.numberOfPages
          );
          if (randomServicesUrl.length === 0) {
            throw new DataElementError(
              primaryMenuItems.services.third_item_data_element
            );
          }
          pagesUrl = [...pagesUrl, ...randomServicesUrl];
          break;
        }
        case "events": {
          const randomEventsUrl = await getRandomThirdLevelPagesUrl(
            url,
            await getButtonUrl(
              await loadPageData(
                await getPrimaryPageUrl(url, primaryMenuItems.live.data_element)
              ),
              url,
              `[data-element="${primaryMenuItems.live.secondary_item_data_element[1]}"]`
            ),
            `[data-element="${primaryMenuItems.live.third_item_data_element}"]`,
            request.numberOfPages
          );

          if (randomEventsUrl.length > 0) {
            pagesUrl = [...pagesUrl, ...randomEventsUrl];
          }
          break;
        }
        case "booking_appointment": {
          const servicesPage = await getPrimaryPageUrl(
            url,
            primaryMenuItems.services.data_element
          );
          if (servicesPage === "") {
            throw new DataElementError(primaryMenuItems.services.data_element);
          }

          const bookingAppointmentPage = await getPrimaryPageUrl(
            servicesPage,
            "appointment-booking"
          );
          if (bookingAppointmentPage === "") {
            throw new DataElementError("appointment-booking");
          }
          pagesUrl.push(bookingAppointmentPage);
          break;
        }
        case "personal_area_login": {
          const personalAreaLoginPageUrl = await getPrimaryPageUrl(
            url,
            "personal-area-login"
          );
          if (personalAreaLoginPageUrl !== "") {
            pagesUrl.push(personalAreaLoginPageUrl);
          }
          break;
        }
        default: {
          throw new Error("Request type not found");
        }
      }
    } catch (ex) {
      if (!(ex instanceof DataElementError)) {
        throw ex;
      }

      missingDataElements.push(ex.message);
    }
  }

  if (missingDataElements.length > 0) {
    throw new DataElementError(missingDataElements.join(", "));
  }

  return pagesUrl;
};

export {
  getRandomFirstLevelPagesUrl,
  getRandomSecondLevelPagesUrl,
  getRandomThirdLevelPagesUrl,
  checkFeedbackComponent,
  getPrimaryPageUrl,
  getButtonUrl,
  isDrupal,
  getPages,
};
