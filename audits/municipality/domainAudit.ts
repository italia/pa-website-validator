"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
const Audit = lighthouse.Audit;

import { domains } from "../../storage/municipality/allowedDomains";

const auditId = "municipality-domain"
import { auditDictionary } from "../../storage/auditDictionary"
const auditData = auditDictionary[auditId]

const greenResult = auditData.greenResult
const redResult = auditData.redResult

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

    let score = 0;

    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
      },
      {
        key: "domain",
        itemType: "text",
        text: "Dominio utilizzato",
      },
    ];

    const hostname = new URL(url).hostname.replace("www.", "");

    const items = [
      {
        result: redResult,
        domain: hostname,
      },
    ];

    let correctDomain = false;
    for (const domain of domains) {
      if (hostname.includes(domain)) {
        correctDomain = true;
        break;
      }
    }

    if (correctDomain) {
      score = 1;
      items[0].result = greenResult;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
