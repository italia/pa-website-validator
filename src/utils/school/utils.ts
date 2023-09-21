"use strict";
import {
  customPrimaryMenuItemsDataElement,
  menuItems,
  primaryMenuDataElement,
  primaryMenuItems,
} from "../../storage/school/menuItems";
import {
  buildUrl,
  getHREFValuesDataAttribute,
  getRandomNString,
  isInternalRedirectUrl,
  isInternalUrl,
  loadPageData,
} from "../utils";
import { DataElementError } from "../DataElementError";
import crawlerTypes from "../../types/crawler-types";
import requestPages = crawlerTypes.requestPages;
import pageLink = crawlerTypes.pageLink;

const getRandomFirstLevelPagesUrl = async (
  url: string,
  numberOfPages = 1
): Promise<string[]> => {
  const $ = await loadPageData(url);

  const pagesUrls = [
    ...new Set(
      await getHREFValuesDataAttribute(
        $,
        `[data-element="${primaryMenuDataElement}"]`
      )
    ),
  ];

  if (pagesUrls.length < primaryMenuItems.it.length) {
    throw new DataElementError(primaryMenuDataElement);
  }

  for (let i = 0; i < pagesUrls.length; i++) {
    if ((await isInternalUrl(pagesUrls[i])) && !pagesUrls[i].includes(url)) {
      pagesUrls[i] = await buildUrl(url, pagesUrls[i]);
    }
  }

  return getRandomNString(pagesUrls, numberOfPages);
};

const getFirstLevelPages = async (url: string): Promise<pageLink[]> => {
  const pages: pageLink[] = [];
  const $ = await loadPageData(url);

  for (const [, menuStructure] of Object.entries(menuItems)) {
    const menu = $(`[data-element="${menuStructure.data_element}"]`);
    const overviewLink = menu
      .find(`[data-element="${primaryMenuDataElement}"]`)
      .attr();
    if (
      overviewLink &&
      "href" in overviewLink &&
      overviewLink.href !== "#" &&
      overviewLink.href !== ""
    ) {
      let firstLevelPageUrl = overviewLink.href;
      if (
        (await isInternalUrl(firstLevelPageUrl)) &&
        !firstLevelPageUrl.includes(url)
      ) {
        firstLevelPageUrl = await buildUrl(url, firstLevelPageUrl);
      }

      pages.push({
        linkName: menuStructure.label.it,
        linkUrl: firstLevelPageUrl,
      });
    }
  }

  return pages;
};

const getRandomSecondLevelPagesUrl = async (
  url: string,
  numberOfPages = 1
): Promise<string[]> => {
  let pagesUrls: string[] = [];
  const $ = await loadPageData(url);

  const menuDataElements = [];
  for (const [, value] of Object.entries(menuItems)) {
    menuDataElements.push(value.data_element);
  }

  menuDataElements.push(customPrimaryMenuItemsDataElement);

  const host = new URL(url).hostname.replace("www.", "");

  for (const value of menuDataElements) {
    const dataElement = `[data-element="${value}"]`;

    let elements = $(dataElement);
    const secondLevelPagesUrls = [];
    if (Object.keys(elements).length > 0) {
      elements = elements.find("li > a");
      for (const element of elements) {
        let secondLevelPageUrl = $(element).attr()?.href;
        if (
          secondLevelPageUrl &&
          secondLevelPageUrl !== "#" &&
          secondLevelPageUrl !== ""
        ) {
          if (
            (await isInternalUrl(secondLevelPageUrl)) &&
            !secondLevelPageUrl.includes(url)
          ) {
            secondLevelPageUrl = await buildUrl(url, secondLevelPageUrl);
          }

          const secondLevelPageHost = new URL(
            secondLevelPageUrl
          ).hostname.replace("www.", "");

          if (secondLevelPageHost.includes(host)) {
            secondLevelPagesUrls.push(secondLevelPageUrl);
          }
        }
      }
    }

    if (
      secondLevelPagesUrls.length === 0 &&
      value !== customPrimaryMenuItemsDataElement
    ) {
      throw new DataElementError(value);
    }

    pagesUrls = [...pagesUrls, ...new Set(secondLevelPagesUrls)];
  }

  return getRandomNString(pagesUrls, numberOfPages);
};

const getSecondLevelPages = async (url: string): Promise<pageLink[]> => {
  const pagesUrls: pageLink[] = [];
  const $ = await loadPageData(url);

  const menuDataElements = [];
  for (const [, value] of Object.entries(menuItems)) {
    menuDataElements.push(value.data_element);
  }

  menuDataElements.push(customPrimaryMenuItemsDataElement);

  for (const value of menuDataElements) {
    const dataElement = `[data-element="${value}"]`;

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
          if (
            (await isInternalUrl(secondLevelPageUrl)) &&
            !secondLevelPageUrl.includes(url)
          ) {
            secondLevelPageUrl = await buildUrl(url, secondLevelPageUrl);
          }

          pagesUrls.push({
            linkName: $(element).text().trim() ?? null,
            linkUrl: secondLevelPageUrl,
          });
        }
      }
    }
  }

  return pagesUrls;
};

const getRandomServicesUrl = async (
  url: string,
  numberOfServices = 1
): Promise<string[]> => {
  let $ = await loadPageData(url);

  let serviceTypeUrls = await getHREFValuesDataAttribute(
    $,
    '[data-element="service-type"]'
  );
  if (serviceTypeUrls.length <= 0) {
    throw new DataElementError("service-type");
  }

  serviceTypeUrls = [...new Set(serviceTypeUrls)];

  let servicesUrls: string[] = [];
  for (const serviceTypeUrl of serviceTypeUrls) {
    const pagesToBeAnalyzed = [serviceTypeUrl];
    const pagesAnalyzed = [];

    while (pagesToBeAnalyzed.length > 0) {
      let pageToBeAnalyzed: string = pagesToBeAnalyzed.pop() ?? "";
      if (
        (await isInternalUrl(pageToBeAnalyzed)) &&
        !pageToBeAnalyzed.includes(url)
      ) {
        pageToBeAnalyzed = await buildUrl(url, pageToBeAnalyzed);
      }

      $ = await loadPageData(pageToBeAnalyzed);
      servicesUrls = [
        ...servicesUrls,
        ...(await getHREFValuesDataAttribute(
          $,
          '[data-element="service-link"]'
        )),
      ];

      pagesAnalyzed.push(pageToBeAnalyzed);

      const pagerPagesUrls = [
        ...new Set(
          await getHREFValuesDataAttribute($, '[data-element="pager-link"]')
        ),
      ];
      for (const pagerPageUrl of pagerPagesUrls) {
        if (
          !pagesAnalyzed.includes(pagerPageUrl) &&
          !pagesToBeAnalyzed.includes(pagerPageUrl)
        ) {
          pagesToBeAnalyzed.push(pagerPageUrl);
        }
      }
    }
  }

  if (servicesUrls.length === 0) {
    throw new DataElementError("service-link");
  }

  for (let i = 0; i < servicesUrls.length; i++) {
    if (
      (await isInternalUrl(servicesUrls[i])) &&
      !servicesUrls[i].includes(url)
    ) {
      servicesUrls[i] = await buildUrl(url, servicesUrls[i]);
    }
  }

  // Exclude external services
  const host = new URL(url).hostname.replace("www.", "");
  const internalServiceUrls = servicesUrls.filter((s) => s.includes(host));

  return getRandomNString(internalServiceUrls, numberOfServices);
};

const getRandomLocationsUrl = async (
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

  if ((await isInternalUrl(locationUrl)) && !locationUrl.includes(url)) {
    locationUrl = await buildUrl(url, locationUrl);
  }

  $ = await loadPageData(locationUrl);

  const pagesUrls = await getHREFValuesDataAttribute(
    $,
    '[data-element="location-link"]'
  );

  for (let i = 0; i < pagesUrls.length; i++) {
    const pageUrl = pagesUrls[i];
    if ((await isInternalUrl(pageUrl)) && !pageUrl.includes(url)) {
      pagesUrls[i] = await buildUrl(url, pageUrl);
    }
  }

  return getRandomNString(pagesUrls, numberOfPages);
};

const detectLang = (entries: string[]): "it" | "de" | "lld_ga" | "lld_ba" => {
  const comp = (str: string, items: string[]): boolean =>
    items.some(
      (e) => e.localeCompare(str, "it", { sensitivity: "base" }) === 0
    );

  for (const entry of entries) {
    if (comp(entry, primaryMenuItems.de)) return "de";
    else if (comp(entry, primaryMenuItems.lld_ba)) return "lld_ba";
    else if (comp(entry, primaryMenuItems.lld_ga)) return "lld_ga";
    else if (comp(entry, primaryMenuItems.it)) return "it";
  }
  return "it";
};

const getPages = async (
  url: string,
  requests: requestPages[],
  removeExternal = true
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
          const randomSecondLevelPageUrl = await getRandomSecondLevelPagesUrl(
            url,
            request.numberOfPages
          );
          pagesUrl = [...pagesUrl, ...randomSecondLevelPageUrl];
          break;
        }
        case "services": {
          const randomServicesUrl = await getRandomServicesUrl(
            url,
            request.numberOfPages
          );
          pagesUrl = [...pagesUrl, ...randomServicesUrl];
          break;
        }
        case "locations": {
          const randomLocationsUrl = await getRandomLocationsUrl(
            url,
            request.numberOfPages
          );
          pagesUrl = [...pagesUrl, ...randomLocationsUrl];
          break;
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

  if (removeExternal) {
    const internalPages: string[] = [];
    for (const pageUrl of pagesUrl) {
      if (await isInternalRedirectUrl(url, pageUrl)) {
        internalPages.push(pageUrl);
      }
    }

    return internalPages;
  }

  return pagesUrl;
};

export {
  getRandomServicesUrl,
  getRandomFirstLevelPagesUrl,
  getFirstLevelPages,
  getSecondLevelPages,
  getRandomSecondLevelPagesUrl,
  getRandomLocationsUrl,
  detectLang,
  getPages,
};
