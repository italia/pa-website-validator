"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
const Audit = lighthouse.Audit;

import { CheerioAPI } from "cheerio";
import { buildUrl, isInternalUrl, loadPageData } from "../../utils/utils";

import { domains } from "../../storage/municipality/allowedDomains";

const greenResult =
  "La pagina utilizza un sottodominio congruente al dominio del sito e fa riferimento a un dominio riservato.";
const yellowResult =
  "La pagina non utilizza un sottodominio ma il dominio utilizzato è valido.";
const redResult =
  "La pagina utilizza un sottodominio non congruente al dominio del sito o non fa riferimento a un dominio valido.";
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
        "CONDIZIONI DI SUCCESSO: l'area servizi fa riferimento a un sottodominio istituzionale valido; MODALITÀ DI VERIFICA: ricercando uno specifico attributo \"data-element\" come spiegato nella documentazione tecnica, viene verificato che il sottodominio/dominio della pagina di accesso all'area privata sia congruente al dominio utilizzato dal sito e che questo dominio sia presente nell'Elenco Nomi a Dominio Riservati per i Comuni Italiani; RIFERIMENTI TECNICI E NORMATIVI: [Elenco Nomi a Dominio Riservati Per i Comuni Italiani](https://www.nic.it/sites/default/files/docs/comuni_list.html), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;
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
        result: greenResult,
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
        score: 0,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    if (
      !elementObj.href.includes(url) &&
      (await isInternalUrl(elementObj.href))
    ) {
      elementObj.href = await buildUrl(url, elementObj.href);
    }

    const serviceAreaHostname = new URL(elementObj.href).hostname.replace(
      "www.",
      ""
    );
    const originHostname = new URL(url).hostname.replace("www.", "");

    let serviceAreaHostnameParts = serviceAreaHostname.split(".").reverse();
    const originHostnameParts = originHostname.split(".").reverse();

    let sameDomain = true;
    let sameDomainChunkCount = 0;
    while (sameDomain && sameDomainChunkCount < originHostnameParts.length) {
      if (
        serviceAreaHostnameParts[sameDomainChunkCount] !==
        originHostnameParts[sameDomainChunkCount]
      ) {
        sameDomain = false;
      }
      sameDomainChunkCount++;
    }

    let correctDomain = false;
    for (const domain of domains) {
      if (serviceAreaHostname.includes(domain)) {
        correctDomain = true;
        break;
      }
    }

    let score = 1;
    serviceAreaHostnameParts = serviceAreaHostnameParts.reverse();
    items[0].domain = serviceAreaHostnameParts
      .slice(
        serviceAreaHostnameParts.length - sameDomainChunkCount,
        serviceAreaHostnameParts.length
      )
      .join(".");
    items[0].subdomain = serviceAreaHostnameParts
      .slice(0, serviceAreaHostnameParts.length - sameDomainChunkCount)
      .join(".");

    if (!correctDomain || !sameDomain) {
      score = 0;
      items[0].result = redResult;
      items[0].domain = serviceAreaHostname;
      items[0].subdomain = "";
    } else if (originHostnameParts.length === serviceAreaHostnameParts.length) {
      score = 0.5;
      items[0].result = yellowResult;
      items[0].domain = serviceAreaHostname;
      items[0].subdomain = "";
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
