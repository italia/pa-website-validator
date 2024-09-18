"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { CheerioAPI, text } from "cheerio";
import {
  checkBreadcrumb,
  checkOrder,
  getPageElementDataAttribute,
  getRandomNString,
  loadPageData,
  missingMenuItems,
  toMenuItem,
} from "../../utils/utils";
import { getPages } from "../../utils/municipality/utils";
import {
  contentTypeItemsBody,
  contentTypeItemsHeaders,
  contentTypeItemsIndex,
  contentTypeItemsIndexDataElement,
} from "../../storage/municipality/contentTypeItems";
import { auditDictionary } from "../../storage/auditDictionary";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";
import {
  errorHandling,
  minNumberOfServices,
  notExecutedErrorMessage,
} from "../../config/commonAuditsParts";
import { DataElementError } from "../../utils/DataElementError";

const Audit = lighthouse.Audit;

const auditId = "municipality-servizi-structure-match-model";
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

    const mandatoryIndexVoices = contentTypeItemsIndex;
    const mandatoryVoicesDataElements = contentTypeItemsIndexDataElement;
    const mandatoryHeaderVoices = contentTypeItemsHeaders;
    const mandatoryBodyVoices = contentTypeItemsBody;

    let totalServices = [];
    try {
      totalServices = await getPages(url, [
        {
          type: "services",
          numberOfPages: -1,
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

    const pagesToBeAnalyzed = await getRandomNString(
      totalServices,
      numberOfServicesToBeScanned
    );

    const correctItems = [];
    const toleranceItems = [];
    const wrongItems = [];

    let score = 1;

    const pagesInError = [];
    let $: CheerioAPI = await loadPageData(url, true);
    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      const item = {
        missing_elements: "",
        wrong_order_elements: "",
        inspected_page: "",
      };

      item.inspected_page = pageToBeAnalyzed;

      try {
        $ = await loadPageData(pageToBeAnalyzed, true);
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
          wrong_order_elements: "",
          missing_elements: errorMessage,
        });
        continue;
      }

      let indexElements = await getServicesFromIndex($, mandatoryIndexVoices);

      const mandatoryMenuItems = mandatoryIndexVoices.map(toMenuItem);
      const orderResult = checkOrder(mandatoryMenuItems, indexElements);

      const indexElementsWithContent: string[] = [];

      for (const mandatoryVoiceDataElement of mandatoryVoicesDataElements.paragraph) {
        const dataElement = `[data-element="${mandatoryVoiceDataElement.data_element}"]`;
        const textContent = text($(dataElement));
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

      const missingMandatoryItems = missingMenuItems(
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

      const status = $('[data-element="service-status"]');

      if (status.length <= 0) {
        missingMandatoryItems.push(mandatoryHeaderVoices[2]);
      }

      const argumentsTag = await getPageElementDataAttribute(
        $,
        '[data-element="service-topic"]'
      );
      if (argumentsTag.length <= 0) {
        missingMandatoryItems.push(mandatoryHeaderVoices[3]);
      }

      let breadcrumbElements = await getPageElementDataAttribute(
        $,
        '[data-element="breadcrumb"]',
        "li"
      );
      breadcrumbElements = breadcrumbElements.map((x) =>
        x
          .toLowerCase()
          .replaceAll(/[^a-zA-Z0-9 ]/g, "")
          .trim()
      );

      if (!checkBreadcrumb(breadcrumbElements)) {
        missingMandatoryItems.push(mandatoryHeaderVoices[4]);
      }

      const area = $('[data-element="service-area"]').text().trim() ?? "";
      if (area.length < 3) {
        missingMandatoryItems.push(mandatoryBodyVoices[0]);
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
    if (totalServices.length < minNumberOfServices) {
      score = 0;
    }

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
