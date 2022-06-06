"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import * as cheerio from "cheerio";
import * as https from "https";

const Audit = lighthouse.Audit;
const currentVersion = "1.1.0";
const textDomain = "design_scuole_italia";

const greenResult =
  "Il sito utilizza una versione recente del tema CMS del modello scuole.";
const yellowResult =
  "Il sito non sembra utilizzare il tema CMS del modello Scuole.";
const redResult =
  "Il sito utilizza una versione datata del tema CMS del modello scuole.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-ux-ui-consistency-theme-version-check",
      title:
        "UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito scuola, deve utilizzarne la versione più recente disponibile alla data di inizio lavori.",
      failureTitle:
        "UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito scuola, deve utilizzarne la versione più recente disponibile alla data di inizio lavori.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        'CONDIZIONI DI SUCCESSO: la versione di tema CMS del modello scuole in uso è superiore alla 1.0.0; MODALITÀ DI VERIFICA: viene verificata la versione indicata nel file style.css, nel caso sia presente la chiave "Text Domain: design_scuole_italia"; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Scuole.](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/v2022.1/index.html)',
      requiredArtifacts: ["themeVersionCheck"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { themeVersionCheck: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const headHtml = artifacts.themeVersionCheck;

    let score = 0;
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
    let items = [
      {
        result: "",
        theme_version: "",
        checked_element: "",
      },
    ];

    const $ = cheerio.load(headHtml);
    const linkTags = $("html").find("link");
    const versionToCheck = "Version: " + currentVersion;

    let styleCSSurl = "";
    for (const linkTag of linkTags) {
      if (linkTag.attribs.href.includes("style.css")) {
        styleCSSurl = linkTag.attribs.href;
        const CSS = await getCSS(styleCSSurl);

        if (CSS.includes(versionToCheck) && CSS.includes(textDomain)) {
          score = 1;
          items[0].result = greenResult;
          items[0].theme_version = versionToCheck;
          items[0].checked_element = styleCSSurl;

          break;
        } else if (CSS.includes(versionToCheck) && !CSS.includes(textDomain)) {
          score = 0.5;
          items[0].result = yellowResult;
          items[0].theme_version = versionToCheck;
          items[0].checked_element = styleCSSurl;

          break;
        } else if (!CSS.includes(versionToCheck) && CSS.includes(textDomain)) {
          score = 0;
          items[0].result = redResult;
          items[0].theme_version = versionToCheck;
          items[0].checked_element = styleCSSurl;

          break;
        }
      } else {
        score = 0.5;
        items[0].result = yellowResult;
        items[0].theme_version = "";
        items[0].checked_element = "";
      }
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;

async function getCSS(hostname: string): Promise<string> {
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
