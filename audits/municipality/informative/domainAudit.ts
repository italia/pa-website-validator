"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-informative-domain",
      title:
        "C.SI.5.2 - DOMINIO ISTITUZIONALE - Il sito comunale deve utilizzare un dominio istituzionale presente all’interno dell’Anagrafe dei domini.",
      failureTitle:
        "C.SI.5.2 - DOMINIO ISTITUZIONALE - Il sito comunale deve utilizzare un dominio istituzionale presente all’interno dell’Anagrafe dei domini.",
      scoreDisplayMode: Audit.SCORING_MODES.INFORMATIVE,
      description:
        "CONDIZIONI DI SUCCESSO: il dominio istituzione del sito è valido; MODALITÀ DI VERIFICA: viene verificato che il dominio utilizzato dal sito sia presente nell'Elenco Nomi a Dominio Riservati per i Comuni Italiani; RIFERIMENTI TECNICI E NORMATIVI: [Elenco Nomi a Dominio Riservati Per i Comuni Italiani](https://www.nic.it/sites/default/files/docs/comuni_list.html).",
      requiredArtifacts: [],
    };
  }

  static async audit(): Promise<{
    score: number;
    details: LH.Audit.Details.Table;
  }> {
    return {
      score: 1,
      details: Audit.makeTableDetails(
        [
          {
            key: "result",
            itemType: "text",
            text: "Risultato",
          },
        ],
        [
          {
            result:
              "Questo audit produce un risultato solo quando viene effettuato su un sito pubblicato online.",
          },
        ]
      ),
    };
  }
}

module.exports = LoadAudit;
