"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import got from "got";
import * as cheerio from "cheerio";

import { checkOrder } from "../../../utils/utils";
import { secondaryMenuItems } from "../../../storage/school/menuItems";

const Audit = lighthouse.Audit;

const greenResult =
  "Almeno il 30% delle voci del menù di secondo livello sono corrette e si trovano nella posizione giusta.";
const yellowResult =
  "Almeno il 30% delle voci del menù di secondo livello sono corrette ma l'ordine è sbagliato.";
const redResult =
  "Non è presente nessuna voce corretta nel menù di secondo livello.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-menu-scuola-second-level-structure-match-model",
      title:
        "VOCI DI MENÙ DI SECONDO LIVELLO - Il sito presenta almeno il 30% delle voci di menu di secondo livello in base a quanto descritto dal modello di sito per le scuole.",
      failureTitle:
        "VOCI DI MENÙ DI SECONDO LIVELLO - Il sito presenta almeno il 30% delle voci di menu di secondo livello in base a quanto descritto dal modello di sito per le scuole.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "CONDIZIONI DI SUCCESSO: almeno il 30% delle voci del menù di secondo livello verificati corrispondono a quelli indicati nel documento di architettura dell'informazione del modello scuole e sono nell'ordine corretto; MODALITÀ DI VERIFICA: viene verificata la correttezza delle voci del menù di secondo livello presenti all'interno della pagina \"La scuola\" e il loro ordine; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Scuole.](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/v2022.1/index.html)",
      requiredArtifacts: ["menuStructureScuolaSecondLevelMatchModel"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & {
      menuStructureScuolaSecondLevelMatchModel: string;
    }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.menuStructureScuolaSecondLevelMatchModel;

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      {
        key: "correct_voices_percentage",
        itemType: "text",
        text: "% Voci corrette identificate",
      },
      {
        key: "correct_voices",
        itemType: "text",
        text: "Voci di menù corrette identificate",
      },
      {
        key: "missing_voices",
        itemType: "text",
        text: "Voci di menù mancanti",
      },
      {
        key: "wrong_voices_order",
        itemType: "text",
        text: "Voci di menù corrette ma in ordine errato",
      },
    ];

    let items = [
      {
        result: redResult,
        correct_voices_percentage: "",
        correct_voices: "",
        wrong_voices_order: "",
        missing_voices: "",
      },
    ];

    let score = 0;

    const response = await got(url);
    const $: CheerioAPI = cheerio.load(response.body);

    const secondaryMenuScuolaItems: Array<string> = secondaryMenuItems.Scuola;

    const headerUl = $("#menu-la-scuola").find("li");
    let numberOfMandatoryVoicesPresent = 0;
    const elementsFound: Array<string> = [];
    let correctElementsFound: Array<string> = [];
    for (const element of headerUl) {
      if (secondaryMenuScuolaItems.includes($(element).text().trim())) {
        numberOfMandatoryVoicesPresent++;
        correctElementsFound.push($(element).text().trim());
      }

      elementsFound.push($(element).text().trim());
    }

    const missingVoicesPercentage =
      ((secondaryMenuScuolaItems.length - numberOfMandatoryVoicesPresent) /
        secondaryMenuScuolaItems.length) *
      100;

    let correctOrder = true;
    const correctOrderResult = await checkOrder(
      secondaryMenuScuolaItems,
      elementsFound
    );
    if (correctOrderResult.numberOfElementsNotInSequence > 0) {
      correctOrder = false;
    }

    if (missingVoicesPercentage > 30) {
      score = 0;
    } else if (missingVoicesPercentage <= 30 && !correctOrder) {
      score = 0.5;
      items[0].result = yellowResult;
    } else if (missingVoicesPercentage <= 30 && correctOrder) {
      score = 1;
      items[0].result = greenResult;
    }

    items[0].correct_voices = correctElementsFound.join(", ");
    items[0].correct_voices_percentage = (100 - missingVoicesPercentage)
      .toFixed(0)
      .toString();
    items[0].wrong_voices_order =
      correctOrderResult.elementsNotInSequence.join(", ");
    items[0].missing_voices = secondaryMenuScuolaItems
      .filter((x) => !correctElementsFound.includes(x))
      .join(", ");

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
