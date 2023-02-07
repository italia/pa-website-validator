"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { auditDictionary } from "../../storage/auditDictionary";
import {
  getRandomFirstLevelPagesUrl,
  getRandomSecondLevelPagesUrl,
  checkFeedbackComponent,
} from "../../utils/municipality/utils";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";

const Audit = lighthouse.Audit;

const auditId = "municipality-feedback-element";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

class LoadAudit extends lighthouse.Audit {
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

    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato totale",
        subItemsHeading: { key: "inspected_page", itemType: "url" },
      },
      {
        key: "title_errors_found",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "errors_found", itemType: "text" },
      },
    ];

    const correctItems = [];
    const wrongItems = [];

    let score = 1;

    const pagesToBeAnalyzed = [
      url,
      ...(await getRandomFirstLevelPagesUrl(
        url,
        auditVariables.numberOfFirstLevelPageToBeScanned
      )),
      ...(await getRandomSecondLevelPagesUrl(
        url,
        auditVariables.numberOfSecondLevelPageToBeScanned
      )),
    ];

    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      const item = {
        inspected_page: pageToBeAnalyzed,
        errors_found: "",
      };
      const feedbackComponentErrorsFound = await checkFeedbackComponent(
        pageToBeAnalyzed
      );

      if (feedbackComponentErrorsFound.length !== 0) {
        score = 0;
        item.errors_found = feedbackComponentErrorsFound.join("; ");
        wrongItems.push(item);
        continue;
      }
      correctItems.push(item);
    }

    const results = [];
    switch (score) {
      case 1:
        results.push({
          result: auditData.greenResult,
        });
        break;
      case 0:
        results.push({
          result: auditData.redResult,
        });
        break;
    }

    results.push({});

    if (wrongItems.length > 0) {
      results.push({
        result: auditData.subItem.redResult,
        title_errors_found: "Errori trovati nel componente",
      });

      for (const item of wrongItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }
    }

    if (correctItems.length > 0) {
      results.push({
        result: auditData.subItem.greenResult,
        title_errors_found: "Errori trovati nel componente",
      });

      for (const item of correctItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
    };
  }
}

module.exports = LoadAudit;
