"use strict";
import crawlerTypes from "../types/crawler-types";
import orderType = crawlerTypes.orderResult;
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import { CheerioAPI } from "cheerio";
import https from "https";
import http from "http";
import dns from "dns";
import vocabularyResult = crawlerTypes.vocabularyResult;
import NodeCache from "node-cache";

const loadPageCache = new NodeCache();

const loadPageData = async (url: string): Promise<CheerioAPI> => {
  let data = "";
  const data_from_cache = loadPageCache.get(url);
  if ( data_from_cache !== undefined ){
    // console.log(`HIT ${url}`);
    return <CheerioAPI>data_from_cache;
  }
  // console.log(`MISS ${url}`);
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(url);
    data = await page.content();
    await browser.close();
    loadPageCache.set(url, cheerio.load(data))
    return cheerio.load(data);
  } catch (ex) {
    await browser.close();
    loadPageCache.set(url, cheerio.load(data))
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

const getRandomSchoolServiceUrl = async (url: string): Promise<string> => {
  let $ = await loadPageData(url);

  const serviceUrls = await getHREFValuesDataAttribute(
    $,
    '[data-element="service-type"]'
  );
  if (serviceUrls.length <= 0) {
    return "";
  }

  let serviceUrl = serviceUrls[Math.floor(Math.random() * serviceUrls.length)];
  if (!serviceUrl.includes(url)) {
    serviceUrl = await buildUrl(url, serviceUrl);
  }

  $ = await loadPageData(serviceUrl);
  const cardUrls = await getHREFValuesDataAttribute(
    $,
    '[data-element="service-link"]'
  );
  if (cardUrls.length <= 0) {
    return "";
  }

  let serviceToInspect = cardUrls[Math.floor(Math.random() * cardUrls.length)];
  if (!serviceToInspect.includes(url)) {
    serviceToInspect = await buildUrl(url, serviceToInspect);
  }

  return serviceToInspect;
};

const buildUrl = async (url: string, service: string): Promise<string> => {
  return new URL(service, url).href;
};

const isInternalUrl = async (url: string) => {
  return (
    !url.includes("www") && !url.includes("http") && !url.includes("https")
  );
};

const isHttpsUrl = async (url: string) => {
  return url.includes("https");
};

const checkOrder = async (
  mandatoryElements: string[],
  foundElements: string[]
): Promise<orderType> => {
  const newMandatoryElements = [];
  const newFoundElements = [];
  let numberOfElementsNotInSequence = 0;
  const elementsNotInSequence = [];

  for (const mandatoryElement of mandatoryElements) {
    if (foundElements.includes(mandatoryElement)) {
      newMandatoryElements.push(mandatoryElement);
    }
  }

  for (const foundElement of foundElements) {
    if (newMandatoryElements.includes(foundElement)) {
      newFoundElements.push(foundElement);
    }
  }

  for (let i = 0; i < newFoundElements.length; i++) {
    const indexInMandatory = newMandatoryElements.indexOf(newFoundElements[i]);
    let isInSequence = true;

    if (indexInMandatory !== newMandatoryElements.length - 1) {
      if (i === newFoundElements.length - 1) {
        isInSequence = false;
      } else if (
        newFoundElements[i + 1] !== newMandatoryElements[indexInMandatory + 1]
      ) {
        isInSequence = false;
      }
    }

    if (indexInMandatory !== 0) {
      if (i === 0) {
        isInSequence = false;
      } else if (
        newFoundElements[i - 1] !== newMandatoryElements[indexInMandatory - 1]
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

async function getHttpsRequestStatusCode(
  hostname: string
): Promise<number | undefined> {
  return new Promise(function (resolve) {
    https
      .request(hostname, function (res) {
        resolve(res.statusCode);
      })
      .end();
  });
}

async function getHttpRequestStatusCode(
  hostname: string
): Promise<number | undefined> {
  return new Promise(function (resolve) {
    http
      .request(hostname, function (res) {
        resolve(res.statusCode);
      })
      .end();
  });
}

async function hostnameExists(
  url: string
): Promise<{ hostname: string; exists: boolean }> {
  const newURL = new URL(url);

  try {
    if (!("hostname" in newURL)) {
      throw new Error("Hostname does not exists");
    }

    let hostname = newURL.hostname;
    hostname = hostname.replace(/(^\w+:|^)\/\//, "");
    hostname = hostname.replace("www.", "");
    hostname = hostname.replace("/", "");

    return new Promise((resolve) => {
      dns.lookup(hostname, (error) => resolve({ hostname, exists: !error }));
    });
  } catch (e) {
    return {
      hostname: "",
      exists: false,
    };
  }
}

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

    const hostExists = await hostnameExists(inspectUrl);
    if (!hostExists.exists) {
      return {
        result: false,
        reason: " Hostname non trovato.",
        inspectedUrl: inspectUrl,
      };
    }

    let statusCode = undefined;
    try {
      statusCode = await getHttpsRequestStatusCode(inspectUrl);
    } catch (e) {
      try {
        statusCode = await getHttpRequestStatusCode(inspectUrl);
      } catch (e) {
        return {
          result: false,
          reason: " Internal exception.",
          inspectedUrl: inspectUrl,
        };
      }
    }

    if (statusCode !== 200) {
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

const getRandomMunicipalityServiceUrl = async (url: string) => {
  let $ = await loadPageData(url);

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

  $ = await loadPageData(allServicesUrl);

  const serviceUrls = await getHREFValuesDataAttribute(
    $,
    '[data-element="service-link"]'
  );
  if (serviceUrls.length <= 0) {
    return "";
  }

  let randomUrl = serviceUrls[Math.floor(Math.random() * serviceUrls.length)];
  if (!randomUrl.includes(url)) {
    randomUrl = await buildUrl(url, randomUrl);
  }

  return randomUrl;
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

export {
  checkOrder,
  loadPageData,
  getRandomSchoolServiceUrl,
  getRandomMunicipalityServiceUrl,
  getPageElementDataAttribute,
  getHREFValuesDataAttribute,
  getElementHrefValuesDataAttribute,
  getHttpsRequestStatusCode,
  hostnameExists,
  isInternalUrl,
  isHttpsUrl,
  buildUrl,
  urlExists,
  areAllElementsInVocabulary,
};
