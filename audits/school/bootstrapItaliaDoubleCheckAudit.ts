"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import semver from "semver";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

const auditId = "school-ux-ui-consistency-bootstrap-italia-double-check";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const redResult = auditData.redResult;

const libraryName = "Bootstrap italia";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      requiredArtifacts: [
        "bootstrapItaliaSelectorCheck",
        "bootstrapItaliaCheck",
      ],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & {
      bootstrapItaliaCheck: string;
      bootstrapItaliaSelectorCheck: string;
    }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const bootstrapItaliaVariableVersion =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      artifacts.bootstrapItaliaCheck?.toString().trim().replaceAll('"', "") ??
      "";
    const bootstrapItaliaSelectorVariableVersion =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      artifacts.bootstrapItaliaSelectorCheck
        ?.toString()
        .trim()
        .replaceAll('"', "") ?? "";

    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
      },
      {
        key: "library_name",
        itemType: "text",
        text: "Nome libreria in uso",
      },
      {
        key: "library_version",
        itemType: "text",
        text: "Versione libreria in uso",
      },
    ];
    const items = [
      {
        result: redResult,
        library_name: "",
        library_version: "",
      },
    ];
    let score = 0;

    try {
      if (
        bootstrapItaliaVariableVersion !== null &&
        bootstrapItaliaVariableVersion
      ) {
        items[0].library_version = bootstrapItaliaVariableVersion;
        items[0].library_name = libraryName;

        if (semver.gte(bootstrapItaliaVariableVersion, "1.6.0")) {
          score = 1;
          items[0].result = greenResult;
        }
      } else if (
        bootstrapItaliaSelectorVariableVersion !== null &&
        bootstrapItaliaSelectorVariableVersion
      ) {
        items[0].library_version = bootstrapItaliaSelectorVariableVersion;
        items[0].library_name = libraryName;

        if (semver.gte(bootstrapItaliaSelectorVariableVersion, "1.6.0")) {
          score = 1;
          items[0].result = greenResult;
        }
      }
    } catch (e) {
      //eslint-disable-next-line
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
