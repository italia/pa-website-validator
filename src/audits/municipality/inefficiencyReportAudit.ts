"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { CheerioAPI } from "cheerio";
import {
  buildUrl,
  isInternalUrl,
  loadPageData,
  urlExists,
} from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";
import isEmail from "validator/lib/isEmail";

const Audit = lighthouse.Audit;

const auditId = "municipality-inefficiency-report";
const auditData = auditDictionary[auditId];

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
    artifacts: LH.Artifacts & { origin: string },
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
        itemType: "url",
        text: "Pagina di destinazione",
      },
      {
        key: "existing_page",
        itemType: "text",
        text: "Pagina esistente",
      },
      {
        key: "is_service",
        itemType: "text",
        text: "Viene usato il servizio dedicato",
      },
    ];

    const items = [
      {
        result: auditData.redResult,
        link_name: "",
        link_destination: "",
        existing_page: "No",
        is_service: "No",
      },
    ];

    const $: CheerioAPI = await loadPageData(url);
    const reportInefficiencyElement = $("footer").find(
      '[data-element="report-inefficiency"]',
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
        let pageUrl = elementObj.href;
        if ((await isInternalUrl(pageUrl)) && !pageUrl.includes(url)) {
          pageUrl = await buildUrl(url, pageUrl);
        }

        const checkUrl = await urlExists(url, pageUrl);
        items[0].link_destination = checkUrl.inspectedUrl;

        if (!checkUrl.result) {
          return {
            score: 0,
            details: Audit.makeTableDetails(headings, items),
          };
        }

        items[0].existing_page = "Sì";

        const parts = new URL(pageUrl).pathname.split("/");
        if (parts[1] === "servizi") {
          items[0].is_service = "Sì";
        }
      }

      if (
        label !== "disservizio" &&
        label !== "segnala disservizio" &&
        label !== "segnalazione disservizio"
      ) {
        items[0].result = auditData.yellowResult;
        return {
          score: 0.5,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      items[0].result = auditData.greenResult;
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
