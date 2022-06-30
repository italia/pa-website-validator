"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

import {
  getPageElementDataAttribute,
  getRandomMunicipalityServiceUrl,
} from "../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult =
  "Tutte le voci obbligatorie sono presenti e nell'ordine corretto.";
const yellowResult =
  "Non sono presenti tutte le voci obbligatorie o non tutte le voci obbligatorie sono nell'ordine corretto.";
const redResult =
  "Non sono presenti tutte le voci obbligatorie e non tutte le voci obbligatorie sono nell'ordine corretto.";
const notExecuted =
  'Non è stato possibile condurre il test. Controlla le "Modalità di verifica" per scoprire di più.';

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
        "CONDIZIONI DI SUCCESSO: nella scheda servizio sono presenti almeno 8 su 9 delle voci obbligatorie e almeno 8 su 9 delle voci obbligatorie sono nell'ordine corretto; MODALITÀ DI VERIFICA: viene verificato quali voci sono presenti all'interno di una scheda servizio casualmente selezionata e il loro ordine; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/v2022.1/index.html).",
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

    const randomServiceToBeScanned: string =
      await getRandomMunicipalityServiceUrl(url);
    if (!randomServiceToBeScanned) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: notExecuted + " - Pagina servizio non trovata.",
            },
          ]
        ),
      };
    }

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
    '[data-element="index-link-list"]',
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
