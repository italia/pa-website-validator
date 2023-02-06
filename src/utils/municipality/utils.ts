"use strict";
import * as cheerio from "cheerio";
import puppeteer, { Page } from "puppeteer";
import { primaryMenuItems } from "../../storage/municipality/menuItems";
import {
  buildUrl,
  getHREFValuesDataAttribute,
  getRandomNString,
  loadPageData,
} from "../utils";

const getRandomFirstLevelPagesUrl = async (
  url: string,
  numberOfPages = 1
): Promise<string[]> => {
  const $ = await loadPageData(url);
  const pagesUrls: string[] = [];

  for (const [, primaryMenuItem] of Object.entries(primaryMenuItems)) {
    const dataElement = `[data-element="${primaryMenuItem.data_element}"]`;

    const element = $(dataElement);
    if (element) {
      let primaryLevelPageUrl = $(element).attr()?.href;
      if (
        primaryLevelPageUrl &&
        primaryLevelPageUrl !== "#" &&
        primaryLevelPageUrl !== ""
      ) {
        if (!primaryLevelPageUrl.includes(url)) {
          primaryLevelPageUrl = await buildUrl(url, primaryLevelPageUrl);
        }
        pagesUrls.push(primaryLevelPageUrl);
      }
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

  for (const [, primaryMenuItem] of Object.entries(primaryMenuItems)) {
    const dataElement = `[data-element="${primaryMenuItem.data_element}"]`;

    const element = $(dataElement);
    if (element) {
      let primaryLevelPageUrl = $(element).attr()?.href;
      if (
        primaryLevelPageUrl &&
        primaryLevelPageUrl !== "#" &&
        primaryLevelPageUrl !== ""
      ) {
        if (!primaryLevelPageUrl.includes(url)) {
          primaryLevelPageUrl = await buildUrl(url, primaryLevelPageUrl);
        }
        const $2 = await loadPageData(primaryLevelPageUrl);
        const dataElementSecondaryItem = `[data-element="${primaryMenuItem.secondary_item_data_element[0]}"]`;
        pagesUrls = [
          ...pagesUrls,
          ...new Set(
            await getHREFValuesDataAttribute($2, dataElementSecondaryItem)
          ),
        ];
      }
    }
  }

  for (let i = 0; i < pagesUrls.length; i++) {
    if (!pagesUrls[i].includes(url)) {
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
      } catch (e) {
        continue;
      }
    }
    const data = await page.content();
    $ = cheerio.load(data);
    await browser.close();
  } catch (e) {
    await browser.close();
  }

  const pagesUrls = await getHREFValuesDataAttribute($, linkDataElement);

  for (let i = 0; i < pagesUrls.length; i++) {
    if (!pagesUrls[i].includes(url)) {
      pagesUrls[i] = await buildUrl(url, pagesUrls[i]);
    }
  }

  return getRandomNString(pagesUrls, numberOfPages);
};

const getServicePageUrl = async (url: string) => {
  const $ = await loadPageData(url);

  const servicesPageHref = await getHREFValuesDataAttribute(
    $,
    '[data-element="all-services"]'
  );
  if (servicesPageHref.length <= 0) {
    return "";
  }

  let allServicesUrl = servicesPageHref[0];
  if (!allServicesUrl.includes(url)) {
    allServicesUrl = await buildUrl(url, allServicesUrl);
  }

  return allServicesUrl;
};

export {
  getRandomFirstLevelPagesUrl,
  getRandomSecondLevelPagesUrl,
  getRandomThirdLevelPagesUrl,
  getServicePageUrl,
};
