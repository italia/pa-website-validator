"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
const Audit = lighthouse.Audit;

import {
  domains
} from "../../storage/municipality/allowedDomains";

const greenResult = "Il sottodominio utilizzato è corretto.";
const redResult = "Il sottodominio utilizzato non è congruente al dominio del sito o non fa riferimento a un dominio riservato.";

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
        "CONDIZIONI DI SUCCESSO: il sottodominio istituzione del sito è valido; MODALITÀ DI VERIFICA: viene verificato che il sottodominio utilizzato nella pagina di accesso all'area privata sia congruente al dominio utilizzato dal sito e che questo sia presente nell'Elenco Nomi a Dominio Riservati per i Comuni Italiani; RIFERIMENTI TECNICI E NORMATIVI: [Elenco Nomi a Dominio Riservati Per i Comuni Italiani](https://www.nic.it/sites/default/files/docs/comuni_list.html)",
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
        key: "subdomain",
        itemType: "text",
        text: "Sottodominio utilizzato",
      },
    ];

    const urlParts = url.split(".")

    const items = [
      {
        result: redResult,
        subdomain: urlParts[1],
      },
    ];

    let correctDomain = false
    for (const domain of domains) {
      const splitDomain = domain.split('.')
      if (urlParts[1] === splitDomain[0]) {
        correctDomain = true
        break
      }
    }

    if (correctDomain) {
      score = 1
      items[0].result = greenResult
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
