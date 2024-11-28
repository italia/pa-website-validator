"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { CheerioAPI } from "cheerio";
import { loadPageData, urlExists } from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

const auditId = "municipality-legislation-privacy-is-present";
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
        itemType: "url",
        text: "Pagina di destinazione del link",
      },
      {
        key: "existing_page",
        itemType: "text",
        text: "Pagina esistente",
      },
      {
        key: "secure_page",
        itemType: "text",
        text: "Pagina sicura",
      },
    ];

    const items = [
      {
        result: auditData.redResult,
        link_name: "",
        link_destination: "",
        existing_page: "No",
        secure_page: "No",
      },
    ];

    const $: CheerioAPI = await loadPageData(url);
    const privacyPolicyElement = $("footer").find(
      '[data-element="privacy-policy-link"]'
    );
    const elementObj = $(privacyPolicyElement).attr();
    items[0].link_name = privacyPolicyElement.text().trim() ?? "";
    items[0].link_destination = elementObj?.href ?? "";

    if (
      elementObj &&
      "href" in elementObj &&
      elementObj.href !== "#" &&
      elementObj.href !== ""
    ) {
      const checkUrlHttps = await urlExists(url, elementObj.href, true);

      items[0].link_destination = checkUrlHttps.inspectedUrl;

      if (checkUrlHttps.result) {
        items[0].result = auditData.greenResult;
        items[0].existing_page = "Sì";
        items[0].secure_page = "Sì";
        score = 1;
      }
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
