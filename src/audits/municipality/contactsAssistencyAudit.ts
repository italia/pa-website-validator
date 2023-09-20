"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { getPageElementDataAttribute, loadPageData } from "../../utils/utils";
import { getPages } from "../../utils/municipality/utils";
import { CheerioAPI } from "cheerio";
import { auditDictionary } from "../../storage/auditDictionary";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";
import {
  errorHandling,
  notExecutedErrorMessage,
} from "../../config/commonAuditsParts";
import { DataElementError } from "../../utils/DataElementError";

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
  ): Promise<LH.Audit.ProductBase> {
    const url = artifacts.origin;

    const titleSubHeadings = [
      "La voce è presente nell'indice",
      "Il componente è presente in pagina",
    ];
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
      {
        key: "title_in_index",
        itemType: "text",
        text: "",
        subItemsHeading: {
          key: "in_index",
          itemType: "text",
        },
      },
      {
        key: "title_component_exists",
        itemType: "text",
        text: "",
        subItemsHeading: {
          key: "component_exists",
          itemType: "text",
        },
      },
    ];

    let pagesToBeAnalyzed = [];
    try {
      pagesToBeAnalyzed = await getPages(url, [
        {
          type: "services",
          numberOfPages: auditVariables.numberOfServicesToBeScanned,
        },
      ]);
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

    const pagesInError = [];
    let $: CheerioAPI = await loadPageData(url);
    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      try {
        $ = await loadPageData(pageToBeAnalyzed);
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
          in_index: errorMessage,
        });
        continue;
      }

      const item = {
        inspected_page: pageToBeAnalyzed,
        in_index: "No",
        component_exists: "No",
      };

      const indexList = await getPageElementDataAttribute(
        $,
        '[data-element="page-index"]',
        "> li > a"
      );

      if (indexList.includes("Contatti")) {
        item.in_index = "Sì";
      }

      const contactComponent = $('[data-element="service-area"]');

      if (contactComponent.length > 0) {
        item.component_exists = "Sì";
      }

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
    if (pagesInError.length > 0) {
      results.push({
        result: errorHandling.errorMessage,
      });

      results.push({});

      results.push({
        result: errorHandling.errorColumnTitles[0],
        title_in_index: errorHandling.errorColumnTitles[1],
        title_component_exists: "",
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
        title_in_index: titleSubHeadings[0],
        title_component_exists: titleSubHeadings[1],
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
        title_in_index: titleSubHeadings[0],
        title_component_exists: titleSubHeadings[1],
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
