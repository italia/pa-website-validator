"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  getPageElementDataAttribute,
  getRandomMunicipalityServiceUrl,
  loadPageData,
} from "../../utils/utils";
import { CheerioAPI } from "cheerio";

const Audit = lighthouse.Audit;

const greenResult = "Il componente è presente.";
const redResult = "Il componente non è presente.";
const notExecuted =
  "Non è stato possibile identificare l'elemento su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-contacts-assistency",
      title:
        "C.SI.2.2 - RICHIESTA DI ASSISTENZA / CONTATTI - All'interno del sito comunale, nel contenuto della scheda servizio, devono essere comunicati i contatti dell'ufficio preposto all'erogazione del servizio.",
      failureTitle:
        "C.SI.2.2 - RICHIESTA DI ASSISTENZA / CONTATTI - All'interno del sito comunale, nel contenuto della scheda servizio, devono essere comunicati i contatti dell'ufficio preposto all'erogazione del servizio.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "CONDIZIONI DI SUCCESSO: i contatti dell'ufficio preposto all'erogazione del servizio sono presenti in tutte le schede servizio; MODALITÀ DI VERIFICA: viene verificata la presenza della voce \"Contatti\" all'interno dell'indice di una scheda servizio selezionata casualmente, ricercando uno specifico attributo \"data-element\" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [eGovernment benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;
    let score = 0;

    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
      },
      {
        key: "inspected_page",
        itemType: "text",
        text: "Pagina ispezionata",
      },
    ];

    const item = [
      {
        result: redResult,
        link_name: "",
        link_destination: "",
        inspected_page: "",
      },
    ];

    const randomServiceToBeScanned: string =
      await getRandomMunicipalityServiceUrl(url);

    if (!randomServiceToBeScanned) {
      return {
        score: score,
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

    const indexList = await getPageElementDataAttribute(
      $,
      '[data-element="page-index"]',
      "> li > a"
    );

    let contactsPresent = false;
    if (indexList.includes("Contatti")) {
      contactsPresent = true;
    }

    if (contactsPresent) {
      item[0].result = greenResult;
      score = 1;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;
