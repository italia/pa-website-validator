"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { CheerioAPI } from "cheerio";
import { loadPageData, urlExists } from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";
import isEmail from "validator/lib/isEmail";

const Audit = lighthouse.Audit;

const auditId = "municipality-inefficiency-report";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const yellowResult = auditData.yellowResult;
const redResult = auditData.redResult;

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
        key: "link_name",
        itemType: "text",
        text: "Testo del link",
      },
      {
        key: "link_destination",
        itemType: "text",
        text: "Pagina di destinazione",
      },
      {
        key: "existing_page",
        itemType: "text",
        text: "Pagina esistente",
      },
    ];

    const items = [
      {
        result: redResult,
        link_name: "",
        link_destination: "",
        existing_page: "No",
      },
    ];

    const $: CheerioAPI = await loadPageData(url);
    const reportInefficiencyElement = $("footer").find(
      '[data-element="report-inefficiency"]'
    );
    const elementObj = $(reportInefficiencyElement).attr();

    const label = reportInefficiencyElement.text().trim().toLowerCase() ?? "";
    items[0].link_name = label;
    items[0].link_destination = elementObj?.href ?? "";

    if (
      elementObj &&
      "href" in elementObj &&
      elementObj.href !== "#" &&
      elementObj.href !== ""
    ) {
      if (isMailto(elementObj.href)) {
        items[0].link_destination = elementObj.href;
        items[0].existing_page = "N/A";
      } else {
        const checkUrl = await urlExists(url, elementObj.href);
        items[0].link_destination = checkUrl.inspectedUrl;

        if (!checkUrl.result) {
          return {
            score: 0,
            details: Audit.makeTableDetails(headings, items),
          };
        }

        items[0].existing_page = "Sì";
      }

      if (
        label !== "disservizio" &&
        label !== "segnala disservizio" &&
        label !== "segnalazione disservizio"
      ) {
        items[0].result = yellowResult;
        return {
          score: 0.5,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      items[0].result = greenResult;
      score = 1;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

const isMailto = (str: string) => {
  if (!str.startsWith("mailto:")) return false;
  const end = str.indexOf("?");
  const emails = str.slice(7, end >= 0 ? end : undefined);
  return emails.split(",").every((e) => isEmail(e));
};

module.exports = LoadAudit;
