"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { CheerioAPI } from "cheerio";
import { loadPageData, urlExists } from "../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult =
  "Il link è nel footer e invia a una pagina esistente e sicura.";
const yellowResult =
  "Il link è nel footer e invia a una pagina esistente ma non sicura.";
const redResult =
  "Il link non è nel footer o non invia a una pagina esistente.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-legislation-privacy-is-present",
      title:
        "C.SC.2.1 - INFORMATIVA PRIVACY - Il sito della scuola deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
      failureTitle:
        "C.SC.2.1 - INFORMATIVA PRIVACY - Il sito della scuola deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        'CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta alla privacy policy; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, che riporti a una pagina esistente e con certificato HTTPS valido e attivo, ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: GDPR Artt. 13 e 14, Reg. UE n. 679/2016, [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
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
        text: "Testo del link",
      },
      {
        key: "link_destination",
        itemType: "text",
        text: "Pagina di destinazione del link",
      },
      {
        key: "existing_page",
        itemType: "text",
        text: "Pagina esistente",
      },
      {
        key: "secure_page",
        itemType: "text",
        text: "Pagina sicura",
      },
    ];

    const items = [
      {
        result: redResult,
        link_name: "",
        link_destination: "",
        existing_page: "No",
        secure_page: "No",
      },
    ];

    const $: CheerioAPI = await loadPageData(url);
    const privacyPolicyElement = $("footer").find(
      '[data-element="privacy-policy-link"]'
    );
    const elementObj = $(privacyPolicyElement).attr();
    items[0].link_name = privacyPolicyElement.text().trim() ?? "";
    items[0].link_destination = elementObj?.href ?? "";

    if (
      elementObj &&
      "href" in elementObj &&
      elementObj.href !== "#" &&
      elementObj.href !== ""
    ) {
      const checkUrl = await urlExists(url, elementObj.href, false);
      const checkUrlHttps = await urlExists(url, elementObj.href, true);

      if (checkUrlHttps.result) {
        items[0].result = greenResult;
        items[0].existing_page = "Sì";
        items[0].secure_page = "Sì";
        score = 1;
      } else if (checkUrl.result) {
        items[0].result = yellowResult;
        items[0].existing_page = "Sì";
        score = 0.5;
      }
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
