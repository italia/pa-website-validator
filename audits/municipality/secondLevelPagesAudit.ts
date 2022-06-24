"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  buildUrl,
  getHREFValuesDataAttribute, getPageElementDataAttribute,
  loadPageData,
} from "../../utils/utils";
import { secondLevelPageNames } from "../../storage/municipality/vocabulary";

const Audit = lighthouse.Audit;

const greenResult = "Almeno il 50% dei titoli delle pagine è corretto.";
const redResult =
  "Meno del 50% dei titoli delle pagine è corretto.";
const notExecuted = "Non è stato possibile condurre il test. Controlla le \"Modalità di verifica\" per scoprire di più."

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
      "CONDIZIONI DI SUCCESSO: almeno il 50% dei titoli delle pagine di secondo livello verificati corrispondono a quelli indicati nel documento di architettura dell'informazione del modello Comuni; MODALITÀ DI VERIFICA: viene verificata la correttezza dei titoli delle pagine di II livello accessibili dalla pagina di I livello \"Servizi\"; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/v2022.1/index.html)",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    //const url = artifacts.origin;
    const url = 'http://wp-scuole.local/design-comuni-pagine-statiche/new-templates/dist/template-homepage.html'

    let score = 0;
    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      {
        key: "found_menu_voices",
        itemType: "text",
        text: "Voci del menù identificate",
      },
      {
        key: "missing_menu_voices",
        itemType: "text",
        text: "Voci del menù mancanti",
      },
      {
        key: "wrong_order_menu_voices",
        itemType: "text",
        text: "Voci del menù in ordine errato",
      },
    ];

    const items = [
      {
        result: redResult,
        found_menu_voices: "",
        missing_menu_voices: "",
        wrong_order_menu_voices: "",
      },
    ];

    let $: CheerioAPI = await loadPageData(url);

    const secondLevelPageHref = await getHREFValuesDataAttribute($, '[data-element="management"]')
    if (secondLevelPageHref.length <= 0) {
      items[0].result = notExecuted + ' - pagina amministrazione non trovata'
      return {
        score: score,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    let secondLevelPageUrl = secondLevelPageHref[0]
    if (!secondLevelPageUrl.includes(url)) {
      secondLevelPageUrl = await buildUrl(url, secondLevelPageHref[0])
    }

    $ = await loadPageData(secondLevelPageUrl)
    const pageNames = await getPageElementDataAttribute($, '[data-element="amministration-element"]')

    console.log('PAGE NAMES', pageNames)

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;