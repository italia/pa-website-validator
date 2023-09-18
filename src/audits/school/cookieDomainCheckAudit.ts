"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { getPages } from "../../utils/school/utils";
import crawlerTypes from "../../types/crawler-types";
import cookie = crawlerTypes.cookie;
import { auditDictionary } from "../../storage/auditDictionary";
import { run as cookieAudit } from "../../utils/cookieAuditLogic";
import { auditScanVariables } from "../../storage/school/auditScanVariables";
import { errorHandling } from "../../config/commonAuditsParts";
import { DataElementError } from "../../utils/DataElementError";

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

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<LH.Audit.ProductBase> {
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

    let score = 1;

    let pagesToBeAnalyzed = [];
    try {
      pagesToBeAnalyzed = [
        url,
        ...(await getPages(url, [
          {
            type: "first_level_pages",
            numberOfPages: auditVariables.numberOfFirstLevelPageToBeScanned,
          },
          {
            type: "second_level_pages",
            numberOfPages: auditVariables.numberOfSecondLevelPageToBeScanned,
          },
          {
            type: "services",
            numberOfPages: auditVariables.numberOfServicesToBeScanned,
          },
          {
            type: "locations",
            numberOfPages: auditVariables.numberOfLocationsToBeScanned,
          },
        ])),
      ];
    } catch (ex) {
      if (!(ex instanceof DataElementError)) {
        throw ex;
      }

      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: auditData.nonExecuted + ex.message,
            },
          ]
        ),
      };
    }

    let items: cookie[] = [];

    const pagesInError = [];
    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      let pageResult = {
        score: 0,
        items: items,
      };
      try {
        pageResult = await cookieAudit(pageToBeAnalyzed);
      } catch (ex) {
        if (!(ex instanceof Error)) {
          throw ex;
        }

        let errorMessage = ex.message;
        errorMessage = errorMessage.substring(
          errorMessage.indexOf('"') + 1,
          errorMessage.lastIndexOf('"')
        );

        pagesInError.push({
          inspected_page: pageToBeAnalyzed,
          cookie_domain: errorMessage,
        });
        continue;
      }

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
    if (pagesInError.length > 0) {
      results.push({
        result: errorHandling.errorMessage,
      });

      results.push({});

      results.push({
        result: errorHandling.errorColumnTitles[0],
        title_cookie_domain: errorHandling.errorColumnTitles[1],
        title_cookie_name: "",
        title_cookie_value: "",
      });

      for (const item of pagesInError) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }
    } else {
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
      errorMessage: pagesInError.length > 0 ? errorHandling.popupMessage : "",
    };
  }
}

module.exports = LoadAudit;
