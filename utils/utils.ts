"use strict";
import crawlerTypes from "../types/crawler-types";
import orderType = crawlerTypes.orderResult;
import * as cheerio from "cheerio";
import puppeteer from "puppeteer"
import {CheerioAPI} from "cheerio";

const loadPageData = async (url: string) : Promise<CheerioAPI> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const data = await page.content();
  await browser.close();

  return cheerio.load(data);
}

const getPageElement = async ($: CheerioAPI, elementId: string, tag: string = '') : Promise<string[]> => {
  const returnValues: string[] = [];

  let elements = $("#" + elementId);

  if (tag !== '') {
    if (Object.keys(elements).length === 0) {
      return returnValues
    }

    elements = $(elements).find(tag);
  }

  if (Object.keys(elements).length === 0) {
    return returnValues
  }

  for (const element of elements) {
    const stringElement = $(element).text().trim() ?? null
    if(stringElement) {
      returnValues.push(stringElement)
    }
  }

  return [...new Set(returnValues)];
}

const getElementHrefValues = async ($: CheerioAPI, elementId: string, tag: string = '') : Promise<Array<{label: string, url: string}> | []> => {
  let elements = $("#" + elementId)

  if (Object.keys(elements).length === 0) {
    return []
  }

  const innerElements = $(elements).find(tag)

  if (Object.keys(innerElements).length === 0) {
    return []
  }

  let urls = []
  for (const innerElement of innerElements) {
    const label = $(innerElement).text().trim() ?? ''
    const url = $(innerElement).attr().href ?? null
    if (url && url !== '#' && url !== '') {
      urls.push({
        label: label,
        url: url
      })
    }
  }

  return urls
}

const getPageElementDataAttribute = async ($: CheerioAPI, elementDataAttribute: string, tag: string = '') : Promise<string[]> => {
  const returnValues: string[] = [];

  let elements = $(elementDataAttribute);

  if (tag !== '') {
    if (Object.keys(elements).length === 0) {
      return returnValues
    }

    elements = $(elements).find(tag);
  }

  if (Object.keys(elements).length === 0) {
    return returnValues
  }

  for (const element of elements) {
    const stringElement = $(element).text().trim() ?? null
    if(stringElement) {
      returnValues.push(stringElement)
    }
  }

  return [...new Set(returnValues)];
}

const getElementHrefValuesDataAttribute = async ($: CheerioAPI, elementDataAttribute: string, tag: string = '') : Promise<Array<{label: string, url: string}> | []> => {
  let elements = $(elementDataAttribute)

  if (Object.keys(elements).length === 0) {
    return []
  }

  const innerElements = $(elements).find(tag)

  if (Object.keys(innerElements).length === 0) {
    return []
  }

  let urls = []
  for (const innerElement of innerElements) {
    const label = $(innerElement).text().trim() ?? ''
    const url = $(innerElement).attr().href ?? null
    if (url && url !== '#' && url !== '') {
      urls.push({
        label: label,
        url: url
      })
    }
  }

  return urls
}

const getRandomServiceUrl = async (url: string): Promise<string> => {
  let $ = await loadPageData(url)

  const allowedIds = ['#servizio-personale-scolastico', '#servizi-famiglie-studenti']
  let elements = $(allowedIds[Math.floor(Math.random() * allowedIds.length)])
  console.log('ELEMENTS RANDOM', elements)
  const elementObj = $(elements).attr()
  console.log('ELEMENT OBJ', elementObj)

  if (!Boolean(elementObj) || !("href" in elementObj) || elementObj.href === '#' || elementObj.href === '') {
     return ""
  }

  let serviceUrl = elementObj.href
  if (!serviceUrl.includes(url)) {
    serviceUrl = await buildUrl(url, serviceUrl)
  }

  $ = await loadPageData(serviceUrl)
  const pageServiceUrls = await getElementHrefValues($, 'lista-card-tipologia', 'a')

  let servicesList = []
  for (const pageServiceUrl of pageServiceUrls) {
    if (Boolean(pageServiceUrl.url)) {
      servicesList.push(pageServiceUrl.url)
    }
  }

  if (servicesList.length <= 0) {
    return ""
  }

  let serviceToInspect = servicesList[Math.floor(Math.random() * servicesList.length)]

  if (!serviceToInspect.includes(url)) {
    serviceToInspect = await buildUrl(url, serviceToInspect)
  }

  return serviceToInspect
}

const buildUrl = async (url: string, service: string) : Promise<string> => {
  const urlParts = url.split('//')

  if (urlParts.length <= 0) {
    return ""
  }

  const hostname = urlParts[1].split('/')

  if (hostname.length <= 0) {
    return ""
  }

  return  urlParts[0] + '//' + hostname[0] + service
}

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

  for (let i = 1; i < newFoundElements.length; i++) {
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

export { checkOrder, loadPageData, getPageElement, getElementHrefValues, getRandomServiceUrl, getPageElementDataAttribute }
