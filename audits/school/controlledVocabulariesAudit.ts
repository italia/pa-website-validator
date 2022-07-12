"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { schoolModelVocabulary } from "../../storage/school/controlledVocabulary";
import {
  getPageElementDataAttribute,
  areAllElementsInVocabulary,
} from "../../utils/utils";
import puppeteer from "puppeteer";
import cheerio from "cheerio";

const Audit = lighthouse.Audit;

const greenResult =
  "Tutti gli argomenti appartengono all’elenco di voci del modello.";
const yellowResult =
  "Almeno il 50% degli argomenti appartengono all'elenco di voci del modello.";
const redResult =
  "Meno del 50% degli argomenti appartengono alle voci del modello.";
const notExecuted =
  "Non è stato possibile trovare gli argomenti o la pagina che li contiene. Controlla le “Modalità di verifica” per scoprire di più.";

class LoadAudit extends lighthouse.Audit {
  static get meta() {
    return {
      id: "school-controlled-vocabularies",
      title:
        "R.SC.1.1 - VOCABOLARI CONTROLLATI - Il sito della scuola deve utilizzare argomenti forniti dal modello di sito scuola.",
      failureTitle:
        "R.SC.1.1 - VOCABOLARI CONTROLLATI - Il sito della scuola deve utilizzare argomenti forniti dal modello di sito scuola.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "CONDIZIONI DI SUCCESSO: gli argomenti utilizzati appartengono alla lista indicata all'interno del documento di architettura dell'informazione del modello scuole alla voce \"Le parole della scuola\"; MODALITÀ DI VERIFICA: gli argomenti identificati all'interno della funzione di ricerca del sito vengono confrontati con l'elenco di voci presente nel documento di architettura dell'informazione, ricercandoli usando specifici attributi \"data-element\" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Elenco degli argomenti del Modello scuole](https://docs.google.com/spreadsheets/d/1MoayTY05SE4ixtgBsfsdngdrFJf_Z2KNvDkMF3tKfc8/edit#gid=2135815526), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      {
        key: "element_in_school_model_percentage",
        itemType: "text",
        text: "% di argomenti inclusi nell'elenco del modello scuole",
      },
      {
        key: "element_not_in_school_model",
        itemType: "text",
        text: "Argomenti non inclusi nell'elenco del modello scuole",
      },
    ];

    const item = [
      {
        result: redResult,
        element_in_school_model_percentage: "",
        element_not_in_school_model: "",
      },
    ];

    const argumentsElements: string[] = await getArgumentsElements(url);
    if (argumentsElements.length <= 0) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [{ result: notExecuted }]
        ),
      };
    }

    const schoolModelCheck = await areAllElementsInVocabulary(
      argumentsElements,
      schoolModelVocabulary
    );

    let numberOfElementsNotInScuoleModelPercentage = 100;

    if (argumentsElements.length > 0) {
      numberOfElementsNotInScuoleModelPercentage =
        (schoolModelCheck.elementNotIncluded.length /
          argumentsElements.length) *
        100;
    }

    let score = 0;
    if (schoolModelCheck.allArgumentsInVocabulary) {
      item[0].result = greenResult;
      score = 1;
    } else if (numberOfElementsNotInScuoleModelPercentage < 50) {
      item[0].result = yellowResult;
      score = 0.5;
    }

    item[0].element_in_school_model_percentage = (
      100 - numberOfElementsNotInScuoleModelPercentage
    )
      .toFixed(0)
      .toString();
    item[0].element_not_in_school_model =
      schoolModelCheck.elementNotIncluded.join(", ");

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;

async function getArgumentsElements(url: string): Promise<string[]> {
  let elements: string[] = [];
  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load" });

    await page.waitForSelector('[data-element="search-modal-button"]', {
      visible: true,
    });

    await page.$eval(
      '[data-element="search-modal-button"]',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el: any) => (el.value = "scuola")
    );

    const button = await page.$('[data-element="search-submit"]');
    if (!button) {
      return elements;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await button?.evaluate((b: any) => b.click());

    await page.waitForNavigation();

    const $ = cheerio.load(await page.content());
    if ($.length <= 0) {
      await browser.close();
      return elements;
    }

    elements = await getPageElementDataAttribute(
      $,
      '[data-element="all-topics"]',
      "li"
    );

    await browser.close();

    return elements;
  } catch (ex) {
    await browser.close();

    return [];
  }
}
