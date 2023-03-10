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
  isInternalUrl,
  loadPageData,
} from "../utils";

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

  if (pagesUrls.length < primaryMenuItems.length) {
    return [];
  }

  for (let i = 0; i < pagesUrls.length; i++) {
    if ((await isInternalUrl(pagesUrls[i])) && !pagesUrls[i].includes(url)) {
      pagesUrls[i] = await buildUrl(url, pagesUrls[i]);
    }
  }

  return getRandomNString(pagesUrls, numberOfPages);
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

      if (
        secondLevelPagesUrls.length === 0 &&
        value !== customPrimaryMenuItemsDataElement
      ) {
        return [];
      }

      pagesUrls = [...pagesUrls, ...new Set(secondLevelPagesUrls)];
    }
  }

  return getRandomNString(pagesUrls, numberOfPages);
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
    return [];
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

  for (let i = 0; i < servicesUrls.length; i++) {
    if (
      (await isInternalUrl(servicesUrls[i])) &&
      !servicesUrls[i].includes(url)
    ) {
      servicesUrls[i] = await buildUrl(url, servicesUrls[i]);
    }
  }

  return getRandomNString(servicesUrls, numberOfServices);
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

export {
  getRandomServicesUrl,
  getRandomFirstLevelPagesUrl,
  getRandomSecondLevelPagesUrl,
  getRandomLocationsUrl,
};
