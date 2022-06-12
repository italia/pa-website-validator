"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { loadPageData } from "../../../utils/utils"

const Audit = lighthouse.Audit;

const greenResult = "Il link è corretto e nella posizione corretta.";
const redResult = "Il link è errato o non è nella posizione corretta.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-legislation-accessibility-declaration-is-present",
      title:
        "DICHIARAZIONE DI ACCESSIBILITÀ - Il sito scuola deve esporre la dichiarazione di accessibilità.",
      failureTitle:
        "DICHIARAZIONE DI ACCESSIBILITÀ - Il sito scuola deve esporre la dichiarazione di accessibilità.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta alla dichiarazione di accessibilità di AgID, in conformità al modello e alle linee guida rese disponibile da AgID in ottemperanza alla normativa vigente in materia di accessibilità, con livelli di accessibilità contemplati nelle specifiche tecniche WCAG 2.1; MODALITÀ DI VERIFICA: viene verificata la presenza e posizione del link nel footer e che riporti correttamente ad AgID; RIFERIMENTI TECNICI E NORMATIVI: AgID Dichiarazione di accessibilità, AgID Linee guida sull’accessibilità degli strumenti informatici, Direttiva UE n. 2102/2016, Legge 9 gennaio 2004 n. 4, Web Content Accessibility Guidelines WCAG 2.1.",
      requiredArtifacts: ["legislationAccessibilityDeclarationIsPresent"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & {
      legislationAccessibilityDeclarationIsPresent: string;
    }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.legislationAccessibilityDeclarationIsPresent;
    let score = 0

    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
      },
      {
        key: "link_destination",
        itemType: "text",
        text: "Destinazione link",
      },
    ];

    let items = [
      {
        result: redResult,
        link_destination: "",
      },
    ];

    const $: CheerioAPI = await loadPageData(url)
    const accessibilityDeclarationElement = $("#dichiarazione-accessibilita")
    const elementObj = $(accessibilityDeclarationElement).attr()

    if (Boolean(elementObj) && ("href" in elementObj) && elementObj.href !== '#' && elementObj.href !== '' && elementObj.href.includes("form.agid.gov.it")) {
      items[0].result = greenResult
      items[0].link_destination = elementObj.href
      score = 1
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
