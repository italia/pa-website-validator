"use strict";

import { CheerioAPI } from "cheerio";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { loadPageData, urlExists } from "../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult = "Il link è nel footer e invia alla pagina corretta.";
const redResult =
  "Il link non è nel footer o non invia alla pagina corretta o la pagina non esiste.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-legislation-accessibility-declaration-is-present",
      title:
        "C.SC.2.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito della scuola deve esporre la dichiarazione di accessibilità.",
      failureTitle:
        "C.SC.2.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito della scuola deve esporre la dichiarazione di accessibilità.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        'CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta alla dichiarazione di accessibilità di AgID, in conformità al modello e alle linee guida rese disponibile da AgID in ottemperanza alla normativa vigente in materia di accessibilità, con livelli di accessibilità contemplati nelle specifiche tecniche WCAG 2.1; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, che riporti a una pagina esistente e che sia quella contenente la dichiarazione di accessibilità (il link deve iniziare con "https://form.agid.gov.it/view/"), ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: AgID Dichiarazione di accessibilità, AgID Linee guida sull’accessibilità degli strumenti informatici, Direttiva UE n. 2102/2016, Legge 9 gennaio 2004 n. 4, Web Content Accessibility Guidelines WCAG 2.1, [Dichiarazione di accessibilità](https://www.agid.gov.it/it/design-servizi/accessibilita/dichiarazione-accessibilita), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & {
      origin: string;
    }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;
    let score = 0;

    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
      },
      {
        key: "link_name",
        itemType: "text",
        text: "Nome del link",
      },
      {
        key: "link_destination",
        itemType: "text",
        text: "Destinazione link",
      },
      {
        key: "existing_page",
        itemType: "text",
        text: "Pagina esistente",
      },
    ];

    const items = [
      {
        result: redResult,
        link_name: "",
        link_destination: "",
        existing_page: "No",
      },
    ];

    const $: CheerioAPI = await loadPageData(url);
    const accessibilityDeclarationElement = $("footer").find(
      '[data-element="accessibility-link"]'
    );
    const elementObj = $(accessibilityDeclarationElement).attr();
    items[0].link_name = accessibilityDeclarationElement.text().trim() ?? "";

    if (Boolean(elementObj) && "href" in elementObj) {
      items[0].link_destination = elementObj.href;

      if (!elementObj.href.includes("https://form.agid.gov.it")) {
        items[0].result += " L'url deve iniziare con: https://form.agid.gov.it";
        return {
          score: 0,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      const checkUrl = await urlExists(url, elementObj.href);
      if (!checkUrl.result) {
        items[0].result += checkUrl.reason;
        return {
          score: 0,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      items[0].existing_page = "Sì";
      items[0].result = greenResult;
      score = 1;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
