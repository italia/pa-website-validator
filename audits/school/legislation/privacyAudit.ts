"use strict";
// @ts-ignore
import lighthouse from "lighthouse";
import got from "got";
import { JSDOM } from "jsdom";
import { allowedNames } from "../../../storage/common/allowedPrivacyPolicyWords";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-legislation-privacy-is-present",
      title: "Presenza del link per la privacy policy",
      failureTitle: "Non è presente il link per la privacy policy",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "Test per verificare la presenza del link per la privacy policy",
      requiredArtifacts: ["legislationPrivacyIsPresent"],
    };
  }

  static async audit(artifacts: any): Promise<{ score: number }> {
    const url = artifacts.legislationPrivacyIsPresent;
    const response = await got(url);
    const dom = new JSDOM(response.body);

    let score = 0;
    const footerLinks = dom.window.document.querySelectorAll("footer a");
    for (const a of footerLinks) {
      // @ts-ignore
      if (includesPrivacyPolicyWords(a.text.toLowerCase())) {
        score = 1;
        break;
      }
    }

    return {
      score: score,
    };
  }
}

module.exports = LoadAudit;

function includesPrivacyPolicyWords(text: string): boolean {
  for (const word of allowedNames) {
    if (text.includes(word)) {
      return true;
    }
  }

  return false;
}
