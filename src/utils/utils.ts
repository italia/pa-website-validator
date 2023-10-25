"use strict";
import crawlerTypes from "../types/crawler-types";
import orderType = crawlerTypes.orderResult;
import * as cheerio from "cheerio";
import puppeteer, { HTTPResponse, Page } from "puppeteer";
import { CheerioAPI } from "cheerio";
import axios from "axios";
import vocabularyResult = crawlerTypes.vocabularyResult;
import { LRUCache } from "lru-cache";
import { MenuItem } from "../types/menuItem";
import { errorHandling } from "../config/commonAuditsParts";

const cache = new LRUCache<string, CheerioAPI>({ max: 128 });
const redirectUrlCache = new LRUCache<string, string>({ max: 128 });
const requestTimeout = parseInt(process.env["requestTimeout"] ?? "30000");

const loadPageData = async (url: string): Promise<CheerioAPI> => {
  const data_from_cache = cache.get(url);
  if (data_from_cache !== undefined) {
    return data_from_cache;
  }
  let data = "";
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

    const redirectedUrl = await page.evaluate(async () => {
      return window.location.href;
    });

    if (redirectUrlCache.get(url) === undefined) {
      redirectUrlCache.set(url, redirectedUrl);
    }

    console.log(res?.url(), res?.status());

    data = await page.content();

    await page.goto("about:blank");
    await page.close();
    browser2.disconnect();

    await browser.close();
    const c = cheerio.load(data);
    cache.set(url, c);
    cache.set(redirectedUrl, c);
    return c;
  } catch (ex) {
    console.error(`ERROR ${url}: ${ex}`);
    await browser.close();
    throw new Error(
      `Il test è stato interrotto perché nella prima pagina analizzata ${url} si è verificato l'errore "${ex}". Verificarne la causa e rifare il test.`
    );
  }
};

const gotoRetry = async (
  page: Page,
  url: string,
  retryCount: number
): Promise<HTTPResponse | null> => {
  try {
    return await page.goto(url, {
      waitUntil: ["load", "networkidle0"],
      timeout: requestTimeout,
    });
  } catch (error) {
    if (retryCount <= 0) {
      throw error;
    }
    console.log(
      `${url} goto tentative: ${errorHandling.gotoRetryTentative - retryCount}`
    );
    return await gotoRetry(page, url, retryCount - 1);
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

const buildUrl = async (url: string, path: string): Promise<string> => {
  return new URL(path, url).href;
};

const isInternalUrl = async (url: string) => {
  return (
    !url.includes("www") && !url.includes("http") && !url.includes("https")
  );
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
      if (!inspectUrl.includes("https")) {
        return {
          result: false,
          reason: " Protocollo HTTPS mancante nell'URL.",
          inspectedUrl: inspectUrl,
        };
      }
    }

    let statusCode = undefined;
    try {
      const response = await axios.get(inspectUrl, {
        headers: { Accept: "text/html,application/xhtml+xml" },
      });
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

const getRedirectedUrl = async (url: string): Promise<string> => {
  const url_from_cache = redirectUrlCache.get(url);
  if (url_from_cache !== undefined) {
    return url_from_cache;
  }

  let redirectedUrl = "";
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

    await gotoRetry(page, url, errorHandling.gotoRetryTentative);

    redirectedUrl = await page.evaluate(async () => {
      return window.location.href;
    });

    redirectUrlCache.set(url, redirectedUrl);

    const data = await page.content();
    const c = cheerio.load(data);
    if (cache.get(url) === undefined) {
      cache.set(url, c);
    }

    if (cache.get(redirectedUrl) === undefined) {
      cache.set(redirectedUrl, c);
    }

    await page.goto("about:blank");
    await page.close();

    browser2.disconnect();
    await browser.close();
  } catch (ex) {
    console.error(`ERROR ${url}: ${ex}`);
    await browser.close();
    throw new Error(
      `Il test è stato interrotto perché nella prima pagina analizzata ${url} si è verificato l'errore "${ex}". Verificarne la causa e rifare il test.`
    );
  }

  return redirectedUrl;
};

export {
  toMenuItem,
  checkOrder,
  missingMenuItems,
  loadPageData,
  gotoRetry,
  getRandomNString,
  getPageElementDataAttribute,
  getHREFValuesDataAttribute,
  getElementHrefValuesDataAttribute,
  isInternalUrl,
  buildUrl,
  urlExists,
  areAllElementsInVocabulary,
  checkBreadcrumb,
  cmsThemeRx,
  getAllPageHTML,
  requestTimeout,
  getRedirectedUrl,
};
