"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  eurovocVocabulary,
  municipalityModelVocabulary,
} from "../../storage/municipality/controlledVocabulary";
import {
  areAllElementsInVocabulary,
  buildUrl,
  getHREFValuesDataAttribute,
  getPageElementDataAttribute,
  isInternalUrl,
  loadPageData,
} from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

const auditId = "municipality-controlled-vocabularies";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const yellowResult = auditData.yellowResult;
const redResult = auditData.redResult;
const notExecuted = auditData.nonExecuted;

class LoadAudit extends lighthouse.Audit {
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

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      {
        key: "element_in_municipality_model_percentage",
        itemType: "text",
        text: "% di argomenti presenti nell'elenco del modello",
      },
      {
        key: "element_not_in_municipality_vocabulary",
        itemType: "text",
        text: "Argomenti non presenti nell'elenco del modello",
      },
      {
        key: "element_in_union_percentage",
        itemType: "text",
        text: "% di argomenti presenti nell'elenco del modello o EuroVoc",
      },
      {
        key: "element_not_in_union_vocabulary",
        itemType: "text",
        text: "Argomenti non presenti nell'elenco del modello o EuroVoc",
      },
    ];

    let score = 0;
    const item = [
      {
        result: redResult,
        element_in_municipality_model_percentage: "",
        element_not_in_municipality_vocabulary: "",
        element_in_union_percentage: "",
        element_not_in_union_vocabulary: "",
      },
    ];

    let $ = await loadPageData(url);
    const allArgumentsHREF = await getHREFValuesDataAttribute(
      $,
      '[data-element="all-topics"]'
    );
    if (allArgumentsHREF.length <= 0) {
      item[0].result = notExecuted;
      return {
        score: 0,
        details: Audit.makeTableDetails(headings, item),
      };
    }

    let allArgumentsPageUrl = allArgumentsHREF[0];
    if (
      (await isInternalUrl(allArgumentsPageUrl)) &&
      !allArgumentsPageUrl.includes(url)
    ) {
      allArgumentsPageUrl = await buildUrl(url, allArgumentsHREF[0]);
    }

    $ = await loadPageData(allArgumentsPageUrl);
    const argumentList = await getPageElementDataAttribute(
      $,
      '[data-element="topic-element"]'
    );

    if (argumentList.length === 0) {
      return {
        score: score,
        details: Audit.makeTableDetails(headings, item),
      };
    }

    const elementInfoMunicipalityVocabulary = await areAllElementsInVocabulary(
      argumentList,
      municipalityModelVocabulary
    );

    const elementInMunicipalityModelPercentage = parseInt(
      (
        (elementInfoMunicipalityVocabulary.elementIncluded.length /
          argumentList.length) *
        100
      ).toFixed(0)
    );

    const lowerCaseEurovoc = eurovocVocabulary.map((element) => {
      return element.toLowerCase();
    });
    const lowerCaseModel = municipalityModelVocabulary.map((element) => {
      return element.toLowerCase();
    });
    const uniq = [...new Set([...lowerCaseEurovoc, ...lowerCaseModel])];

    const elementInUnionVocabulary = await areAllElementsInVocabulary(
      argumentList,
      uniq
    );

    const elementInUnionVocabularyPercentage = parseInt(
      (
        (elementInUnionVocabulary.elementIncluded.length /
          argumentList.length) *
        100
      ).toFixed(0)
    );

    if (elementInfoMunicipalityVocabulary.allArgumentsInVocabulary) {
      score = 1;
      item[0].result = greenResult;
    } else if (elementInUnionVocabularyPercentage > 50) {
      item[0].result = yellowResult;
      score = 0.5;
    } else {
      item[0].result = redResult;
      score = 0;
    }

    item[0].element_in_municipality_model_percentage =
      elementInMunicipalityModelPercentage + "%";
    item[0].element_in_union_percentage =
      elementInUnionVocabularyPercentage + "%";
    item[0].element_not_in_municipality_vocabulary =
      elementInfoMunicipalityVocabulary.elementNotIncluded.join(", ");
    item[0].element_not_in_union_vocabulary =
      elementInUnionVocabulary.elementNotIncluded.join(", ");

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;
