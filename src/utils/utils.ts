"use strict";
import crawlerTypes from "../types/crawler-types";
import orderType = crawlerTypes.orderResult;
import * as cheerio from "cheerio";
import puppeteer, { Page } from "puppeteer";
import { CheerioAPI } from "cheerio";
import axios from "axios";
import vocabularyResult = crawlerTypes.vocabularyResult;
import NodeCache from "node-cache";
import { MenuItem } from "../types/menuItem";
import { menuItems } from "../storage/school/menuItems";
import { primaryMenuItems } from "../storage/municipality/menuItems";

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

const getRandomSchoolServicesUrl = async (
  url: string,
  numberOfServices = 1
): Promise<string[]> => {
  let $ = await loadPageData(url);

  let serviceTypeUrls = await getHREFValuesDataAttribute(
    $,
    '[data-element="service-type"]'
  );
  if (serviceTypeUrls.length <= 0) {
    return [];
  }

  serviceTypeUrls = [...new Set(serviceTypeUrls)];

  let servicesUrls: string[] = [];
  for (let serviceTypeUrl of serviceTypeUrls) {
    if (!serviceTypeUrl.includes(url)) {
      serviceTypeUrl = await buildUrl(url, serviceTypeUrl);
    }

    $ = await loadPageData(serviceTypeUrl);
    servicesUrls = [
      ...servicesUrls,
      ...(await getHREFValuesDataAttribute($, '[data-element="service-link"]')),
    ];

    const pagerPagesUrls = [
      ...new Set(
        await getHREFValuesDataAttribute($, '[data-element="pager-link"]')
      ),
    ];
    for (let pagerPageUrl of pagerPagesUrls) {
      if (!pagerPageUrl.includes(url)) {
        pagerPageUrl = await buildUrl(url, pagerPageUrl);
      }

      if (pagerPageUrl !== serviceTypeUrl) {
        $ = await loadPageData(pagerPageUrl);
        servicesUrls = [
          ...servicesUrls,
          ...(await getHREFValuesDataAttribute(
            $,
            '[data-element="service-link"]'
          )),
        ];
      }
    }
  }

  return getRandomNString(servicesUrls, numberOfServices);
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

const getRandomSchoolFirstLevelPagesUrl = async (
  url: string,
  numberOfPages = 1
): Promise<string[]> => {
  const $ = await loadPageData(url);

  const pagesUrls = [
    ...new Set(
      await getHREFValuesDataAttribute($, '[data-element="overview"]')
    ),
  ];

  for (let i = 0; i < pagesUrls.length; i++) {
    if (!pagesUrls[i].includes(url)) {
      pagesUrls[i] = await buildUrl(url, pagesUrls[i]);
    }
  }

  return getRandomNString(pagesUrls, numberOfPages);
};

const getRandomSchoolSecondLevelPagesUrl = async (
  url: string,
  numberOfPages = 1
): Promise<string[]> => {
  const pagesUrls = [];
  const $ = await loadPageData(url);

  for (const [, value] of Object.entries(menuItems)) {
    const dataElement = `[data-element="${value.data_element}"]`;

    let elements = $(dataElement);
    if (Object.keys(elements).length > 0) {
      elements = elements.find("li > a");
      for (const element of elements) {
        let secondLevelPageUrl = $(element).attr()?.href;
        if (
          secondLevelPageUrl &&
          secondLevelPageUrl !== "#" &&
          secondLevelPageUrl !== ""
        ) {
          if (!secondLevelPageUrl.includes(url)) {
            secondLevelPageUrl = await buildUrl(url, secondLevelPageUrl);
          }
          pagesUrls.push(secondLevelPageUrl);
        }
      }
    }
  }
  return getRandomNString(pagesUrls, numberOfPages);
};

const getRandomSchoolLocationsUrl = async (
  url: string,
  numberOfPages = 1
): Promise<string[]> => {
  let $ = await loadPageData(url);

  const dataElement = '[data-element="school-locations"]';

  let locationsElementsUrls = await getHREFValuesDataAttribute($, dataElement);
  locationsElementsUrls = [...new Set(locationsElementsUrls)];
  if (locationsElementsUrls.length !== 1) {
    return [];
  }

  let locationUrl = locationsElementsUrls[0];

  if (!locationUrl.includes(url)) {
    locationUrl = await buildUrl(url, locationUrl);
  }

  $ = await loadPageData(locationUrl);

  const pagesUrls = await getHREFValuesDataAttribute(
    $,
    '[data-element="location-link"]'
  );

  for (let i = 0; i < pagesUrls.length; i++) {
    const pageUrl = pagesUrls[i];
    if (!pageUrl.includes(url)) {
      pagesUrls[i] = await buildUrl(url, pageUrl);
    }
  }

  return getRandomNString(pagesUrls, numberOfPages);
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

  for (let i = 0; i < newFoundElements.length; i++) {
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

const getRandomMunicipalityServicesUrl = async (
  url: string,
  numberOfServices = 1
) => {
  let $ = await loadPageData(url);

  const servicesPageHref = await getHREFValuesDataAttribute(
    $,
    '[data-element="all-services"]'
  );
  if (servicesPageHref.length <= 0) {
    return [];
  }

  let allServicesUrl = servicesPageHref[0];
  if (!allServicesUrl.includes(url)) {
    allServicesUrl = await buildUrl(url, allServicesUrl);
  }

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
  });
  try {
    const page: Page = await browser.newPage();
    await page.goto(allServicesUrl, {
      waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
    });

    let clickButton = true;
    while (clickButton) {
      try {
        const element = await page.$('[data-element="load-other-services"]');
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

  const servicesUrls = await getHREFValuesDataAttribute(
    $,
    '[data-element="service-link"]'
  );

  return getRandomNString(servicesUrls, numberOfServices);
};

const getRandomMunicipalityFirstLevelPagesUrl = async (
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

const getRandomMunicipalitySecondLevelPagesUrl = async (
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
        const dataElementSecondaryItem = `[data-element="${primaryMenuItem.secondary_item_data_element}"]`;
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

const cmsThemeRx =
  /\/\*!\s*Theme Name:.*\s+Author:.*\s+Description:\s+Design (Comuni|Scuole) Italia .*(?<name>WordPress|Drupal).*\s+Version:\s+(?<version>.*)\s+License:.*\s+Text Domain: design_(comuni|scuole)_italia\s*\*\//;

export {
  toMenuItem,
  checkOrder,
  missingMenuItems,
  loadPageData,
  checkCSSClassesOnPage,
  getRandomSchoolServicesUrl,
  getRandomSchoolFirstLevelPagesUrl,
  getRandomSchoolSecondLevelPagesUrl,
  getRandomSchoolLocationsUrl,
  getRandomMunicipalityFirstLevelPagesUrl,
  getRandomMunicipalitySecondLevelPagesUrl,
  getRandomMunicipalityServicesUrl,
  getPageElementDataAttribute,
  getHREFValuesDataAttribute,
  getElementHrefValuesDataAttribute,
  isInternalUrl,
  isHttpsUrl,
  buildUrl,
  urlExists,
  areAllElementsInVocabulary,
  cmsThemeRx,
};
