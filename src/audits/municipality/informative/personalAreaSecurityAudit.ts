"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { auditDictionary } from "../../../storage/auditDictionary";

const Audit = lighthouse.Audit;

const auditId = "municipality-informative-personal-area-security";
const auditData = auditDictionary[auditId];

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.INFORMATIVE,
      requiredArtifacts: [],
    };
  }

  static async audit(): Promise<{
    score: number;
    details: LH.Audit.Details.Table;
  }> {
    return {
      score: 1,
      details: Audit.makeTableDetails(
        [
          {
            key: "result",
            itemType: "text",
            text: "Risultato",
          },
        ],
        [
          {
            result:
              "Questo audit produce un risultato solo quando viene effettuato su un sito pubblicato online.",
          },
        ]
      ),
    };
  }
}

module.exports = LoadAudit;
