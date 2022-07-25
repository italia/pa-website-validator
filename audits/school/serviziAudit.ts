"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

import {
  checkOrder,
  getElementHrefValuesDataAttribute,
  getPageElementDataAttribute,
  getRandomSchoolServiceUrl,
  loadPageData,
} from "../../utils/utils";
import { contentTypeItems } from "../../storage/school/contentTypeItems";

const Audit = lighthouse.Audit;

const greenResult =
  "Tutte le voci obbligatorie sono presenti e nell'ordine corretto.";
const yellowResult =
  "Fino a 2 voci obbligatorie non sono presenti o 1 voce non è nell'ordine corretto.";
const redResult =
  "Più di 2 voci obbligatorie non sono presenti o più di 1 voce non è nell'ordine corretto.";
const notExecuted =
  "Non è stato possibile trovare una scheda servizio su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-servizi-structure-match-model",
      title:
        "R.SC.1.2 - SCHEDE INFORMATIVE DI SERVIZIO - Tutte le schede informative dei servizi devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
      failureTitle:
        "R.SC.1.2 - SCHEDE INFORMATIVE DI SERVIZIO - Tutte le schede informative dei servizi devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "CONDIZIONI DI SUCCESSO: nelle schede informative di servizio le voci indicate come obbligatorie sono presenti e sono nell'ordine corretto; MODALITÀ DI VERIFICA: viene verificato se le voci indicate come obbligatorie all'interno del documento di architettura dell'informazione sono presenti. Inoltre viene verificato se le voci obbligatorie presenti nell'indice della pagina sono nell'ordine corretto. La verifica viene effettuata su una scheda servizio casualmente selezionata, ricercando le voci indicate nella documentazione tecnica tramite specifici attributi \"data-element\"; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Content type: scheda servizio](https://docs.google.com/spreadsheets/d/1MoayTY05SE4ixtgBsfsdngdrFJf_Z2KNvDkMF3tKfc8/edit#gid=0), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      {
        key: "inspected_page",
        itemType: "text",
        text: "Scheda di servizio ispezionata",
      },
      {
        key: "missing_mandatory_elements_found",
        itemType: "text",
        text: "Voci obbligatorie mancanti",
      },
      {
        key: "mandatory_elements_not_right_order",
        itemType: "text",
        text: "Voci obbligatorie che non rispettano l'ordine corretto",
      },
    ];

    const item = [
      {
        result: greenResult,
        missing_mandatory_elements_found: "",
        mandatory_elements_not_right_order: "",
        inspected_page: "",
      },
    ];

    let score = 1;

    const mandatoryVoices = contentTypeItems.Indice;
    const mandatoryHeaderVoices = contentTypeItems.Header;
    const mandatoryBodyVoices = contentTypeItems.Body;
    const mandatoryPlaceInfo = contentTypeItems.Luogo;
    const totalMandatoryVoices =
      mandatoryVoices.length +
      mandatoryHeaderVoices.length +
      mandatoryPlaceInfo.length +
      mandatoryBodyVoices.length;

    const mandatoryMetadata = contentTypeItems.Metadati;
    const breadcrumbMandatoryElements = contentTypeItems.Breadcrumb;

    const randomServiceToBeScanned: string = await getRandomSchoolServiceUrl(
      url
    );

    if (!randomServiceToBeScanned) {
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

    item[0].inspected_page = randomServiceToBeScanned;

    const $: CheerioAPI = await loadPageData(randomServiceToBeScanned);

    const indexElements = await getServicesFromIndex($, mandatoryVoices);
    const orderResult = await checkOrder(mandatoryVoices, indexElements);

    let missingMandatoryItems = mandatoryVoices.filter(
      (val) => !indexElements.includes(val)
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

    const missingVoicesAmount =
      totalMandatoryVoices - missingMandatoryItems.length;
    const voicesNotInCorrectOrderAmount =
      orderResult.numberOfElementsNotInSequence;

    if (missingVoicesAmount > 2 || voicesNotInCorrectOrderAmount > 1) {
      score = 0;
      item[0].result = redResult;
    } else if (
      (missingVoicesAmount > 0 && missingVoicesAmount <= 2) ||
      voicesNotInCorrectOrderAmount === 1
    ) {
      score = 0.5;
      item[0].result = yellowResult;
    }

    item[0].missing_mandatory_elements_found = missingMandatoryItems.join(", ");
    item[0].mandatory_elements_not_right_order =
      orderResult.elementsNotInSequence.join(", ");

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
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
