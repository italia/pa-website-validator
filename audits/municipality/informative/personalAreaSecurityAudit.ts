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
        "Questo audit produce un risultato solo quando viene effettuato su un sito pubblicato online.",
      requiredArtifacts: [],
    };
  }

  static async audit(): Promise<{ score: number; }> {
    return {
      score: 1
    }
  };
}

module.exports = LoadAudit;