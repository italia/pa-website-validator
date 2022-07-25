"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
const Audit = lighthouse.Audit;

import { domains } from "../../storage/municipality/allowedDomains";

const greenResult = "Il dominio utilizzato è corretto.";
const redResult =
  "Il dominio utilizzato non è presente nell'elenco dei domini riservati.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-domain",
      title:
        "C.SI.5.2 - DOMINIO ISTITUZIONALE - Il sito comunale deve utilizzare un dominio istituzionale presente all’interno dell’Anagrafe dei domini.",
      failureTitle:
        "C.SI.5.2 - DOMINIO ISTITUZIONALE - Il sito comunale deve utilizzare un dominio istituzionale presente all’interno dell’Anagrafe dei domini.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "CONDIZIONI DI SUCCESSO: il dominio istituzione del sito è valido; MODALITÀ DI VERIFICA: viene verificato che il dominio utilizzato dal sito sia presente nell'Elenco Nomi a Dominio Riservati per i Comuni Italiani; RIFERIMENTI TECNICI E NORMATIVI: [Elenco Nomi a Dominio Riservati Per i Comuni Italiani](https://www.nic.it/sites/default/files/docs/comuni_list.html).",
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
    ];

    const hostname = new URL(url).hostname.replace("www.", "");

    const items = [
      {
        result: redResult,
        domain: hostname,
      },
    ];

    let correctDomain = false;
    for (const domain of domains) {
      if (hostname.includes(domain)) {
        correctDomain = true;
        break;
      }
    }

    if (correctDomain) {
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
