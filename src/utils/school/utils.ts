"use strict";
import {
  menuItems,
  primaryMenuDataElement,
  primaryMenuItems,
} from "../../storage/school/menuItems";
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
    if (!pagesUrls[i].includes(url)) {
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

  for (const [, value] of Object.entries(menuItems)) {
    const dataElement = `[data-element="${value.data_element}"]`;

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
          if (!secondLevelPageUrl.includes(url)) {
            secondLevelPageUrl = await buildUrl(url, secondLevelPageUrl);
          }
          secondLevelPagesUrls.push(secondLevelPageUrl);
        }
      }

      if (secondLevelPagesUrls.length === 0) {
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

  for (let i = 0; i < servicesUrls.length; i++) {
    if (!servicesUrls[i].includes(url)) {
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

export {
  getRandomServicesUrl,
  getRandomFirstLevelPagesUrl,
  getRandomSecondLevelPagesUrl,
  getRandomLocationsUrl,
};
