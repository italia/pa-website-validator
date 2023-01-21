"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { auditDictionary } from "../../storage/auditDictionary";
import { run as cookieAudit } from "../../utils/cookieAuditLogic";
import crawlerTypes from "../../types/crawler-types";
import cookie = crawlerTypes.cookie;
import {
  getRandomMunicipalityFirstLevelPagesUrl,
  getRandomMunicipalitySecondLevelPagesUrl,
  getRandomMunicipalityServicesUrl,
} from "../../utils/utils";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";

const Audit = lighthouse.Audit;

const auditId = "municipality-legislation-cookie-domain-check";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

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
    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      { key: "inspected_page", itemType: "text", text: "Pagina ispezionata" },
      { key: "cookie_domain", itemType: "text", text: "Dominio del Cookie" },
      { key: "cookie_name", itemType: "text", text: "Nome del Cookie" },
      { key: "cookie_value", itemType: "text", text: "Valore del Cookie" },
    ];

    const pagesToBeAnalyzed = [
      url,
      ...(await getRandomMunicipalityFirstLevelPagesUrl(
        url,
        auditVariables.numberOfFirstLevelPageToBeScanned
      )),
      ...(await getRandomMunicipalitySecondLevelPagesUrl(
        url,
        auditVariables.numberOfSecondLevelPageToBeScanned
      )),
      ...(await getRandomMunicipalityServicesUrl(
        url,
        auditVariables.numberOfServicesToBeScanned
      )),
    ];

    let score = 1;
    let items: cookie[] = [];

    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      const pageResult = await cookieAudit(pageToBeAnalyzed);
      if (pageResult.score < score) {
        score = pageResult.score;
      }

      items = [...items, ...pageResult.items];
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

    for (const item of items) {
      results.push({
        subItems: {
          type: "subitems",
          items: [item],
        },
      });
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
    };
  }
}

module.exports = LoadAudit;
