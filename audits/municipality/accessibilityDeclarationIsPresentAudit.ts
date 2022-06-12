"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-legislation-accessibility-declaration-is-present",
      title: "Presenza Dichiarazione di Accessibilità",
      failureTitle: "La dichiarazione di accessibilità non è presente",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "Test per controllare che il dominio presenti la Dichiarazione di Accessibilità",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & {
      origin: string;
    }
  ): Promise<{ score: number }> {
    const origin = artifacts.origin;

    return {
      score: 1,
    };
  }
}

module.exports = LoadAudit;
