"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  getPageElementDataAttribute,
  getRandomMunicipalityServiceUrl,
  loadPageData,
} from "../../utils/utils";
import { CheerioAPI } from "cheerio";

const Audit = lighthouse.Audit;

const auditId = "municipality-contacts-assistency"
import { auditDictionary } from "../../storage/auditDictionary"
const auditData = auditDictionary[auditId]

const greenResult = auditData.greenResult
const redResult = auditData.redResult
const notExecuted = auditData.nonExecuted

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
    let score = 0;

    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
      },
      {
        key: "inspected_page",
        itemType: "text",
        text: "Pagina ispezionata",
      },
    ];

    const item = [
      {
        result: redResult,
        link_name: "",
        link_destination: "",
        inspected_page: "",
      },
    ];

    const randomServiceToBeScanned: string =
      await getRandomMunicipalityServiceUrl(url);

    if (!randomServiceToBeScanned) {
      return {
        score: score,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: notExecuted,
            },
          ]
        ),
      };
    }

    item[0].inspected_page = randomServiceToBeScanned;

    const $: CheerioAPI = await loadPageData(randomServiceToBeScanned);

    const indexList = await getPageElementDataAttribute(
      $,
      '[data-element="page-index"]',
      "> li > a"
    );

    let contactsPresent = false;
    if (indexList.includes("Contatti")) {
      contactsPresent = true;
    }

    if (contactsPresent) {
      item[0].result = greenResult;
      score = 1;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;
