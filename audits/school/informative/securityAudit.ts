"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-informative-security",
      title:
        "C.SC.3.1 - CERTIFICATO HTTPS - Il sito della scuola deve avere un certificato https valido e attivo.",
      failureTitle:
        "C.SC.3.1 - CERTIFICATO HTTPS - Il sito della scuola deve avere un certificato https valido e attivo.",
      scoreDisplayMode: Audit.SCORING_MODES.INFORMATIVE,
      description:
        "Questo audit produce un risultato solo quando viene effettuato su un sito pubblicato online.",
      requiredArtifacts: [],
    };
  }

  static async audit(): Promise<{ score: number }> {
    return {
      score: 1,
    };
  }
}

module.exports = LoadAudit;
