"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  checkOrder,
  getElementHrefValuesDataAttribute,
  getPageElementDataAttribute,
  getRandomSchoolServicesUrl,
  loadPageData,
  missingMenuItems,
  toMenuItem,
} from "../../utils/utils";
import { contentTypeItems } from "../../storage/school/contentTypeItems";
import { auditDictionary } from "../../storage/auditDictionary";
import { CheerioAPI } from "cheerio";
import { auditScanVariables } from "../../storage/school/auditScanVariables";

const Audit = lighthouse.Audit;

const auditId = "school-servizi-structure-match-model";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

const greenResult = auditData.greenResult;
const yellowResult = auditData.yellowResult;
const redResult = auditData.redResult;
const notExecuted = auditData.nonExecuted;

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
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

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

    const mandatoryVoices = contentTypeItems.Indice;
    const mandatoryHeaderVoices = contentTypeItems.Header;
    const mandatoryBodyVoices = contentTypeItems.Body;
    const mandatoryPlaceInfo = contentTypeItems.Luogo;

    const mandatoryMetadata = contentTypeItems.Metadati;
    const breadcrumbMandatoryElements = contentTypeItems.Breadcrumb;

    const randomServices: string[] = await getRandomSchoolServicesUrl(
      url,
      auditVariables.numberOfServicesToBeScanned
    );

    if (randomServices.length === 0) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: notExecuted,
            },
          ]
        ),
      };
    }

    const correctItems = [];
    const toleranceItems = [];
    const wrongItems = [];

    let score = 1;

    for (const randomService of randomServices) {
      const item = {
        missing_elements: "",
        wrong_order_elements: "",
        inspected_page: "",
      };

      item.inspected_page = randomService;

      const $: CheerioAPI = await loadPageData(randomService);

      const indexElements = await getServicesFromIndex($, mandatoryVoices);
      const mandatoryMenuItems = mandatoryVoices.map(toMenuItem);
      const orderResult = checkOrder(mandatoryMenuItems, indexElements);

      let missingMandatoryItems = missingMenuItems(
        indexElements,
        mandatoryMenuItems
      );

      const title = $('[data-element="service-title"]').text().trim() ?? "";
      if (!title) {
        missingMandatoryItems.push(mandatoryHeaderVoices[0]);
      }

      const description =
        $('[data-element="service-description"]').text().trim() ?? "";
      if (!description) {
        missingMandatoryItems.push(mandatoryHeaderVoices[1]);
      }

      const breadcrumbElements = await getPageElementDataAttribute(
        $,
        '[data-element="breadcrumb"]',
        "li"
      );
      if (
        !breadcrumbElements.includes(breadcrumbMandatoryElements[0]) &&
        !breadcrumbElements.includes(breadcrumbMandatoryElements[1])
      ) {
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
      if (!whatNeeds) {
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
    switch (score) {
      case 1:
        results.push({
          result: greenResult,
        });
        break;
      case 0.5:
        results.push({
          result: yellowResult,
        });
        break;
      case 0:
        results.push({
          result: redResult,
        });
        break;
    }

    results.push({});

    if (correctItems.length > 0) {
      results.push({
        result: auditData.subItem.greenResult,
        title_missing_elements: "Voci obbligatorie mancanti",
        title_wrong_order_elements:
          "Voci obbligatorie che non rispettano l'ordine corretto",
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

    if (toleranceItems.length > 0) {
      results.push({
        result: auditData.subItem.yellowResult,
        title_missing_elements: "Voci obbligatorie mancanti",
        title_wrong_order_elements:
          "Voci obbligatorie che non rispettano l'ordine corretto",
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

    if (wrongItems.length > 0) {
      results.push({
        result: auditData.subItem.redResult,
        title_missing_elements: "Voci obbligatorie mancanti",
        title_wrong_order_elements:
          "Voci obbligatorie che non rispettano l'ordine corretto",
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

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
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
    const innerElementLabels = $(element).find("span");
    const innerElementValues = $(element).find("p");

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
