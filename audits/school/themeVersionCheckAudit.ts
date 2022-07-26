"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import * as https from "https";
import * as http from "http";
import { CheerioAPI } from "cheerio";
import { buildUrl, isInternalUrl, loadPageData } from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary"

const textDomain = "Text Domain: design_scuole_italia";
const Audit = lighthouse.Audit;

const auditId = "school-ux-ui-consistency-theme-version-check"
const auditData = auditDictionary[auditId]

const greenResult = auditData.greenResult
const yellowResult = auditData.yellowResult
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

    let score = 0.5;
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
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

      if (linkTag.attribs.href.includes("style.css")) {
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
        } else {
          const currentVersion = await getCurrentVersion(CSS);
          items[0].theme_version = currentVersion;
          const splittedVersion = currentVersion.split(".");

          if (
            splittedVersion.length > 2 &&
            parseInt(splittedVersion[0]) >= 1 &&
            parseInt(splittedVersion[1]) >= 1
          ) {
            score = 1;
            items[0].result = greenResult;

            break;
          } else {
            score = 0;
            items[0].result = redResult;

            break;
          }
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

async function getCurrentVersion(css: string): Promise<string> {
  let version = "";

  const splittedCss = css.split("\n");
  for (const element of splittedCss) {
    if (element.toLowerCase().match("(version)")) {
      const splittedElement = element.split(" ");
      if (splittedElement.length < 2) {
        continue;
      }

      version = splittedElement[1];
    }
  }

  return version;
}
