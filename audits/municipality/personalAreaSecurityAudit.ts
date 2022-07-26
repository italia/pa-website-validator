"use strict";

import { run as securityAudit } from "../../utils/securityAuditLogic";

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
const Audit = lighthouse.Audit;

const auditId = "municipality-personal-area-security"
import { auditDictionary } from "../../storage/auditDictionary"
const auditData = auditDictionary[auditId]

const notExecuted = auditData.nonExecuted

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
    const origin = artifacts.origin;

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      { key: "inspected_url", itemType: "text", text: "URL ispezionato" },
    ];
    const item = [{ result: notExecuted }, { inspected_url: "" }];

    const $: CheerioAPI = await loadPageData(origin);
    const loginAreaElement = $('[data-element="personal-area-login"]');
    const elementObj = $(loginAreaElement).attr();

    if (
      !elementObj ||
      !("href" in elementObj) ||
      elementObj.href === "#" ||
      elementObj.href === ""
    ) {
      let urlInfo = {
        result: false,
        reason: "",
        inspectedUrl: "",
      };

      if (
        elementObj &&
        "href" in elementObj &&
        elementObj.href &&
        elementObj.href !== "#" &&
        elementObj.href !== ""
      ) {
        urlInfo = await urlExists(origin, elementObj.href);
        if (!urlInfo.result) {
          item[0].result += urlInfo.reason;
        }

        item[0].inspected_url = urlInfo.inspectedUrl;
      }

      return {
        score: 0,
        details: Audit.makeTableDetails(headings, item),
      };
    } else {
      let inspectUrl = elementObj.href;

      if (
        (await isInternalUrl(elementObj.href)) &&
        !elementObj.href.includes(origin)
      ) {
        inspectUrl = await buildUrl(origin, elementObj.href);
      }

      return await securityAudit(inspectUrl, auditData);
    }
  }
}

module.exports = LoadAudit;
