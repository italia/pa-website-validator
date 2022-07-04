"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  getRandomMunicipalityServiceUrl,
  loadPageData,
  urlExists,
} from "../../utils/utils";
import { CheerioAPI } from "cheerio";

const Audit = lighthouse.Audit;

const greenResult = 'La voce "Contatti" è presente.';
const redResult = 'La voce "Contatti" non è presente.';
const notExecuted =
  "Non è stato possibile trovare una scheda servizio su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.";

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
        'CONDIZIONI DI SUCCESSO: in ogni scheda servizio è presente la voce "Contatti" (NB: questo audit è correlato a C.SI.1.3); MODALITÀ DI VERIFICA: viene verificata la presenza della voce "Contatti" in una scheda servizio casualmente selezionata; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni, EGovernment benchmark method paper 2020-2023](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/v2022.1/index.html)',
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
        key: "link_name",
        itemType: "text",
        text: "Nome del link",
      },
      {
        key: "link_destination",
        itemType: "text",
        text: "Destinazione link",
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
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: notExecuted + " Pagina servizio non trovata.",
            },
          ]
        ),
      };
    }

    item[0].inspected_page = randomServiceToBeScanned;
    const $: CheerioAPI = await loadPageData(randomServiceToBeScanned);
    const contactsElement = $('[data-element="contacts"]');
    const elementObj = $(contactsElement).attr();
    item[0].link_name = contactsElement.text().trim() ?? "";

    if (
      Boolean(elementObj) &&
      "href" in elementObj &&
      elementObj.href !== "#" &&
      elementObj.href !== ""
    ) {
      const checkUrl = await urlExists(url, elementObj.href);
      item[0].link_destination = checkUrl.inspectedUrl;

      if (!checkUrl.result) {
        item[0].result += checkUrl.reason;
        return {
          score: 0,
          details: Audit.makeTableDetails(headings, item),
        };
      }

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
