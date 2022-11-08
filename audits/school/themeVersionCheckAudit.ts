"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import * as https from "https";
import * as http from "http";
import semver from "semver";
import { CheerioAPI } from "cheerio";
import {
  buildUrl,
  getCmsVersion,
  hostnameExists,
  isInternalUrl,
  loadPageData,
} from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";

const textDomain = "Text Domain: design_scuole_italia";
const Audit = lighthouse.Audit;

const auditId = "school-ux-ui-consistency-theme-version-check";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const yellowResult = auditData.yellowResult;
const redResult = auditData.redResult;
const notExecuted = auditData.nonExecuted;

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
        text: "Nome del CMS in uso",
      },
      {
        key: "theme_version",
        itemType: "text",
        text: "Versione del tema CMS in uso",
      },
      {
        key: "checked_element",
        itemType: "text",
        text: "Elemento controllato",
      },
    ];

    const items = [
      {
        result: yellowResult,
        cms_name: "",
        theme_version: "",
        checked_element: "",
      },
    ];

    const $: CheerioAPI = await loadPageData(url);
    const linkTags = $("link");

    let styleCSSurl = "";
    for (const linkTag of linkTags) {
      if (!linkTag.attribs || !("href" in linkTag.attribs)) {
        continue;
      }

      let styleFound = false;
      const styleParts = linkTag.attribs.href.split("/");
      for (const stylePart of styleParts) {
        if (stylePart.includes("style.css")) {
          const filenameParts = stylePart.split("?");
          if (filenameParts[0] === "style.css") {
            styleFound = true;
          }
        }
      }

      if (styleFound) {
        styleCSSurl = linkTag.attribs.href;
        if ((await isInternalUrl(styleCSSurl)) && !styleCSSurl.includes(url)) {
          styleCSSurl = await buildUrl(url, styleCSSurl);
        }

        let CSS = "";
        try {
          CSS = await getCSShttps(styleCSSurl);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (ex: any) {
          try {
            CSS = await getCSShttp(styleCSSurl);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (ex: any) {
            return {
              score: 0,
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
        }

        items[0].checked_element = styleCSSurl;

        if (!CSS.includes(textDomain)) {
          score = 0.5;
          items[0].result = yellowResult;

          break;
        }

        score = 0;
        items[0].result = redResult;

        try {
          const { name, version } = getCmsVersion(CSS);
          items[0].cms_name = name;
          items[0].theme_version = version;

          if (semver.gte(version, "2.0.0")) {
            score = 1;
            items[0].result = greenResult;

            break;
          }
        } catch (e) {
          break;
        }
      }
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;

async function getCSShttps(hostname: string): Promise<string> {
  const hostnameInfo = await hostnameExists(hostname);
  if (!hostnameInfo.exists) {
    return "";
  }

  return new Promise(function (resolve) {
    https
      .request(hostname, function (res) {
        let data = "";
        res.on("data", function (chunk) {
          data += chunk;
        });

        res.on("end", function () {
          resolve(data);
        });
      })
      .end();
  });
}

async function getCSShttp(hostname: string): Promise<string> {
  const hostnameInfo = await hostnameExists(hostname);
  if (!hostnameInfo.exists) {
    return "";
  }

  return new Promise(function (resolve) {
    http
      .request(hostname, function (res) {
        let data = "";
        res.on("data", function (chunk) {
          data += chunk;
        });

        res.on("end", function () {
          resolve(data);
        });
      })
      .end();
  });
}
