"use strict";

import crawlerTypes from "../../types/crawler-types";
import vocabularyResult = crawlerTypes.vocabularyResult;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { schoolModelVocabulary } from "../../storage/school/controlledVocabulary";
import { getPageElementDataAttribute } from "../../utils/utils";
import puppeteer from "puppeteer";
import cheerio from "cheerio";

const Audit = lighthouse.Audit;

const greenResult =
  "Tutti gli argomenti appartengono all’elenco di voci del modello scuole.";
const yellowResult =
  "Tutti gli argomenti appartengono al vocabolario di EuroVoc ma non all'elenco di voci del modello scuole.";
const redResult =
  "Più del 50% degli argomenti non appartengono alle voci del modello scuole o al vocabolario di EuroVoc.";
const notExecuted =
  "Non è stato possibile trovare gli argomenti o la pagina che li contiene. Controlla le “Modalità di verifica” per scoprire di più.";

class LoadAudit extends lighthouse.Audit {
  static get meta() {
    return {
      id: "school-controlled-vocabularies",
      title:
        "VOCABOLARI CONTROLLATI - Il sito scuola deve utilizzare argomenti forniti dal modello di sito scuola o appartenenti al vocabolario controllato europeo EuroVoc.",
      failureTitle:
        "VOCABOLARI CONTROLLATI - Il sito scuola deve utilizzare argomenti forniti dal modello di sito scuola o appartenenti al vocabolario controllato europeo EuroVoc.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "CONDIZIONI DI SUCCESSO: almeno il 50% degli argomenti presenti appartiene alla lista indicata all'interno del documento di architettura dell'informazione del modello scuole alla voce \"Le parole della scuola\"; MODALITÀ DI VERIFICA: gli argomenti identificati all'interno della funzione di ricerca del sito vengono confrontati con l'elenco di voci presente nel documento di architettura dell'informazione; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Elenco degli argomenti del Modello scuole](https://docs.google.com/spreadsheets/d/1D4KbaA__xO9x_iBm08KvZASjrrFLYLKX/edit?usp=sharing&ouid=115576940975219606169&rtpof=true&sd=true)",
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

async function areAllElementsInVocabulary(
  pageArguments: string[],
  vocabularyElements: string[]
): Promise<vocabularyResult> {
  let result = true;

  if (pageArguments.length <= 0) {
    result = false;
  }

  const elementNotIncluded = [];
  for (const pageArgument of pageArguments) {
    if (!vocabularyElements.includes(pageArgument)) {
      result = false;
      elementNotIncluded.push(pageArgument);
    }
  }

  return {
    allArgumentsInVocabulary: result,
    elementNotIncluded: elementNotIncluded,
  };
}
