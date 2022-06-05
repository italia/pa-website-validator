"use strict";
// @ts-ignore
import lighthouse from "lighthouse";
import { domains } from "../../../storage/municipality/allowedDomains";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-security-domain-name-check",
      title: "Nome del dominio",
      failureTitle:
        "Il dominio non rispetta le regole del dominio istituzionale",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "Test per controllare se il dominio rispetti le regole del dominio istituzionale",
      requiredArtifacts: ["securityDomainNameCheck"],
    };
  }

  static async audit(
    artifacts: any
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const hostname = artifacts.securityDomainNameCheck;

    let score = 0;
    const headings = [
      { key: "domain_name", itemType: "text", text: "Dominio corrente" },
    ];

    for (const domain of domains) {
      if (hostname.includes(domain)) {
        score = 1;
        break;
      }
    }

    const items = [{ domain_name: hostname }];

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
