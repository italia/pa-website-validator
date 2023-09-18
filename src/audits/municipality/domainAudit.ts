"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { domains } from "../../storage/municipality/allowedDomains";
import { auditDictionary } from "../../storage/auditDictionary";
import { urlExists } from "../../utils/utils";
import {
  getPrimaryPageUrl,
  getRandomFirstLevelPagesUrl,
  getRandomSecondLevelPagesUrl,
  getRandomThirdLevelPagesUrl,
} from "../../utils/municipality/utils";
import { primaryMenuItems } from "../../storage/municipality/menuItems";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";

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

    const randomFirstLevelPagesUrl = await getRandomFirstLevelPagesUrl(
      url,
      auditVariables.numberOfFirstLevelPageToBeScanned
    );

    const randomSecondLevelPagesUrl = await getRandomSecondLevelPagesUrl(
      url,
      auditVariables.numberOfSecondLevelPageToBeScanned
    );

    const randomServicesUrl = await getRandomThirdLevelPagesUrl(
      url,
      await getPrimaryPageUrl(url, primaryMenuItems.services.data_element),
      `[data-element="${primaryMenuItems.services.third_item_data_element}"]`,
      auditVariables.numberOfServicesToBeScanned
    );

    if (
      randomFirstLevelPagesUrl.length === 0 ||
      randomSecondLevelPagesUrl.length === 0 ||
      randomServicesUrl.length === 0
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
      ...randomSecondLevelPagesUrl,
      ...randomServicesUrl,
    ];

    const personalAreaLoginPage = await getPrimaryPageUrl(
      url,
      "personal-area-login"
    );
    if (personalAreaLoginPage !== "") {
      pagesToBeAnalyzed.push(personalAreaLoginPage);
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
