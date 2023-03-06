"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { allowedFonts } from "../../storage/municipality/allowedFonts";
import {
  getRandomFirstLevelPagesUrl,
  getRandomSecondLevelPagesUrl,
  getRandomThirdLevelPagesUrl,
  getPrimaryPageUrl,
} from "../../utils/municipality/utils";
import puppeteer from "puppeteer";
import { auditDictionary } from "../../storage/auditDictionary";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";
import { primaryMenuItems } from "../../storage/municipality/menuItems";

const Audit = lighthouse.Audit;

const auditId = "municipality-ux-ui-consistency-fonts-check";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

type BadElement = [string[], boolean]; // First value is element snippet, second is whether it is tolerable

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
  ): Promise<LH.Audit.ProductBase> {
    const url = artifacts.origin;

    const titleSubHeadings = [
      "Numero di <h> o <p> con font errati",
      "Font errati individuati",
    ];
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
        subItemsHeading: { key: "inspected_page", itemType: "url" },
      },
      {
        key: "title_wrong_number_elements",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "wrong_number_elements", itemType: "text" },
      },
      {
        key: "title_wrong_fonts",
        itemType: "text",
        text: "",
        subItemsHeading: { key: "wrong_fonts", itemType: "text" },
      },
    ];

    const randomFirstLevelPagesUrl = await getRandomFirstLevelPagesUrl(
      url,
      auditVariables.numberOfFirstLevelPageToBeScanned
    );

    const randomSecondLevelPagesUrl = await getRandomSecondLevelPagesUrl(
      url,
      auditVariables.numberOfSecondLevelPageToBeScanned
    );

    const randomServicesUrl = await getRandomThirdLevelPagesUrl(
      url,
      await getPrimaryPageUrl(url, primaryMenuItems.services.data_element),
      `[data-element="${primaryMenuItems.services.third_item_data_element}"]`,
      auditVariables.numberOfServicesToBeScanned
    );

    if (
      randomFirstLevelPagesUrl.length === 0 ||
      randomSecondLevelPagesUrl.length === 0 ||
      randomServicesUrl.length === 0
    ) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: auditData.nonExecuted,
            },
          ]
        ),
      };
    }

    const pagesToBeAnalyzed = [
      url,
      ...randomFirstLevelPagesUrl,
      ...randomSecondLevelPagesUrl,
      ...randomServicesUrl,
    ];

    const personalAreaLoginPage = await getPrimaryPageUrl(
      url,
      "personal-area-login"
    );
    if (personalAreaLoginPage !== "") {
      pagesToBeAnalyzed.push(personalAreaLoginPage);
    }

    const correctItems = [];
    const toleranceItems = [];
    const wrongItems = [];

    let score = 1;

    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
    });

    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      const item = {
        inspected_page: pageToBeAnalyzed,
        wrong_fonts: "",
        wrong_number_elements: 0,
      };
      try {
        const page = await browser.newPage();
        await page.goto(pageToBeAnalyzed, {
          waitUntil: [
            "load",
            "domcontentloaded",
            "networkidle0",
            "networkidle2",
          ],
          timeout: 10000,
        });

        const badElements: Array<BadElement> = await page.evaluate(
          (requiredFonts) => {
            const badElements: Array<BadElement> = [];
            const outerElems = window.document.body.querySelectorAll(
              "h1, h2, h3, h4, h5, h6, p"
            );

            const wrongFonts = (e: Element) => {
              const elementFonts = window
                .getComputedStyle(e)
                .fontFamily.split(",", 1)
                .map((s) => s.replace(/^"|"$/g, ""));
              return elementFonts.filter((x) => !requiredFonts.includes(x));
            };

            const isBad = (e: Element) => {
              return wrongFonts(e).length > 0;
            };

            for (const e of outerElems) {
              const elementWrongFonts = wrongFonts(e);
              if (elementWrongFonts.length > 0) {
                badElements.push([elementWrongFonts, false]);
              } else if ([...e.querySelectorAll("*")].some(isBad)) {
                // If good parent element has some bad descendant we add it to the list in tolerance mode
                badElements.push([elementWrongFonts, true]);
              }
            }
            return badElements;
          },
          allowedFonts
        );

        if (badElements.length === 0) {
          correctItems.push(item);
          continue;
        }

        const reallyBadElements = badElements.filter((e) => !e[1]);

        const wrongFontsUnique = (arrays: Array<BadElement>) => {
          const arrayUnique = (array: string[]) => {
            const a = array.concat();
            for (let i = 0; i < a.length; ++i) {
              for (let j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j]) a.splice(j--, 1);
              }
            }
            return a;
          };

          let arrayMerged: string[] = [];
          for (const array of arrays) {
            arrayMerged = arrayMerged.concat(array[0]);
          }
          return arrayUnique(arrayMerged);
        };

        if (reallyBadElements.length > 0) {
          if (score > 0) {
            score = 0;
          }
          item.wrong_fonts = wrongFontsUnique(reallyBadElements).join(", ");
          item.wrong_number_elements = reallyBadElements.length;
          wrongItems.push(item);
          continue;
        }

        if (score > 0.5) {
          score = 0.5;
        }
        item.wrong_fonts = wrongFontsUnique(badElements).join(", ");
        item.wrong_number_elements = badElements.length;
        toleranceItems.push(item);
      } catch (e) {
        await browser.close();
        return {
          errorMessage: e instanceof Error ? e.message : "",
          score: 0,
        };
      }
    }
    await browser.close();

    const results = [];
    switch (score) {
      case 1:
        results.push({
          result: auditData.greenResult,
        });
        break;
      case 0.5:
        results.push({
          result: auditData.yellowResult,
        });
        break;
      case 0:
        results.push({
          result: auditData.redResult,
        });
        break;
    }

    results.push({});

    if (wrongItems.length > 0) {
      results.push({
        result: auditData.subItem.redResult,
        title_wrong_number_elements: titleSubHeadings[0],
        title_wrong_fonts: titleSubHeadings[1],
      });

      for (const item of wrongItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    if (toleranceItems.length > 0) {
      results.push({
        result: auditData.subItem.yellowResult,
        title_wrong_number_elements: titleSubHeadings[0],
        title_wrong_fonts: titleSubHeadings[1],
      });

      for (const item of toleranceItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    if (correctItems.length > 0) {
      results.push({
        result: auditData.subItem.greenResult,
        title_wrong_number_elements: titleSubHeadings[0],
        title_wrong_fonts: titleSubHeadings[1],
      });

      for (const item of correctItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
    };
  }
}

module.exports = LoadAudit;
