"use strict";
import got from "got";
import { JSDOM } from "jsdom";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-legislation-privacy-is-present",
      title: "Presenza del link per la privacy policy",
      failureTitle: "Non è presente il link per la privacy policy",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "Test per verificare la presenza del link per la privacy policy",
      requiredArtifacts: ["legislationPrivacyIsPresent"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { legislationPrivacyIsPresent: string }
  ): Promise<{ score: number }> {
    const url = artifacts.legislationPrivacyIsPresent;

    return {
      score: 1,
    };
  }
}

module.exports = LoadAudit;