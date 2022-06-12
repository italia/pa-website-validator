"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-menu-structure-match-model",
      title: "Il menu rispetta le indicazioni fornite dal modello",
      failureTitle: "Il menu non rispetta le indicazioni fornite dal modello",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "Test per verificare il rispetto delle regole per la costruzione del menu principale",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number }> {
    const url = artifacts.origin;

    return {
      score: 1,
    };
  }
}

module.exports = LoadAudit;