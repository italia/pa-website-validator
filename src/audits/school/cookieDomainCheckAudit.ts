"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  getRandomFirstLevelPagesUrl,
  getRandomSecondLevelPagesUrl,
  getRandomServicesUrl,
  getRandomLocationsUrl,
} from "../../utils/school/utils";
import crawlerTypes from "../../types/crawler-types";
import cookie = crawlerTypes.cookie;
import { auditDictionary } from "../../storage/auditDictionary";
import { run as cookieAudit } from "../../utils/cookieAuditLogic";
import { auditScanVariables } from "../../storage/school/auditScanVariables";

const Audit = lighthouse.Audit;

const auditId = "school-legislation-cookie-domain-check";
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
      failureTitle: auditData.title,
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description: auditData.description,
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(artifacts: LH.Artifacts & { origin: string }) {
    const url = artifacts.origin;
    const titleSubHeadings = [
      "Dominio del cookie",
      "Nome del cookie",
      "Valore del cookie",
    ];
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato totale",
        subItemsHeading: { key: "inspected_page", itemType: "url" },
      },
      {
        key: "title_cookie_domain",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "cookie_domain", itemType: "text" },
      },
      {
        key: "title_cookie_name",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "cookie_name", itemType: "text" },
      },
      {
        key: "title_cookie_value",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "cookie_value", itemType: "text" },
      },
    ];

    const randomFirstLevelPagesUrl = await getRandomFirstLevelPagesUrl(
      url,
      auditVariables.numberOfFirstLevelPageToBeScanned
    );

    const randomSecondLevelPageUrl = await getRandomSecondLevelPagesUrl(
      url,
      auditVariables.numberOfSecondLevelPageToBeScanned
    );

    const randomServiceUrl = await getRandomServicesUrl(
      url,
      auditVariables.numberOfServicesToBeScanned
    );

    const randomLocationsUrl = await getRandomLocationsUrl(
      url,
      auditVariables.numberOfLocationsToBeScanned
    );

    if (
      randomFirstLevelPagesUrl.length === 0 ||
      randomSecondLevelPageUrl.length === 0 ||
      randomServiceUrl.length === 0
    ) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: auditData.nonExecuted,
            },
          ]
        ),
      };
    }

    const pagesToBeAnalyzed = [
      url,
      ...randomFirstLevelPagesUrl,
      ...randomSecondLevelPageUrl,
      ...randomServiceUrl,
      ...randomLocationsUrl,
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

    const correctItems = [];
    const wrongItems = [];

    for (const item of items) {
      if (item.is_correct) {
        correctItems.push(item);
      } else {
        wrongItems.push(item);
      }
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
        title_cookie_domain: titleSubHeadings[0],
        title_cookie_name: titleSubHeadings[1],
        title_cookie_value: titleSubHeadings[2],
      });

      for (const item of wrongItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    if (correctItems.length > 0) {
      results.push({
        result: auditData.subItem.greenResult,
        title_cookie_domain: titleSubHeadings[0],
        title_cookie_name: titleSubHeadings[1],
        title_cookie_value: titleSubHeadings[2],
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
