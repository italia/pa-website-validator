"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
const Audit = lighthouse.Audit;

import { CheerioAPI } from "cheerio";
import { buildUrl, isInternalUrl, loadPageData } from "../../utils/utils";

import { domains } from "../../storage/municipality/allowedDomains";

const greenResult = "Il sottodominio utilizzato è corretto.";
const redResult =
  "Il sottodominio utilizzato non è congruente al dominio del sito o non fa riferimento a un dominio riservato.";
const notExecuted =
  "Non è stato possibile identificare l'elemento su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-subdomain",
      title:
        "C.SE.5.2 - SOTTODOMINIO ISTITUZIONALE - L'area servizi per il cittadino del sito comunale deve utilizzare un sottodominio istituzionale congruente al dominio istituzionale del sito, presente all’interno dell’Anagrafe dei domini.",
      failureTitle:
        "C.SE.5.2 - SOTTODOMINIO ISTITUZIONALE - L'area servizi per il cittadino del sito comunale deve utilizzare un sottodominio istituzionale congruente al dominio istituzionale del sito, presente all’interno dell’Anagrafe dei domini.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "CONDIZIONI DI SUCCESSO: il sottodominio istituzione del sito è valido; MODALITÀ DI VERIFICA: viene verificato che il sottodominio utilizzato nella pagina di accesso all'area privata sia congruente al dominio utilizzato dal sito e che questo sia presente nell'Elenco Nomi a Dominio Riservati per i Comuni Italiani; RIFERIMENTI TECNICI E NORMATIVI: [Elenco Nomi a Dominio Riservati Per i Comuni Italiani](https://www.nic.it/sites/default/files/docs/comuni_list.html).",
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
        key: "domain",
        itemType: "text",
        text: "Dominio utilizzato",
      },
      {
        key: "subdomain",
        itemType: "text",
        text: "Sottodominio utilizzato",
      },
    ];

    const items = [
      {
        result: redResult,
        domain: "",
        subdomain: "",
      },
    ];

    const $: CheerioAPI = await loadPageData(url);
    const loginAreaElement = $('[data-element="personal-area-login"]');
    const elementObj = $(loginAreaElement).attr();

    if (
      !elementObj ||
      !("href" in elementObj) ||
      elementObj.href === "#" ||
      elementObj.href === ""
    ) {
      items[0].result = notExecuted;
      return {
        score: score,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    if (
      !elementObj.href.includes(url) &&
      (await isInternalUrl(elementObj.href))
    ) {
      elementObj.href = await buildUrl(url, elementObj.href);
    }
    const serviceAreaUrlHostnameParts = new URL(elementObj.href).hostname
      .replace("www.", "")
      .split(".");
    const subDomain = serviceAreaUrlHostnameParts[0];

    const hostnameParts = new URL(url).hostname.split(".");
    const domain = hostnameParts.slice(hostnameParts.length > 3 ? -2 : -1);
    const originFinalDomain = domain.join(".").split(".")[0];

    items[0].domain = originFinalDomain;
    items[0].subdomain = subDomain;

    let correctSubDomain = false;
    for (const domain of domains) {
      const splitDomain = domain.split(".");
      if (subDomain === splitDomain[0]) {
        correctSubDomain = true;
        break;
      }
    }

    if (subDomain === originFinalDomain && correctSubDomain) {
      score = 1;
      items[0].result = greenResult;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
