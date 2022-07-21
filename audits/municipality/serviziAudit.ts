"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
const Audit = lighthouse.Audit;

import {
  checkOrder,
  getPageElementDataAttribute,
  getRandomMunicipalityServiceUrl,
  loadPageData,
} from "../../utils/utils";

import { contentTypeItems } from "../../storage/municipality/contentTypeItems";
import { secondLevelPageNames } from "../../storage/municipality/controlledVocabulary";

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
      id: "municipality-servizi-structure-match-model",
      title:
        "C.SI.1.3 - SCHEDE INFORMATIVE DI SERVIZIO PER IL CITTADINO - Tutte le schede informative dei servizi per il cittadino devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
      failureTitle:
        "C.SI.1.3 - SCHEDE INFORMATIVE DI SERVIZIO PER IL CITTADINO - Tutte le schede informative dei servizi per il cittadino devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "CONDIZIONI DI SUCCESSO: nelle schede informative di servizio le voci indicate come obbligatorie sono presenti e sono nell'ordine corretto; MODALITÀ DI VERIFICA: viene verificato se le voci indicate come obbligatorie all'interno del documento di architettura dell'informazione sono presenti. Inoltre viene verificato se le voci obbligatorie presenti nell'indice della pagina sono nell'ordine corretto. La verifica viene effettuata su una scheda servizio casualmente selezionata, ricercando le voci indicate nella documentazione tecnica tramite specifici attributi \"data-element\"; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Content type: scheda servizio](https://docs.google.com/spreadsheets/d/1D4KbaA__xO9x_iBm08KvZASjrrFLYLKX/edit#gid=335720294dngdrFJf_Z2KNvDkMF3tKfc8/edit#gid=0), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
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

    const mandatoryIndexVoices = contentTypeItems.Indice;
    const mandatoryHeaderVoices = contentTypeItems.Header;
    const mandatoryBodyVoices = contentTypeItems.Body;
    const totalMandatoryVoices =
      mandatoryIndexVoices.length +
      mandatoryHeaderVoices.length +
      mandatoryBodyVoices.length;

    const randomServiceToBeScanned: string =
      await getRandomMunicipalityServiceUrl(url);

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

    const indexElements = await getServicesFromIndex($, mandatoryIndexVoices);
    const orderResult = await checkOrder(mandatoryIndexVoices, indexElements);
    const missingMandatoryItems = mandatoryIndexVoices.filter(
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
        secondLevelPageNames.includes(
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
