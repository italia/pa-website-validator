"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { allowedFonts } from "../../storage/school/allowedFonts";
import { getRandomSchoolServiceUrl } from "../../utils/utils";
import puppeteer from "puppeteer";

const Audit = lighthouse.Audit;

const greenResult = "Il sito utilizza tutti i font necessari.";
const yellowResult =
  "Il sito utilizza il font Titillium Web ma non il font Lora.";
const redResult = "Il sito non utilizza i font del modello.";
const notExecuted =
  "Non è stato possibile trovare una scheda servizio su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-ux-ui-consistency-fonts-check",
      title:
        "C.SC.1.1 - COERENZA DELL'UTILIZZO DEI FONT (librerie di caratteri) - Il sito della scuola deve utilizzare i font indicati dalla documentazione del modello di sito della scuola.",
      failureTitle:
        "C.SC.1.1 - COERENZA DELL'UTILIZZO DEI FONT (librerie di caratteri) - Il sito della scuola deve utilizzare i font indicati dalla documentazione del modello di sito della scuola.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        'CONDIZIONI DI SUCCESSO: il sito utilizza almeno i font Titillium Web e Lora; MODALITÀ DI VERIFICA: ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica, viene verificata la presenza dei font all\'interno di una scheda servizio casualmente selezionata; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;
    let score = 0;

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      { key: "found_fonts", itemType: "text", text: "Font trovati" },
      { key: "missing_fonts", itemType: "text", text: "Font mancanti" },
    ];

    const item = [
      {
        result: redResult,
        found_fonts: "",
        missing_fonts: allowedFonts.join(", "),
      },
    ];

    const randomServiceToBeScanned: string = await getRandomSchoolServiceUrl(
      url
    );

    if (!randomServiceToBeScanned) {
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

    const browser = await puppeteer.launch();

    let fonts: string[] = [];
    try {
      const page = await browser.newPage();
      await page.goto(randomServiceToBeScanned);

      fonts = await page.evaluate(() => {
        const values: string[] = [];
        let val;
        const nodes = window.document.body.getElementsByTagName("*");

        for (let i = 0; i < nodes.length; i++) {
          const currentNode = nodes[i];

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (currentNode.style) {
            val =
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              currentNode.style.fontFamily ||
              window.getComputedStyle(currentNode, "")["fontFamily"];
            if (val) {
              if (values.indexOf(val) == -1) {
                values.push(val);
              }
            }

            const val_before = window.getComputedStyle(currentNode, ":before")[
              "fontFamily"
            ];
            if (val_before) {
              if (values.indexOf(val_before) == -1) {
                values.push(val_before);
              }
            }

            const val_after = window.getComputedStyle(currentNode, ":after")[
              "fontFamily"
            ];
            if (val_after) {
              if (values.indexOf(val_after) == -1) {
                values.push(val_after);
              }
            }
          }
        }

        return values;
      });
      await browser.close();
    } catch (ex) {
      await browser.close();

      return {
        score: 0,
        details: Audit.makeTableDetails(headings, item),
      };
    }

    if (fonts.length <= 0) {
      item[0].missing_fonts = allowedFonts.join(", ");
      return {
        score: score,
        details: Audit.makeTableDetails(headings, item),
      };
    }

    let cleanFonts: string[] = [];
    for (let font of fonts) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      font = font.toString().replaceAll('"', "") ?? "";
      if (!font) {
        continue;
      }

      cleanFonts = [...cleanFonts, ...font.split(",")];
    }

    if (
      cleanFonts.includes(allowedFonts[0]) &&
      cleanFonts.includes(allowedFonts[1])
    ) {
      score = 1;
      item[0].result = greenResult;
      item[0].missing_fonts = "";
    } else if (cleanFonts.includes(allowedFonts[0])) {
      score = 0.5;
      item[0].result = yellowResult;
      item[0].missing_fonts = allowedFonts[1];
    }

    item[0].found_fonts = cleanFonts.join(", ");

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;
