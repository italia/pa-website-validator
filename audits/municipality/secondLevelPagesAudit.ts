"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  buildUrl,
  getHREFValuesDataAttribute,
  loadPageData,
} from "../../utils/utils";
import { secondLevelPageNames } from "../../storage/municipality/controlledVocabulary";

const Audit = lighthouse.Audit;

const greenResult = "Almeno il 50% dei titoli delle pagine è corretto.";
const redResult = "Meno del 50% dei titoli delle pagine è corretto.";
const notExecuted =
  'Non è stato possibile condurre il test. Controlla le "Modalità di verifica" per scoprire di più.';

class LoadAudit extends lighthouse.Audit {
  static get meta() {
    return {
      id: "municipality-second-level-pages",
      title:
        "C.SI.1.7 - TITOLI DELLE PAGINE DI SECONDO LIVELLO - Nel sito comunale, i titoli delle pagine di secondo livello devono rispettare il vocabolario descritto dalla documentazione del modello di sito comunale.",
      failureTitle:
        "C.SI.1.7 - TITOLI DELLE PAGINE DI SECONDO LIVELLO - Nel sito comunale, i titoli delle pagine di secondo livello devono rispettare il vocabolario descritto dalla documentazione del modello di sito comunale.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        'CONDIZIONI DI SUCCESSO: almeno il 50% dei titoli delle pagine di secondo livello verificati corrispondono a quelli indicati nel documento di architettura dell\'informazione del modello Comuni; MODALITÀ DI VERIFICA: viene verificata la correttezza dei titoli delle pagine di II livello accessibili dalla pagina di I livello "Servizi"; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/v2022.1/index.html)',
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
      {
        key: "correct_title_percentage",
        itemType: "text",
        text: "% dei titoli corretti identificati",
      },
      {
        key: "correct_title_found",
        itemType: "text",
        text: "Titoli corretti identificati",
      },
      {
        key: "wrong_title_found",
        itemType: "text",
        text: "Titoli errati identificati",
      },
    ];

    const items = [
      {
        result: redResult,
        correct_title_percentage: "",
        correct_title_found: "",
        wrong_title_found: "",
      },
    ];

    let $: CheerioAPI = await loadPageData(url);

    const secondLevelPageHref = await getHREFValuesDataAttribute(
      $,
      '[data-element="all-services"]'
    );
    if (secondLevelPageHref.length <= 0) {
      items[0].result = notExecuted + " - pagina servizi non trovata";
      return {
        score: score,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    let secondLevelPageUrl = secondLevelPageHref[0];
    if (!secondLevelPageUrl.includes(url)) {
      secondLevelPageUrl = await buildUrl(url, secondLevelPageHref[0]);
    }

    $ = await loadPageData(secondLevelPageUrl);
    const servicesSecondLevelPages = await getHREFValuesDataAttribute(
      $,
      '[data-element="service-category-link"]'
    );

    if (servicesSecondLevelPages.length <= 0) {
      items[0].result =
        notExecuted + " - pagina servizio di secondo livello non trovata";
      return {
        score: score,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    const pageTitles = [];
    for (let page of servicesSecondLevelPages) {
      if (!page.includes(url)) {
        page = await buildUrl(url, page);
      }

      $ = await loadPageData(page);
      const title = $('[data-element="page-name"]').text().trim() ?? "";

      if (title) {
        pageTitles.push(title);
      }
    }

    const pagesInVocabulary = [];
    const pagesNotInVocabulary = [];
    for (const pageTitle of pageTitles) {
      if (secondLevelPageNames.includes(pageTitle.toLowerCase())) {
        pagesInVocabulary.push(pageTitle.toLowerCase());
      } else {
        pagesNotInVocabulary.push(pageTitle.toLowerCase());
      }
    }

    let pagesFoundInVocabularyPercentage = 0;
    if (pageTitles.length > 0) {
      pagesFoundInVocabularyPercentage = parseInt(
        ((pagesInVocabulary.length / pageTitles.length) * 100).toFixed(0)
      );
    }

    if (pagesFoundInVocabularyPercentage > 50) {
      items[0].result = greenResult;
      score = 1;
    }

    items[0].correct_title_percentage = pagesFoundInVocabularyPercentage + "%";
    items[0].correct_title_found = pagesInVocabulary.join(", ");
    items[0].wrong_title_found = pagesNotInVocabulary.join(", ");

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
