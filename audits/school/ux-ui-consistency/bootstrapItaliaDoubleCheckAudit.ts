"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import * as cheerio from "cheerio";

const Audit = lighthouse.Audit;
const themePossibleNames = ["design-scuole-wordpress"];

const bootstrapItaliaLibraryName = "bootstrap-italia.css";

const greenResult =
  "Il sito utilizza la libreria Bootstrap Italia in una versione più recente o uguale di 1.6.";
const redResult =
  "Il sito non utilizza la libreria Bootstrap Italia o ne utilizza una versione precedente a 1.6";
const libraryName = "Bootstrap-italia";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-ux-ui-consistency-bootstrap-italia-double-check",
      title:
        "LIBRERIA DI ELEMENTI DI INTERFACCIA - Il sito scuola deve utilizzare la libreria Bootstrap Italia.",
      failureTitle:
        "LIBRERIA DI ELEMENTI DI INTERFACCIA - Il sito scuola deve utilizzare la libreria Bootstrap Italia.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "CONDIZIONI DI SUCCESSO: la versione di libreria Bootstrap Italia in uso è uguale o superiore alla 1.6; MODALITÀ DI VERIFICA: viene verificata la presenza della libreria Bootstrap Italia e la versione in uso individuando la variabile window.BOOTSTRAP_ITALIA_VERSION della libreria; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Scuole.](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/v2022.1/index.html)",
      requiredArtifacts: ["bootstrapItaliaWPCheck", "bootstrapItaliaCheck"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & {
      bootstrapItaliaCheck: string;
      bootstrapItaliaWPCheck: string;
    }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const headHtml = artifacts.bootstrapItaliaWPCheck;
    const bootstrapItaliaVariableVersion = artifacts.bootstrapItaliaCheck;

    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
      },
      {
        key: "library_name",
        itemType: "text",
        text: "Nome libreria in uso",
      },
      {
        key: "library_version",
        itemType: "text",
        text: "Versione libreria in uso",
      },
    ];
    const items = [
      {
        result: redResult,
        library_name: "",
        library_version: "",
      },
    ];
    let score = 0;

    if (bootstrapItaliaVariableVersion != null) {
      const splittedVersion = bootstrapItaliaVariableVersion.split(".");
      const majorVersion = splittedVersion[0];
      const middleVersion = splittedVersion[1];

      if (parseInt(majorVersion) >= 1 && parseInt(middleVersion) >= 6) {
        score = 1;
      }

      items[0].result = greenResult;
      items[0].library_name = libraryName;
      items[0].library_version = bootstrapItaliaVariableVersion;
    } else {
      const $: CheerioAPI = cheerio.load(headHtml);
      const linkTags = $("html").find("link");

      for (const linkTag of linkTags) {
        const cleanLinkHref = linkTag.attribs.href
          .replace("http://www.", "")
          .replace("https://www.", "");
        const splitCleanLinkHref = cleanLinkHref.split("/");
        if (containsPossibleThemeName(splitCleanLinkHref)) {
          for (const element of splitCleanLinkHref) {
            if (element.includes(bootstrapItaliaLibraryName)) {
              const splitElement = element.split("?");
              const libraryVersion = splitElement[1].split("=")[1];

              const majorLibraryVersion = libraryVersion.split(".");
              if (parseInt(majorLibraryVersion[0]) >= 4) {
                score = 1;
                items[0].result = greenResult;
                items[0].library_name = libraryName;
                items[0].library_version = libraryVersion;

                break;
              }
            }
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

function containsPossibleThemeName(array: Array<string>): boolean {
  for (const element of array) {
    for (const name of themePossibleNames) {
      if (element.includes(name)) {
        return true;
      }
    }
  }

  return false;
}
