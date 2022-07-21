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
const textDomain = "design_comuni_italia";

const greenResult =
  "Il sito utilizza una versione recente del tema CMS del modello comuni.";
const yellowResult =
  "Il sito non sembra utilizzare il tema CMS del modello comuni.";
const redResult =
  "Il sito utilizza una versione datata del tema CMS del modello comuni.";

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
        "CONDIZIONI DI SUCCESSO: la versione di tema CMS del modello Comuni in uso è superiore alla 1.0; MODALITÀ DI VERIFICA: viene verificata la versione indicata nel file style.css, nel caso sia presente la chiave design_comuni_italia; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/v2022.1/index.html).",
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

        if (CSS.includes(versionToCheck) && CSS.includes(textDomain)) {
          score = 1;
          items[0].result = greenResult;
          items[0].theme_version = await getCurrentVersion(CSS);
          items[0].checked_element = styleCSSurl;

          break;
        } else if (!CSS.includes(versionToCheck) && CSS.includes(textDomain)) {
          score = 0;
          items[0].result = redResult;
          items[0].theme_version = await getCurrentVersion(CSS);
          items[0].checked_element = styleCSSurl;

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
