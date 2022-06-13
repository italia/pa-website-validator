"use strict";
import crawlerTypes from "../types/crawler-types";
import orderType = crawlerTypes.orderResult;
import got from "got";
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

const getElementHrefValues = async ($: CheerioAPI, elementId: string) => {
  let elements = $("#" + elementId)

  if (Object.keys(elements).length === 0) {
    return null
  }

  const innerElements = $(elements).find('a')

  if (Object.keys(innerElements).length === 0) {
    return null
  }

  let urls = []
  for (const innerElement of innerElements) {
    const label = $(innerElement).text().trim() ?? ''
    const url = $(innerElement).attr().href ?? null
    if (url) {
      urls.push({
        label: label,
        url: url
      })
    }
  }

  return urls
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

const getAllServicesPagesToBeScanned = async (allServicesUrl: string) : Promise<string[]> => {
  const pageScanned = [allServicesUrl];

  let noMorePageToScan = false;
  let pageToBeScan = allServicesUrl;

  while (!noMorePageToScan) {
    const tempResponse = await got(pageToBeScan);
    const $ = cheerio.load(tempResponse.body);
    const cheerioElements = $("body").find("a");
    if (cheerioElements.length <= 0) {
      noMorePageToScan = true;
    }

    for (const cheerioElement of cheerioElements) {
      const url = $(cheerioElement).attr("href");
      if (
        url !== undefined &&
        url.includes("/page/") &&
        !pageScanned.includes(url)
      ) {
        pageScanned.push(url);

        pageToBeScan = url;
      } else {
        noMorePageToScan = true;
      }
    }
  }

  return pageScanned;
}

const getAllServicesUrl = async (pagesToBeScanned: string[], allServicesUrl: string) : Promise<string[]> => {
  const servicesUrl = [];
  for (const pageToScan of pagesToBeScanned) {
    const pageResponse = await got(pageToScan);
    const $ = cheerio.load(pageResponse.body);
    const cheerioElements = $("body").find("a");
    if (cheerioElements.length <= 0) {
      continue;
    }

    for (const cheerioElement of cheerioElements) {
      const url = $(cheerioElement).attr("href");
      if (
        url !== undefined &&
        url.includes("/servizio/") &&
        url !== allServicesUrl &&
        !url.includes("/page/")
      ) {
        servicesUrl.push(url);
      }
    }
  }

  return servicesUrl;
}

const getRandomServicesToBeScanned = async (servicesUrls: string[]) : Promise<string> => {
  const randomIndex = Math.floor(Math.random() * (servicesUrls.length - 1 + 1) + 1)
  return servicesUrls[randomIndex]
}

export { checkOrder, getAllServicesPagesToBeScanned, getAllServicesUrl, getRandomServicesToBeScanned, loadPageData, getPageElement, getElementHrefValues }
