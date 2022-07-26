"use strict";

import { run as securityAudit } from "../../utils/securityAuditLogic";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
const Audit = lighthouse.Audit;

const auditId = "municipality-security"
import { auditDictionary } from "../../storage/auditDictionary"
const auditData = auditDictionary[auditId]

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
    const origin = artifacts.origin;

    return await securityAudit(origin, auditData);
  }
}

module.exports = LoadAudit;
