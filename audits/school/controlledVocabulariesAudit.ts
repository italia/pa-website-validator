"use strict";

import { CheerioAPI } from "cheerio";
import crawlerTypes from "../../types/crawler-types";
import vocabularyResult = crawlerTypes.vocabularyResult;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  eurovocVocabulary,
  schoolModelVocabulary,
} from "../../storage/school/controlledVocabulary";
import {loadPageData} from "../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult =
  "Tutti gli argomenti appartengono all’elenco di voci del modello scuole.";
const yellowResult =
  "Tutti gli argomenti appartengono al vocabolario di EuroVoc ma non all'elenco di voci del modello scuole.";
const redResult =
  "Più del 50% degli argomenti non appartengono alle voci del modello scuole o al vocabolario di EuroVoc.";

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

    let item = [
      {
        result: redResult,
        element_in_school_model_percentage: "",
        element_not_in_school_model: "",
      },
    ];

    const queryUrl = "/?s";
    const searchUrl = url + queryUrl;

    const $: CheerioAPI = await loadPageData(searchUrl)

    const argumentsElements = getArgumentsElements($);
    const schoolModelCheck = areAllElementsInVocabulary(
      argumentsElements,
      schoolModelVocabulary
    );

    let numberOfElementsNotInScuoleModelPercentage = 100;

    if (argumentsElements.length > 0) {
      numberOfElementsNotInScuoleModelPercentage = (schoolModelCheck.elementNotIncluded.length / argumentsElements.length) * 100;
    }

    let score = 0;
    if (schoolModelCheck.allArgumentsInVocabulary) {
      item[0].result = greenResult;
      score = 1;
    } else if (numberOfElementsNotInScuoleModelPercentage < 50) {
      item[0].result = yellowResult;
      score = 0.5;
    }

    item[0].element_in_school_model_percentage = (100 - numberOfElementsNotInScuoleModelPercentage).toFixed(0).toString();
    item[0].element_not_in_school_model = schoolModelCheck.elementNotIncluded.join(", ");

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;

function getArgumentsElements($: CheerioAPI): string[] {
  const searchResultFilters = $(".custom-control-label");

  const argumentElements = [];
  for (const element of searchResultFilters) {
    argumentElements.push($(element).text().trim());
  }

  return argumentElements;
}

function areAllElementsInVocabulary(
  pageArguments: string[],
  vocabularyElements: string[]
): vocabularyResult {
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
