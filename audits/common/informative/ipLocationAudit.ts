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
