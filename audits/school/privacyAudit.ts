"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { CheerioAPI } from "cheerio";
import { loadPageData } from "../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult = "Il link è corretto e nella posizione corretta.";
const redResult = "Il link è errato o non è nella posizione corretta.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-legislation-privacy-is-present",
      title:
        "C.SC.2.1 - INFORMATIVA PRIVACY - Il sito scuola deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
      failureTitle:
        "C.SC.2.1 - INFORMATIVA PRIVACY - Il sito scuola deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta alla privacy policy; MODALITÀ DI VERIFICA: viene verificata la presenza e posizione del link nel footer e che riporti correttamente alla privacy policy; RIFERIMENTI TECNICI E NORMATIVI: GDPR Artt. 13 e 14, Reg. UE n. 679/2016.",
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
      '[data-element="privacy-policy-link"]'
    );
    const elementObj = $(privacyPolicyElement).attr();
    items[0].link_name = privacyPolicyElement.text() ?? "";

    if (
      Boolean(elementObj) &&
      "href" in elementObj &&
      elementObj.href !== "#" &&
      elementObj.href !== ""
    ) {
      items[0].result = greenResult;
      items[0].link_destination = elementObj.href;
      score = 1;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
