"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import semver from "semver";
import { CheerioAPI } from "cheerio";
import {
  buildUrl,
  cmsThemeRx,
  isInternalUrl,
  loadPageData,
} from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";
import axios from "axios";

const Audit = lighthouse.Audit;

const auditId = "municipality-ux-ui-consistency-theme-version-check";
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

    let score = 0.5;
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
      },
      {
        key: "cms_name",
        itemType: "text",
        text: "Tema CMS del modello in uso",
      },
      {
        key: "theme_version",
        itemType: "text",
        text: "Versione del tema CMS in uso",
      },
    ];

    const items = [
      {
        result: auditData.yellowResult,
        cms_name: "Nessuno",
        theme_version: "N/A",
      },
    ];

    const $: CheerioAPI = await loadPageData(url);
    const linkTags = $("link");

    let styleCSSUrl = "";
    for (const linkTag of linkTags) {
      if (!linkTag.attribs || !("href" in linkTag.attribs)) {
        continue;
      }

      if (linkTag.attribs.href.includes(".css")) {
        styleCSSUrl = linkTag.attribs.href;
        if ((await isInternalUrl(styleCSSUrl)) && !styleCSSUrl.includes(url)) {
          styleCSSUrl = await buildUrl(url, styleCSSUrl);
        }

        let CSScontent = "";
        try {
          const response = await axios.get(styleCSSUrl);
          CSScontent = response.data;
        } catch (e) {
          CSScontent = "";
        }

        const match = CSScontent.match(cmsThemeRx);

        if (match === null || !match.groups) {
          continue;
        }

        items[0].cms_name = match.groups.name;
        const version = match.groups.version;
        items[0].theme_version = version;

        score = 0;
        items[0].result = auditData.redResult;

        if (semver.gte(version, "1.0.0")) {
          score = 1;
          items[0].result = auditData.greenResult;
        }
        break;
      }
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
