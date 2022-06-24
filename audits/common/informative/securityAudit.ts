"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "common-informative-security",
      title:
        "CERTIFICATO HTTPS - Il sito scuola deve avere un certificato https valido e attivo.",
      failureTitle:
        "CERTIFICATO HTTPS - Il sito scuola deve avere un certificato https valido e attivo.",
      scoreDisplayMode: Audit.SCORING_MODES.INFORMATIVE,
      description:
        "AUDIT INFORMATIVO: L'audit effettivo produrrà un risultato quando verrà eseguito su un ambiente non locale",
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
