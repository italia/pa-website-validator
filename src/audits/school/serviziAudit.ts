"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  checkBreadcrumb,
  checkOrderLoose,
  getElementHrefValuesDataAttribute,
  getPageElementDataAttribute,
  loadPageData,
  missingMenuItems,
  toMenuItem,
} from "../../utils/utils";
import { getPages } from "../../utils/school/utils";
import {
  contentTypeItemsBody,
  contentTypeItemsHeaders,
  contentTypeItemsIndex,
  contentTypeItemsIndexDataElements,
  contentTypeItemsLocation,
  contentTypeItemsMetadata,
} from "../../storage/school/contentTypeItems";
import { auditDictionary } from "../../storage/auditDictionary";
import { CheerioAPI } from "cheerio";
import { auditScanVariables } from "../../storage/school/auditScanVariables";
import {
  errorHandling,
  notExecutedErrorMessage,
} from "../../config/commonAuditsParts";
import { DataElementError } from "../../utils/DataElementError";

const Audit = lighthouse.Audit;

const auditId = "school-servizi-structure-match-model";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

const numberOfServicesToBeScanned = process.env["numberOfServicePages"]
  ? JSON.parse(process.env["numberOfServicePages"])
  : auditVariables.numberOfServicesToBeScanned;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<LH.Audit.ProductBase> {
    const url = artifacts.origin;

    const titleSubHeadings = [
      "Voci mancanti o senza contenuto",
      "Voci che non rispettano l'ordine richiesto",
    ];
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
        subItemsHeading: { key: "inspected_page", itemType: "url" },
      },
      {
        key: "title_missing_elements",
        itemType: "text",
        text: "",
        subItemsHeading: {
          key: "missing_elements",
          itemType: "text",
        },
      },
      {
        key: "title_wrong_order_elements",
        itemType: "text",
        text: "",
        subItemsHeading: {
          key: "wrong_order_elements",
          itemType: "text",
        },
      },
    ];

    const mandatoryVoices = contentTypeItemsIndex;
    const mandatoryVoicesDataElements = contentTypeItemsIndexDataElements;
    const mandatoryHeaderVoices = contentTypeItemsHeaders;
    const mandatoryBodyVoices = contentTypeItemsBody;
    const mandatoryPlaceInfo = contentTypeItemsLocation;

    const mandatoryMetadata = contentTypeItemsMetadata;

    let pagesToBeAnalyzed = [];
    try {
      pagesToBeAnalyzed = await getPages(url, [
        {
          type: "services",
          numberOfPages: numberOfServicesToBeScanned,
        },
      ]);
    } catch (ex) {
      if (!(ex instanceof DataElementError)) {
        throw ex;
      }

      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: notExecutedErrorMessage.replace("<LIST>", ex.message),
            },
          ]
        ),
      };
    }

    const correctItems = [];
    const toleranceItems = [];
    const wrongItems = [];

    let score = 1;

    const pagesInError = [];
    let $: CheerioAPI = await loadPageData(url);
    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      const item = {
        missing_elements: "",
        wrong_order_elements: "",
        inspected_page: "",
      };

      item.inspected_page = pageToBeAnalyzed;

      try {
        $ = await loadPageData(pageToBeAnalyzed);
      } catch (ex) {
        if (!(ex instanceof Error)) {
          throw ex;
        }

        let errorMessage = ex.message;
        errorMessage = errorMessage.substring(
          errorMessage.indexOf('"') + 1,
          errorMessage.lastIndexOf('"')
        );

        pagesInError.push({
          inspected_page: pageToBeAnalyzed,
          wrong_order_elements: errorMessage,
        });
        continue;
      }

      let indexElements = await getServicesFromIndex($, mandatoryVoices);

      const mandatoryMenuItems = mandatoryVoices.map(toMenuItem);
      const orderResult = checkOrderLoose(mandatoryMenuItems, indexElements);

      //For Contatti we don't check its content
      const indexElementsWithContent: string[] = ["Contatti"];

      for (const mandatoryVoiceDataElement of mandatoryVoicesDataElements.paragraph) {
        const dataElement = `[data-element="${mandatoryVoiceDataElement.data_element}"]`;
        const textContent = $(dataElement).text();
        if (textContent.length >= 3) {
          indexElementsWithContent.push(mandatoryVoiceDataElement.key);
        }
      }

      for (const mandatoryVoiceDataElement of mandatoryVoicesDataElements.exist) {
        const dataElement = `[data-element="${mandatoryVoiceDataElement.data_element}"]`;
        const element = $(dataElement);
        if (element.length > 0) {
          indexElementsWithContent.push(mandatoryVoiceDataElement.key);
        }
      }

      indexElements = indexElements.filter((value) =>
        indexElementsWithContent.includes(value)
      );

      let missingMandatoryItems = missingMenuItems(
        indexElements,
        mandatoryMenuItems
      );

      const title = $('[data-element="service-title"]').text().trim() ?? "";
      if (title.length < 3) {
        missingMandatoryItems.push(mandatoryHeaderVoices[0]);
      }

      const description =
        $('[data-element="service-description"]').text().trim() ?? "";
      if (description.length < 3) {
        missingMandatoryItems.push(mandatoryHeaderVoices[1]);
      }

      let breadcrumbElements = await getPageElementDataAttribute(
        $,
        '[data-element="breadcrumb"]',
        "li"
      );
      breadcrumbElements = breadcrumbElements.map((x) =>
        x
          .replaceAll(/[^a-zA-Z0-9 ]/g, "")
          .trim()
          .toLowerCase()
      );

      if (!checkBreadcrumb(breadcrumbElements)) {
        missingMandatoryItems.push(mandatoryHeaderVoices[2]);
      }

      const argumentsTag = await getPageElementDataAttribute(
        $,
        '[data-element="topic-list"]'
      );
      if (argumentsTag.length <= 0) {
        missingMandatoryItems.push(mandatoryHeaderVoices[3]);
      }

      const whatNeeds = $('[data-element="used-for"]').text().trim() ?? "";
      if (whatNeeds.length < 3) {
        missingMandatoryItems.push(mandatoryBodyVoices[0]);
      }

      const responsibleStructure = await getPageElementDataAttribute(
        $,
        '[data-element="structures"]',
        "a"
      );
      if (responsibleStructure.length <= 0) {
        missingMandatoryItems.push(mandatoryBodyVoices[1]);
      }

      const placeInfo = await getPlaceInfo($, mandatoryPlaceInfo);
      if (placeInfo.length > 0) {
        missingMandatoryItems = [...missingMandatoryItems, ...placeInfo];
      }

      const metadata = $('[data-element="metadata"]').text().trim() ?? "";
      if (
        !metadata.toLowerCase().includes(mandatoryMetadata[0].toLowerCase()) ||
        !metadata.toLowerCase().includes(mandatoryMetadata[1].toLowerCase())
      ) {
        missingMandatoryItems.push(mandatoryBodyVoices[2]);
      }

      item.missing_elements = missingMandatoryItems.join(", ");
      item.wrong_order_elements = orderResult.elementsNotInSequence.join(", ");

      const missingVoicesAmount = missingMandatoryItems.length;
      const voicesNotInCorrectOrderAmount =
        orderResult.numberOfElementsNotInSequence;

      if (missingVoicesAmount > 2 || voicesNotInCorrectOrderAmount > 1) {
        if (score > 0) {
          score = 0;
        }

        wrongItems.push(item);
      } else if (
        (missingVoicesAmount > 0 && missingVoicesAmount <= 2) ||
        voicesNotInCorrectOrderAmount === 1
      ) {
        if (score > 0.5) {
          score = 0.5;
        }

        toleranceItems.push(item);
      } else {
        correctItems.push(item);
      }
    }

    const results = [];
    if (pagesInError.length > 0) {
      results.push({
        result: errorHandling.errorMessage,
      });

      results.push({});

      results.push({
        result: errorHandling.errorColumnTitles[0],
        title_missing_elements: errorHandling.errorColumnTitles[1],
        title_wrong_order_elements: "",
      });

      for (const item of pagesInError) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }
    } else {
      switch (score) {
        case 1:
          results.push({
            result: auditData.greenResult,
          });
          break;
        case 0.5:
          results.push({
            result: auditData.yellowResult,
          });
          break;
        case 0:
          results.push({
            result: auditData.redResult,
          });
          break;
      }
    }

    results.push({});

    if (wrongItems.length > 0) {
      results.push({
        result: auditData.subItem.redResult,
        title_missing_elements: titleSubHeadings[0],
        title_wrong_order_elements: titleSubHeadings[1],
      });

      for (const item of wrongItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    if (toleranceItems.length > 0) {
      results.push({
        result: auditData.subItem.yellowResult,
        title_missing_elements: titleSubHeadings[0],
        title_wrong_order_elements: titleSubHeadings[1],
      });

      for (const item of toleranceItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    if (correctItems.length > 0) {
      results.push({
        result: auditData.subItem.greenResult,
        title_missing_elements: titleSubHeadings[0],
        title_wrong_order_elements: titleSubHeadings[1],
      });

      for (const item of correctItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
      errorMessage: pagesInError.length > 0 ? errorHandling.popupMessage : "",
    };
  }
}

module.exports = LoadAudit;

async function getServicesFromIndex(
  $: CheerioAPI,
  mandatoryElements: string[]
): Promise<string[]> {
  const indexList = await getPageElementDataAttribute(
    $,
    '[data-element="page-index"]',
    "> li > a"
  );

  const returnValues = [];
  for (const indexElement of indexList) {
    if (mandatoryElements.includes(indexElement)) {
      returnValues.push(indexElement);
    }
  }

  return returnValues;
}

async function getPlaceInfo($: CheerioAPI, mandatoryElements: string[]) {
  const elements = $('[data-element="places"]');

  if (elements.length <= 0) {
    return mandatoryElements;
  }

  const placeCards = [];
  for (const element of elements) {
    const placeCard = [];
    const innerElementLabels = $(element).find("div > span");
    const innerElementValues = $(element).find("div > p");

    const gps = await getElementHrefValuesDataAttribute(
      $,
      '[data-element="places"]',
      "a"
    );
    let gpsLabel = "";
    let gpsValue = "";
    for (const gpsElement of gps) {
      if (
        Boolean(gpsElement.label) &&
        Boolean(gpsElement.url) &&
        gpsElement.url.includes("map")
      ) {
        gpsLabel = "gps";
        gpsValue = gpsElement.url;
        break;
      }
    }

    if (gpsLabel) {
      placeCard.push({
        [gpsLabel]: gpsValue,
      });
    }

    for (
      let i = 0, j = 0;
      i < innerElementLabels.length, j < innerElementValues.length;
      i++, j++
    ) {
      const labelText =
        $(innerElementLabels[i]).text().trim().toLowerCase() ?? null;
      if (labelText) {
        let labelValue = "";

        if ($(innerElementValues[j])) {
          labelValue =
            $(innerElementValues[j]).text().trim().toLowerCase() ?? "";

          while (
            !labelText.match("(ora)") &&
            (labelValue.match("^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$") ||
              labelValue.match(
                "^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$"
              ))
          ) {
            j++;
            labelValue =
              $(innerElementValues[j]).text().trim().toLowerCase() ?? "";
          }
        }

        placeCard.push({
          [labelText]: labelValue,
        });
      }
    }

    placeCards.push(placeCard);
  }

  if (placeCards.length <= 0) {
    return [];
  }

  const foundElements = [];
  for (const cardElement of placeCards) {
    for (const cardElementObj of cardElement) {
      const key = Object.keys(cardElementObj);
      if (key.length <= 0) {
        continue;
      }
      const value = Object.values(cardElementObj) ?? [];

      if (
        Boolean(value[0].toLowerCase()) &&
        mandatoryElements.includes(key[0].toLowerCase())
      ) {
        foundElements.push(key[0].toLowerCase());
      }
    }
  }

  const removeDuplicates = [...new Set(foundElements)];

  return mandatoryElements.filter((val) => !removeDuplicates.includes(val));
}
