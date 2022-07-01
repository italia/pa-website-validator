"use strict";

import { run as securityAudit } from "../../utils/securityAuditLogic";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { CheerioAPI } from "cheerio";
import {
  buildUrl,
  isInternalUrl,
  loadPageData,
  urlExists,
} from "../../utils/utils";
const Audit = lighthouse.Audit;

const notExecuted =
  'Non è stato possibile condurre il test. Controlla le "Modalità di verifica" per scoprire di più.';

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-personal-area-security",
      title:
        "C.SE.5.1 - CERTIFICATO HTTPS AREA SERVIZI PER IL CITTADINO - L'area servizi per il cittadino del sito comunale ha un certificato https valido e attivo.",
      failureTitle:
        "C.SE.5.1 - CERTIFICATO HTTPS AREA SERVIZI PER IL CITTADINO - L'area servizi per il cittadino del sito comunale ha un certificato https valido e attivo.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "CONDIZIONI DI SUCCESSO: l'area privata del cittadino utilizza un certificato https valido e non obsoleto secondo le raccomandazioni AgID; MODALITÀ DI VERIFICA: viene verificato che la pagina di accesso all'area privata del sito abbia un certificato https valido e attivo; RIFERIMENTI TECNICI E NORMATIVI: [Agid Raccomandazioni in merito allo standard Transport Layer Security (TLS)](https://cert-agid.gov.it/wp-content/uploads/2020/11/AgID-RACCSECTLS-01.pdf).",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const origin = artifacts.origin;

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      { key: "inspected_url", itemType: "text", text: "URL ispezionato" },
    ];
    const item = [
      { result: notExecuted + " URL area privata non valido " },
      { inspected_url: "" },
    ];

    const $: CheerioAPI = await loadPageData(origin);
    const loginAreaElement = $('[data-element="personal-area-login"]');
    const elementObj = $(loginAreaElement).attr();

    if (
      !elementObj ||
      !("href" in elementObj) ||
      elementObj.href === "#" ||
      elementObj.href === ""
    ) {
      let urlInfo = {
        result: false,
        reason: "",
        inspectedUrl: "",
      };

      if (
        Boolean(elementObj) &&
        "href" in elementObj &&
        elementObj.href &&
        elementObj.href !== "#" &&
        elementObj.href !== ""
      ) {
        urlInfo = await urlExists(origin, elementObj.href);
        if (!urlInfo.result) {
          item[0].result += urlInfo.reason;
        }

        item[0].inspected_url = urlInfo.inspectedUrl;
      }

      return {
        score: 0,
        details: Audit.makeTableDetails(headings, item),
      };
    } else {
      let inspectUrl = elementObj.href;

      if (
        (await isInternalUrl(elementObj.href)) &&
        !elementObj.href.includes(origin)
      ) {
        inspectUrl = await buildUrl(origin, elementObj.href);
      }

      return await securityAudit(inspectUrl);
    }
  }
}

module.exports = LoadAudit;
