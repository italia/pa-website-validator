"use strict";

import { CheerioAPI } from "cheerio";
import crawlerTypes from "../../../types/crawler-types";
import vocabularyResult = crawlerTypes.vocabularyResult;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import got from "got";
import * as cheerio from "cheerio";
import {
  eurovocVocabulary,
  schoolModelVocabulary,
} from "../../../storage/school/controlledVocabulary";

const Audit = lighthouse.Audit;

class LoadAudit extends lighthouse.Audit {
  static get meta() {
    return {
      id: "school-controlled-vocabularies",
      title: "I vocaboli appartengono al vocabolario scuole",
      failureTitle:
        "Più del 50% dei vocaboli non appartiene ad EuroVOC o al Modello Scuole",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "Test per verificare la presenza dei vocaboli sotto ARGOMENTI nei vocabolari scuole ed EuroVOC - Verde se tutti gli argomenti appartengono al vocabolario scuole. Modello scuole: https://docs.google.com/spreadsheets/d/1MoayTY05SE4ixtgBsfsdngdrFJf_Z2KNvDkMF3tKfc8/edit#gid=2135815526",
      requiredArtifacts: ["controlledVocabularies"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { controlledVocabularies: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.controlledVocabularies;

    const headings = [
      {
        key: "all_arguments_in_school_model",
        itemType: "text",
        text: "Tutti gli elementi sotto ARGOMENTI sono nel vocabolario scuole",
      },
      {
        key: "all_arguments_in_eurovoc_model",
        itemType: "text",
        text: "Tutti gli elementi sotto ARGOMENTI sono nel vocabolario EuroVOC",
      },
      {
        key: "eurovoc_element_percentage",
        itemType: "text",
        text: "% elementi mancanti in vocabolario eurovoc",
      },
      {
        key: "scuole_element_percentage",
        itemType: "text",
        text: "% elementi mancanti in vocabolario scuole",
      },
      {
        key: "element_not_in_school_model",
        itemType: "text",
        text: "Elementi non presenti nel modello scuole",
      },
      {
        key: "element_not_in_eurovoc_model",
        itemType: "text",
        text: "Elementi non presenti nel modello EuroVOC",
      },
    ];

    const queryUrl = "/?s";
    const searchUrl = url + queryUrl;

    const response = await got(searchUrl);
    const $ = cheerio.load(response.body);

    const argumentsElements = getArgumentsElements($);
    const schoolModelCheck = areAllElementsInVocabulary(
      argumentsElements,
      schoolModelVocabulary
    );
    const eurovocModelCheck = areAllElementsInVocabulary(
      argumentsElements,
      eurovocVocabulary
    );

    let numberOfElementsNotInEurovocModelPercentage = 100;
    let numberOfElementsNotInScuoleModelPercentage = 100;

    if (argumentsElements.length > 0) {
      numberOfElementsNotInEurovocModelPercentage =
        (eurovocModelCheck.elementNotIncluded.length /
          argumentsElements.length) *
        100;
      numberOfElementsNotInScuoleModelPercentage =
        (schoolModelCheck.elementNotIncluded.length /
          argumentsElements.length) *
        100;
    }

    let score = 0;
    if (schoolModelCheck.allArgumentsInVocabulary) {
      score = 1;
    } else if (
      schoolModelCheck.allArgumentsInVocabulary ||
      eurovocModelCheck.allArgumentsInVocabulary ||
      numberOfElementsNotInEurovocModelPercentage < 50 ||
      numberOfElementsNotInScuoleModelPercentage < 50
    ) {
      score = 0.5;
    }

    const items = [
      {
        all_arguments_in_school_model: schoolModelCheck.allArgumentsInVocabulary
          ? "Sì"
          : "No",
        all_arguments_in_eurovoc_model:
          eurovocModelCheck.allArgumentsInVocabulary ? "Sì" : "No",
        eurovoc_element_percentage:
          numberOfElementsNotInEurovocModelPercentage.toFixed(0) + "%",
        scuole_element_percentage:
          numberOfElementsNotInScuoleModelPercentage.toFixed(0) + "%",
        element_not_in_school_model:
          schoolModelCheck.elementNotIncluded.join(", "),
        element_not_in_eurovoc_model:
          eurovocModelCheck.elementNotIncluded.join(", "),
      },
    ];

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
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
