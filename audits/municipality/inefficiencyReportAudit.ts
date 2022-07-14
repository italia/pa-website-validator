"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { CheerioAPI } from "cheerio";
import { loadPageData, urlExists } from "../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult = "Il link è nel footer e nominato correttamente.";
const yellowResult = "Il link è nel footer ma non è nominato correttamente.";
const redResult = "Il link non è nel footer.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-inefficiency-report",
      title:
        "C.SI.2.4 - SEGNALAZIONE DISSERVIZIO - Il sito comunale deve fornire al cittadino la possibilità di segnalare un disservizio, tramite email o servizio dedicato.",
      failureTitle:
        "C.SI.2.4 - SEGNALAZIONE DISSERVIZIO - Il sito comunale deve fornire al cittadino la possibilità di segnalare un disservizio, tramite email o servizio dedicato.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        'CONDIZIONI DI SUCCESSO: nel footer del sito è presente un link per la segnalazione di un disservizio che contenga le espressioni "disservizio" oppure "segnala disservizio" oppure "segnalazione disservizio"; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica, e che il testo del link contenga almeno una delle espressioni richieste, senza fare distinzione tra caratteri minuscoli o maiuscoli; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [eGovernment benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
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
    ];

    const items = [
      {
        result: redResult,
        link_name: "",
        link_destination: "",
      },
    ];

    const $: CheerioAPI = await loadPageData(url);
    const privacyPolicyElement = $("footer").find(
      '[data-element="report-inefficiency"]'
    );
    const elementObj = $(privacyPolicyElement).attr();

    const label = privacyPolicyElement.text().trim().toLowerCase() ?? "";
    items[0].link_name = label;
    items[0].link_destination = elementObj?.href ?? "";

    if (
      elementObj &&
      "href" in elementObj &&
      elementObj.href !== "#" &&
      elementObj.href !== ""
    ) {
      const checkUrl = await urlExists(url, elementObj.href);
      items[0].link_destination = checkUrl.inspectedUrl;

      if (!checkUrl.result) {
        items[0].result += checkUrl.reason;
        return {
          score: 0,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      if (!label.includes("disservizio") && !label.includes("segnala")) {
        items[0].result = yellowResult;
        return {
          score: 0.5,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      items[0].result = greenResult;
      score = 1;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
