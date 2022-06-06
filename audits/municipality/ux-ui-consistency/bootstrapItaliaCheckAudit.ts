"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-ux-ui-consistency-bootstrap-italia-check",
      title: "Libreria bootstrap italia",
      failureTitle:
        "Non è presente la libreria bootstap italia o la versione è obsoleta (richiesta >= 4.*.* o >= 1.6.2)",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "Test per verificare la presenza della libreria bootstrap italia",
      requiredArtifacts: ["bootstrapItaliaCheck"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & {
      bootstrapItaliaCheck: string;
      bootstrapItaliaWPCheck: string;
    }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const bootstrapItaliaVariableVersion = artifacts.bootstrapItaliaCheck;

    const headings = [
      { key: "library_name", itemType: "text", text: "Nome libreria in uso" },
      {
        key: "library_version",
        itemType: "text",
        text: "Versione libreria in uso",
      },
      {
        key: "library_required_version",
        itemType: "text",
        text: "Versione libreria richiesta",
      },
    ];
    const items = [];
    let score = 0;

    if (bootstrapItaliaVariableVersion != null) {
      const splittedVersion = bootstrapItaliaVariableVersion.split(".");
      const majorVersion = splittedVersion[0];
      const middleVersion = splittedVersion[1];

      if (parseInt(majorVersion) >= 1 && parseInt(middleVersion) >= 6) {
        score = 1;
      }

      items.push({
        library_name: "bootstrap-italia",
        library_version: bootstrapItaliaVariableVersion,
        library_required_version: ">= 1.6.*",
      });
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;