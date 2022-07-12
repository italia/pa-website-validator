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
  loadPageData,
} from "../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult =
  "Tutti gli argomenti appartengono all’elenco di voci del modello o al vocabolario EuroVoc.";
const yellowResult =
  "Almeno il 50% degli argomenti appartengono all'elenco di voci del modello o al vocabolario EuroVoc.";
const redResult =
  "Meno del 50% degli argomenti appartengono alle voci del modello Comuni o al vocabolario EuroVoc.";
const notExecuted =
  "Non è stato possibile trovare gli argomenti o la pagina che li contiene. Controlla le “Modalità di verifica” per scoprire di più.";

class LoadAudit extends lighthouse.Audit {
  static get meta() {
    return {
      id: "municipality-controlled-vocabularies",
      title:
        "C.SI.1.5 - VOCABOLARI CONTROLLATI - Il sito comunale deve utilizzare argomenti forniti dal modello di sito comunale o appartenenti al vocabolario controllato europeo EuroVoc.",
      failureTitle:
        "C.SI.1.5 - VOCABOLARI CONTROLLATI - Il sito comunale deve utilizzare argomenti forniti dal modello di sito comunale o appartenenti al vocabolario controllato europeo EuroVoc.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "CONDIZIONI DI SUCCESSO: gli argomenti utilizzati appartengono alla lista indicata all'interno del documento di architettura dell'informazione del modello Comuni alla voce \"Tassonomia ARGOMENTI\" o al vocabolario controllato EuroVoc; MODALITÀ DI VERIFICA: gli argomenti identificati all'interno della funzione di ricerca del sito vengono confrontati con l'elenco di voci presente nel documento di architettura dell'informazione e con il vocabolario controllato EuroVoc, ricercandoli usando specifici attributi \"data-element\" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/), [Elenco degli argomenti del Modello Comuni](https://docs.google.com/spreadsheets/d/1D4KbaA__xO9x_iBm08KvZASjrrFLYLKX/edit#gid=335720294), [Vocabolario EuroVoc](https://eur-lex.europa.eu/browse/eurovoc.html?locale=it).",
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
        text: "% di argomenti inclusi nell'elenco del modello Comuni",
      },
      {
        key: "element_not_in_municipality_vocabulary",
        itemType: "text",
        text: "Argomenti non inclusi nell'elenco del modello Comuni",
      },
      {
        key: "element_in_eurovoc_percentage",
        itemType: "text",
        text: "% di argomenti inclusi nell'elenco EuroVoc",
      },
      {
        key: "element_not_in_eurovoc_vocabulary",
        itemType: "text",
        text: "Argomenti non inclusi nell'elenco EuroVoc",
      },
    ];

    let score = 0;
    const item = [
      {
        result: redResult,
        element_in_municipality_model_percentage: "",
        element_not_in_municipality_vocabulary: "",
        element_in_eurovoc_percentage: "",
        element_not_in_eurovoc_vocabulary: "",
      },
    ];

    let $ = await loadPageData(url);
    const allArgumentsHREF = await getHREFValuesDataAttribute(
      $,
      '[data-element="all-topics"]'
    );
    if (allArgumentsHREF.length <= 0) {
      item[0].result =
        notExecuted + " - pagina tutti gli argomenti non trovata";
      return {
        score: 0,
        details: Audit.makeTableDetails(headings, item),
      };
    }

    let allArgumentsPageUrl = allArgumentsHREF[0];
    if (!allArgumentsPageUrl.includes(url)) {
      allArgumentsPageUrl = await buildUrl(url, allArgumentsHREF[0]);
    }

    $ = await loadPageData(allArgumentsPageUrl);
    const argumentList = await getPageElementDataAttribute(
      $,
      '[data-element="topic-element"]'
    );

    const elementInfoMunicipalityVocabulary = await areAllElementsInVocabulary(
      argumentList,
      municipalityModelVocabulary
    );

    const elementInfoEurovocVocabulary = await areAllElementsInVocabulary(
      argumentList,
      eurovocVocabulary
    );

    const elementInMunicipalityModelPercentage = (
      (elementInfoMunicipalityVocabulary.elementIncluded.length /
        argumentList.length) *
      100
    ).toFixed(0);

    const elementInEurovocPercentage = (
      (elementInfoEurovocVocabulary.elementIncluded.length /
        argumentList.length) *
      100
    ).toFixed(0);

    if (elementInfoMunicipalityVocabulary.allArgumentsInVocabulary) {
      score = 1;
      item[0].result = greenResult;
    } else if (elementInfoEurovocVocabulary.allArgumentsInVocabulary) {
      item[0].result = yellowResult;
      score = 0.5;
    }

    item[0].element_in_municipality_model_percentage =
      elementInMunicipalityModelPercentage + "%";
    item[0].element_in_eurovoc_percentage = elementInEurovocPercentage + "%";
    item[0].element_not_in_municipality_vocabulary =
      elementInfoMunicipalityVocabulary.elementNotIncluded.join(", ");
    item[0].element_not_in_eurovoc_vocabulary =
      elementInfoEurovocVocabulary.elementNotIncluded.join(", ");

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;
