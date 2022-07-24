"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import * as https from "https";
import * as http from "http";
import { CheerioAPI } from "cheerio";
import { buildUrl, isInternalUrl, loadPageData } from "../../utils/utils";

const Audit = lighthouse.Audit;
const currentVersion = "1.0.0";
const textDomain = "Text Domain: design_comuni_italia";

const greenResult =
  "Il sito utilizza una versione idonea del tema CMS del modello.";
const yellowResult = "Il sito non sembra utilizzare il tema CMS del modello.";
const redResult =
  "Il sito utilizza una versione datata del tema CMS del modello.";

const notExecuted =
  'Non è stato possibile condurre il test. Controlla le "Modalità di verifica" per scoprire di più.';

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-ux-ui-consistency-theme-version-check",
      title:
        "C.SI.1.4 - UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito comunale, deve utilizzarne la versione più recente disponibile alla data di inizio lavori.",
      failureTitle:
        "C.SI.1.4 - UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito comunale, deve utilizzarne la versione più recente disponibile alla data di inizio lavori.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "C.SI.1.4 - UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito comunale, deve utilizzarne la versione più recente disponibile alla data di inizio lavori.",
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

    const versionToCheck = "Version: " + currentVersion;

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
        } else {
          const currentVersion = await getCurrentVersion(CSS);
          items[0].theme_version = currentVersion;
          const splittedVersion = currentVersion.split(".");

          if (
            splittedVersion.length > 2 &&
            parseInt(splittedVersion[0]) >= 1 &&
            parseInt(splittedVersion[1]) >= 0
          ) {
            score = 1;
            items[0].result = greenResult;
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
