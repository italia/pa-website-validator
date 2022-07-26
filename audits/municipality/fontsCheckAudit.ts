"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { allowedFonts } from "../../storage/municipality/allowedFonts";
import { getRandomMunicipalityServiceUrl } from "../../utils/utils";
import puppeteer from "puppeteer";
import { auditDictionary } from "../../storage/auditDictionary"

const Audit = lighthouse.Audit;

const auditId = "municipality-ux-ui-consistency-fonts-check"
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

    const randomServiceToBeScanned: string =
      await getRandomMunicipalityServiceUrl(url);

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
