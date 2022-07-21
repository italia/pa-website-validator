"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "common-informative-ip-location",
      title:
        "LOCALIZZAZIONE IP - Il sito deve essere hostato su datacenter localizzati su territorio europeo.",
      failureTitle:
        "LOCALIZZAZIONE IP - Il sito deve essere hostato su datacenter localizzati su territorio europeo.",
      scoreDisplayMode: Audit.SCORING_MODES.INFORMATIVE,
      description:
        "CONDIZIONI DI SUCCESSO: l'indirizzo IP fa riferimento a un datacenter localizzato su territorio europeo; MODALITÀ DI VERIFICA: verifica che la localizzazione dell'IP rientri all'interno di uno dei confini degli stati membri dell'UE; RIFERIMENTI TECNICI E NORMATIVI: GDPR",
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
