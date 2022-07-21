"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-informative-personal-area-security",
      title:
        "C.SE.5.1 - CERTIFICATO HTTPS AREA SERVIZI PER IL CITTADINO - L'area servizi per il cittadino del sito comunale ha un certificato https valido e attivo.",
      failureTitle:
        "C.SE.5.1 - CERTIFICATO HTTPS AREA SERVIZI PER IL CITTADINO - L'area servizi per il cittadino del sito comunale ha un certificato https valido e attivo.",
      scoreDisplayMode: Audit.SCORING_MODES.INFORMATIVE,
      description:
        "CONDIZIONI DI SUCCESSO: l'area privata del cittadino utilizza un certificato https valido e non obsoleto secondo le raccomandazioni AgID; MODALITÀ DI VERIFICA: viene verificato che la pagina di accesso all'area privata del sito abbia un certificato https valido e attivo, ricercando uno specifico attributo \"data-element\" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Agid Raccomandazioni in merito allo standard Transport Layer Security (TLS), Documentazione tecnica](https://cert-agid.gov.it/wp-content/uploads/2020/11/AgID-RACCSECTLS-01.pdf).",
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
