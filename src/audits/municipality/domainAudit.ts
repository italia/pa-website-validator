"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { domains } from "../../storage/municipality/allowedDomains";
import { auditDictionary } from "../../storage/auditDictionary";
import { urlExists } from "../../utils/utils";
import { getPages, getSecondLevelPages } from "../../utils/municipality/utils";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";
import { DataElementError } from "../../utils/DataElementError";
import { notExecutedErrorMessage } from "../../config/commonAuditsParts";
import { primaryMenuItems } from "../../storage/municipality/menuItems";

const Audit = lighthouse.Audit;

const auditId = "municipality-domain";
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

    const titleSubHeadings = [
      "Dominio utilizzato",
      'Viene usato il sottodominio "comune." seguito da un dominio istituzionale riservato',
      'Sito raggiungibile senza "www."',
    ];
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
        subItemsHeading: { key: "inspected_page", itemType: "url" },
      },
      {
        key: "title_domain",
        itemType: "text",
        text: "",
        subItemsHeading: {
          key: "domain",
          itemType: "text",
        },
      },
      {
        key: "title_correct_domain",
        itemType: "text",
        text: "",
        subItemsHeading: {
          key: "correct_domain",
          itemType: "text",
        },
      },
      {
        key: "title_www_access",
        itemType: "text",
        text: "",
        subItemsHeading: {
          key: "www_access",
          itemType: "text",
        },
      },
    ];

    let pagesToBeAnalyzed = [];
    try {
      pagesToBeAnalyzed = [
        url,
        ...(await getPages(
          url,
          [
            {
              type: "first_level_pages",
              numberOfPages: auditVariables.numberOfFirstLevelPageToBeScanned,
            },
            {
              type: "services",
              numberOfPages: auditVariables.numberOfServicesToBeScanned,
            },
            {
              type: "events",
              numberOfPages: auditVariables.numberOfEventsToBeScanned,
            },
            {
              type: "booking_appointment",
              numberOfPages: 1,
            },
            {
              type: "personal_area_login",
              numberOfPages: 1,
            },
          ],
          false
        )),
      ];

      const secondLevelPages = await getSecondLevelPages(url, false);
      for (const [key, primaryMenuItem] of Object.entries(primaryMenuItems)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const secondLevelPagesSection = secondLevelPages[key];
        for (const page of secondLevelPagesSection) {
          if (
            primaryMenuItem.dictionary.includes(page.linkName.toLowerCase())
          ) {
            pagesToBeAnalyzed.push(page.linkUrl);
          }
        }
      }
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
              result: notExecutedErrorMessage.replace("<LIST>", ex.message),
            },
          ]
        ),
      };
    }

    const correctItems = [];
    const wrongItems = [];

    let score = 1;

    const originHostname = new URL(url).hostname.replace("www.", "");
    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      const hostname = new URL(pageToBeAnalyzed).hostname.replace("www.", "");
      const item = {
        inspected_page: pageToBeAnalyzed,
        domain: hostname,
        correct_domain: "No",
        www_access: "",
      };

      let correctDomain = false;
      for (const domain of domains) {
        if (
          hostname === "comune." + domain ||
          (hostname != originHostname && hostname.endsWith(".comune." + domain))
        ) {
          correctDomain = true;
          item.correct_domain = "Sì";
          break;
        }
      }

      const wwwAccess = (
        await urlExists(url, pageToBeAnalyzed.replace("www.", ""))
      ).result;

      item.www_access = wwwAccess ? "Sì" : "No";

      if (correctDomain && wwwAccess) {
        correctItems.push(item);
        continue;
      }
      wrongItems.push(item);
      score = 0;
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
        title_domain: titleSubHeadings[0],
        title_correct_domain: titleSubHeadings[1],
        title_www_access: titleSubHeadings[2],
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
        title_domain: titleSubHeadings[0],
        title_correct_domain: titleSubHeadings[1],
        title_www_access: titleSubHeadings[2],
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
