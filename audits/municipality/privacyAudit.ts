"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { CheerioAPI } from "cheerio";
import {
  loadPageData,
  getHttpsRequestStatusCode,
  isInternalUrl,
  buildUrl,
  isHttpsUrl,
  hostnameExists,
} from "../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult = "Il link è corretto e nella posizione corretta.";
const redResult = "Il link è errato o non è nella posizione corretta.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-legislation-privacy-is-present",
      title:
      "C.SI.3.3 - INFORMATIVA PRIVACY - Il sito comunale deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
      failureTitle:
      "C.SI.3.3 - INFORMATIVA PRIVACY - Il sito comunale deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
      "CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta alla privacy policy; MODALITÀ DI VERIFICA: viene verificata la presenza e posizione del link nel footer e che riporti correttamente alla privacy policy; RIFERIMENTI TECNICI E NORMATIVI: GDPR Artt. 13 e 14, Reg. UE n. 679/2016.",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin

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
      let inspectUrl = elementObj.href;
      items[0].link_destination = inspectUrl;

      if (
        (await isInternalUrl(elementObj.href)) &&
        !elementObj.href.includes(url)
      ) {
        inspectUrl = await buildUrl(url, elementObj.href);
      }

      if (!(await isHttpsUrl(inspectUrl))) {
        items[0].result += " Protocollo HTTPS mancante nell'URL.";
        return {
          score: 0,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      const hostExists = await hostnameExists(inspectUrl);
      if (!hostExists.exists) {
        items[0].result += " Hostname non trovato.";
        return {
          score: 0,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      const statusCode = await getHttpsRequestStatusCode(inspectUrl);
      if (statusCode !== 200) {
        items[0].result += " Pagina non trovata.";
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
