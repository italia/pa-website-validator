"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { CheerioAPI } from "cheerio";
import {
  checkOrder,
  getPageElementDataAttribute,
  getRandomMunicipalityServicesUrl,
  loadPageData,
  missingMenuItems,
  toMenuItem,
} from "../../utils/utils";
import { contentTypeItems } from "../../storage/municipality/contentTypeItems";
import { auditDictionary } from "../../storage/auditDictionary";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";
import { primaryMenuItems } from "../../storage/municipality/menuItems";

const Audit = lighthouse.Audit;

const auditId = "municipality-servizi-structure-match-model";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      toleranceTitle: "TEST YELLOW TITLE",
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

    const mandatoryIndexVoices = contentTypeItems.Indice;
    const mandatoryHeaderVoices = contentTypeItems.Header;
    const mandatoryBodyVoices = contentTypeItems.Body;

    const randomServices: string[] = await getRandomMunicipalityServicesUrl(
      url,
      auditVariables.numberOfServicesToBeScanned
    );

    if (!randomServices) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: auditData.nonExecuted,
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

      const indexElements = await getServicesFromIndex($, mandatoryIndexVoices);
      const mandatoryMenuItems = mandatoryIndexVoices.map(toMenuItem);
      const orderResult = checkOrder(mandatoryMenuItems, indexElements);
      const missingMandatoryItems = missingMenuItems(
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

      const status =
        $('[data-element="service-status"]').text().trim().toLowerCase() ?? "";
      if (!status || !status.includes("attivo")) {
        missingMandatoryItems.push(mandatoryHeaderVoices[2]);
      }

      const argumentsTag = await getPageElementDataAttribute(
        $,
        '[data-element="service-topic"]'
      );
      if (argumentsTag.length <= 0) {
        missingMandatoryItems.push(mandatoryHeaderVoices[3]);
      }

      const breadcrumbElements = await getPageElementDataAttribute(
        $,
        '[data-element="breadcrumb"]',
        "li"
      );

      let breadcrumbArgumentInVocabulary = false;
      for (const breadcrumbElement of breadcrumbElements) {
        if (
          primaryMenuItems.services.dictionary.includes(
            breadcrumbElement.trim().toLowerCase().replaceAll("/", "")
          )
        ) {
          breadcrumbArgumentInVocabulary = true;
          break;
        }
      }

      if (!breadcrumbArgumentInVocabulary) {
        missingMandatoryItems.push(mandatoryHeaderVoices[4]);
      }

      const area = $('[data-element="service-area"]').text().trim() ?? "";
      if (!area) {
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
