"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { getPageElementDataAttribute, loadPageData } from "../../utils/utils";
import {
  getRandomThirdLevelPagesUrl,
  getPrimaryPageUrl,
} from "../../utils/municipality/utils";
import { CheerioAPI } from "cheerio";
import { auditDictionary } from "../../storage/auditDictionary";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";
import { primaryMenuItems } from "../../storage/municipality/menuItems";

const auditId = "municipality-contacts-assistency";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

    const titleSubHeadings = ["Il componente è presente"];
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
        subItemsHeading: {
          key: "inspected_page",
          itemType: "url",
        },
      },
    ];

    const randomServices: string[] = await getRandomThirdLevelPagesUrl(
      url,
      await getPrimaryPageUrl(url, primaryMenuItems.services.data_element),
      `[data-element="${primaryMenuItems.services.third_item_data_element}"]`,
      auditVariables.numberOfServicesToBeScanned
    );

    if (randomServices.length === 0) {
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

    const correctItems = [];
    const wrongItems = [];

    let score = 1;

    for (const randomService of randomServices) {
      const item = {
        inspected_page: randomService,
      };

      const $: CheerioAPI = await loadPageData(randomService);

      const indexList = await getPageElementDataAttribute(
        $,
        '[data-element="page-index"]',
        "> li > a"
      );

      const contactComponent = $('[data-element="service-area"]');

      let contactsPresent = false;
      if (indexList.includes("Contatti") && contactComponent.length > 0) {
        contactsPresent = true;
      }

      if (!contactsPresent) {
        score = 0;
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
        title_component_exists: titleSubHeadings[0],
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
        title_component_exists: titleSubHeadings[0],
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
