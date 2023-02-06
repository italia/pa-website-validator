"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { allowedFonts } from "../../storage/school/allowedFonts";
import { getRandomSchoolServicesUrl } from "../../utils/school/utils";
import puppeteer from "puppeteer";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

const auditId = "school-ux-ui-consistency-fonts-check";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const yellowResult = auditData.yellowResult;
const redResult = auditData.redResult;
const notExecuted = auditData.nonExecuted;
const maxLength = 100;

type BadElement = [string, boolean]; // First value is element snippet, second is whether it is tolerable

const headings: LH.Audit.Details.TableColumnHeading[] = [
  {
    key: "result",
    itemType: "text",
    text: "Risultato",
    subItemsHeading: {
      key: "node",
      itemType: "node",
    },
  },
];

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

    const randomService: string[] = await getRandomSchoolServicesUrl(url);

    if (randomService.length === 0) {
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

    const randomServiceToBeScanned: string = randomService[0];

    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.goto(randomServiceToBeScanned);

      const badElements: Array<BadElement> = await page.evaluate(
        (requiredFonts) => {
          const badElements: Array<BadElement> = [];
          const outerElems = window.document.body.querySelectorAll(
            "h1, h2, h3, h4, h5, h6, p"
          );

          const isBad = (e: Element) =>
            !requiredFonts.includes(
              window
                .getComputedStyle(e)
                .fontFamily.split(",", 1)
                .map((s) => s.replace(/^"|"$/g, ""))[0] // "Titillium Web" => Titillium Web
            );

          for (const e of outerElems) {
            if (isBad(e)) {
              badElements.push([e.outerHTML, false]);
            } else if ([...e.querySelectorAll("*")].some(isBad)) {
              // If good parent element has some bad descendant we add it to the list in tolerance mode
              badElements.push([e.outerHTML, true]);
            }
          }
          return badElements;
        },
        allowedFonts
      );

      if (badElements.length === 0) {
        const item: LH.Audit.Details.TableItem = {
          result: greenResult.replace("[url]", randomServiceToBeScanned),
          subItems: {
            type: "subitems",
            items: [],
          },
        };

        return {
          score: 1,
          details: Audit.makeTableDetails(headings, [item]),
        };
      }

      const reallyBadElements = badElements.filter((e) => !e[1]);

      const toSnippets = (
        es: BadElement[]
      ): { node: LH.Audit.Details.NodeValue }[] =>
        es.map((e) => ({
          node: {
            type: "node",
            snippet:
              e[0].slice(0, maxLength) + (e[0].length > maxLength ? "..." : ""),
          },
        }));

      const item: LH.Audit.Details.TableItem = {
        result:
          reallyBadElements.length > 0
            ? redResult.replace("[url]", randomServiceToBeScanned)
            : yellowResult.replace("[url]", randomServiceToBeScanned),
        subItems: {
          type: "subitems",
          items:
            reallyBadElements.length > 0
              ? toSnippets(reallyBadElements)
              : toSnippets(badElements),
        },
      };

      return {
        score: reallyBadElements.length > 0 ? 0 : 0.5,
        details: Audit.makeTableDetails(headings, [item]),
      };
    } catch (e) {
      return {
        errorMessage: e instanceof Error ? e.message : "",
        score: 0,
      };
    } finally {
      await browser.close();
    }
  }
}

module.exports = LoadAudit;
