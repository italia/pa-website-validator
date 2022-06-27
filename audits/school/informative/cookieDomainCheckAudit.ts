"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-informative-cookie-domain-check",
      title:
        "C.SC.2.3 - COOKIE - Il sito scuola deve presentare cookie tecnici in linea con la normativa vigente.",
      failureTitle:
        "C.SC.2.3 - COOKIE - Il sito scuola deve presentare cookie tecnici in linea con la normativa vigente.",
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
