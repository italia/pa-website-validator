"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "common-security-https-is-present",
      title: "Presenza protocollo HTTPS",
      failureTitle: "Il protocollo HTTPS non è presente",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "Test per controllare che il dominio utilizzi il protocollo HTTPS",
      requiredArtifacts: ["securityHttpsIsPresent"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { securityHttpsIsPresent: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const protocol = artifacts.securityHttpsIsPresent.replace(":", "") ?? "";
    let score = 1;

    const items = [{ protocol: protocol }];

    const headings = [
      {
        key: "protocol",
        itemType: "text",
        text: "Protocollo usato dal dominio",
      },
    ];

    if (!protocol || protocol !== "https") {
      score = 0;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
