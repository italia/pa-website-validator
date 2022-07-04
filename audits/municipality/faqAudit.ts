"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { CheerioAPI } from "cheerio";
import { loadPageData, urlExists } from "../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult = "Il link è corretto e nella posizione corretta.";
const redResult = "Il link è errato o non è nella posizione corretta.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-faq-is-present",
      title:
        "C.SI.2.3 - RICHIESTA DI ASSISTENZA / DOMANDE FREQUENTI - Il sito comunale deve contenere una sezione per le domande più frequenti (FAQ).",
      failureTitle:
        "C.SI.2.3 - RICHIESTA DI ASSISTENZA / DOMANDE FREQUENTI - Il sito comunale deve contenere una sezione per le domande più frequenti (FAQ).",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        'CONDIZIONI DI SUCCESSO: nel footer del sito comunale è presente un link che rimanda alla sezione di FAQ; MODALITÀ DI VERIFICA: viene analizzato il footer del sito alla ricerca di un link che contenga nel nome i termini "FAQ" oppure "domande frequenti"; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni, EGovernment benchmark method paper 2020-2023](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/v2022.1/index.html)',
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
    const privacyPolicyElement = $("footer").find('[data-element="faq"]');
    const elementObj = $(privacyPolicyElement).attr();

    const label = privacyPolicyElement.text().trim().toLowerCase() ?? "";
    items[0].link_name = label;
    if (!label.includes("faq") && !label.includes("domande frequenti")) {
      return {
        score: 0,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    if (
      Boolean(elementObj) &&
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
