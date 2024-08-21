"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { allowedFonts } from "../../storage/school/allowedFonts";
import { getPages } from "../../utils/school/utils";
import { gotoRetry, requestTimeout } from "../../utils/utils";
import puppeteer from "puppeteer";
import { auditDictionary } from "../../storage/auditDictionary";
import { auditScanVariables } from "../../storage/school/auditScanVariables";
import {
  errorHandling,
  notExecutedErrorMessage,
} from "../../config/commonAuditsParts";
import { DataElementError } from "../../utils/DataElementError";

const Audit = lighthouse.Audit;

const auditId = "school-ux-ui-consistency-fonts-check";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

const numberOfServicesToBeScanned = process.env["numberOfServicePages"]
  ? JSON.parse(process.env["numberOfServicePages"])
  : auditVariables.numberOfServicesToBeScanned;

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

    let pagesToBeAnalyzed = [];
    try {
      pagesToBeAnalyzed = [
        url,
        ...(await getPages(url, [
          {
            type: "first_level_pages",
            numberOfPages: auditVariables.numberOfFirstLevelPageToBeScanned,
          },
          {
            type: "second_level_pages",
            numberOfPages: auditVariables.numberOfSecondLevelPageToBeScanned,
          },
          {
            type: "services",
            numberOfPages: numberOfServicesToBeScanned,
          },
        ])),
      ];
    } catch (ex) {
      if (!(ex instanceof DataElementError)) {
        throw ex;
      }

      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: notExecutedErrorMessage.replace("<LIST>", ex.message),
            },
          ]
        ),
      };
    }

    const correctItems = [];
    const toleranceItems = [];
    const wrongItems = [];

    let score = 1;

    const browser = await puppeteer.launch({
      headless: "new",
      protocolTimeout: requestTimeout,
      args: ["--no-zygote", "--no-sandbox", "--accept-lang=it"],
    });
    const browserWSEndpoint = browser.wsEndpoint();

    const pagesInError = [];

    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      const item = {
        inspected_page: pageToBeAnalyzed,
        wrong_fonts: "",
        wrong_number_elements: 0,
      };
      try {
        const browser2 = await puppeteer.connect({ browserWSEndpoint });
        const page = await browser2.newPage();

        await page.setRequestInterception(true);
        page.on("request", (request) => {
          if (
            ["image", "imageset", "media"].indexOf(request.resourceType()) !==
              -1 ||
            new URL(request.url()).pathname.endsWith(".pdf")
          ) {
            request.abort();
          } else {
            request.continue();
          }
        });

        const res = await gotoRetry(
          page,
          pageToBeAnalyzed,
          errorHandling.gotoRetryTentative
        );
        console.log(res?.url(), res?.status());

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

            for (const e of outerElems) {
              const elementWrongFonts = wrongFonts(e);
              if (elementWrongFonts.length > 0) {
                badElements.push([elementWrongFonts, false]);
                continue;
              }

              const children = [...e.querySelectorAll("*")];
              for (const child of children) {
                const wrongFontChild = wrongFonts(child);
                if (wrongFontChild.length > 0) {
                  badElements.push([wrongFontChild, true]);
                  break;
                }
              }
            }
            return badElements;
          },
          allowedFonts
        );

        if (badElements.length === 0) {
          correctItems.push(item);

          await page.goto("about:blank");
          await page.close();
          browser2.disconnect();
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

          await page.goto("about:blank");
          await page.close();
          browser2.disconnect();
          continue;
        }

        if (score > 0.5) {
          score = 0.5;
        }
        item.wrong_fonts = wrongFontsUnique(badElements).join(", ");
        item.wrong_number_elements = badElements.length;
        toleranceItems.push(item);

        await page.goto("about:blank");
        await page.close();
        browser2.disconnect();
      } catch (ex) {
        console.error(`ERROR ${pageToBeAnalyzed}: ${ex}`);
        await browser.close();
        if (!(ex instanceof Error)) {
          throw ex;
        }

        pagesInError.push({
          inspected_page: pageToBeAnalyzed,
          wrong_fonts: ex.message,
        });
      }
    }
    await browser.close();

    const results = [];
    if (pagesInError.length > 0) {
      results.push({
        result: errorHandling.errorMessage,
      });

      results.push({});

      results.push({
        result: errorHandling.errorColumnTitles[0],
        title_wrong_number_elements: errorHandling.errorColumnTitles[1],
        title_wrong_fonts: "",
      });

      for (const item of pagesInError) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }
    } else {
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
