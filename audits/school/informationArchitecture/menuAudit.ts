"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import got from "got";
import * as cheerio from "cheerio";
import { primaryMenuItems } from "../../../storage/school/menuItems";
import { checkOrder } from "../../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult = "Le voci del menù del sito e il loro ordine è corretto.";
const yellowResult =
  "Sono presenti fino a 2 voci aggiuntive nel menù del sito.";
const redResult =
  "Almeno una delle voci obbligatorie è assente o inesatta e/o le voci sono in ordine errato e/o sono presenti 7 o più voci nel menù del sito.";

class LoadAudit extends lighthouse.Audit {
  static get meta() {
    return {
      id: "school-menu-structure-match-model",
      title:
        "VOCI DI MENÙ DI PRIMO LIVELLO - Il sito scuola deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito scuola.",
      failureTitle:
        "VOCI DI MENÙ DI PRIMO LIVELLO - Il sito scuola deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito scuola.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "CONDIZIONI DI SUCCESSO: le voci di menù del sito sono esattamente quelle indicate nel documento di architettura dell'informazione e sono nell'ordine indicato, ovvero La scuola, Servizi, Novità, Didattica; MODALITÀ DI VERIFICA: vengono identificate le voci presenti nel menù del sito e il loro ordine, confrontandole con quanto indicato nel documento di architettura dell'informazione, applicando una tolleranza di 2 voci aggiuntive; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Scuole.](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/v2022.1/index.html)",
      requiredArtifacts: ["menuStructureMatchModel"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { menuStructureMatchModel: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.menuStructureMatchModel;

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

    let items = [
      {
        result: redResult,
        found_menu_voices: "",
        missing_menu_voices: "",
        wrong_order_menu_voices: "",
      },
    ];

    const response = await got(url);
    const $ = cheerio.load(response.body);

    const menuElements = getMenuElements($);
    items[0].found_menu_voices = menuElements.join(", ");

    const missingMandatoryElements = missingMandatoryItems(
      menuElements,
      primaryMenuItems
    );
    items[0].missing_menu_voices = missingMandatoryElements.join(", ");

    const orderResult = await checkOrder(primaryMenuItems, menuElements);
    items[0].wrong_order_menu_voices =
      orderResult.elementsNotInSequence.join(", ");

    const containsMandatoryElementsResult = containsMandatoryElements(
      menuElements,
      primaryMenuItems
    );
    const mandatoryElementsCorrectOrder = correctOrderMandatoryElements(
      menuElements,
      primaryMenuItems
    );

    if (
      menuElements.length === 4 &&
      containsMandatoryElementsResult &&
      mandatoryElementsCorrectOrder
    ) {
      score = 1;
      items[0].result = greenResult;
    } else if (
      menuElements.length > 4 &&
      menuElements.length < 7 &&
      containsMandatoryElementsResult &&
      mandatoryElementsCorrectOrder
    ) {
      score = 0.5;
      items[0].result = yellowResult;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;

function getMenuElements($: CheerioAPI): string[] {
  const headerUl = $("#menup").find("> li > a");

  const elements = [];
  for (const element of headerUl) {
    elements.push($(element).text().trim());
  }

  return elements;
}

function containsMandatoryElements(
  menuElements: string[],
  mandatoryElements: string[]
): boolean {
  let result = true;

  for (const element of mandatoryElements) {
    if (!menuElements.includes(element)) {
      result = false;
    }
  }

  return result;
}

function correctOrderMandatoryElements(
  menuElements: string[],
  mandatoryElements: string[]
): boolean {
  let result = true;

  for (let i = 0; i < mandatoryElements.length; i++) {
    if (menuElements[i] !== mandatoryElements[i]) {
      result = false;
    }
  }

  return result;
}

function missingMandatoryItems(
  menuElements: string[],
  mandatoryElements: string[]
): string[] {
  let missingItems: string[] = [];

  for (const mandatoryElement of mandatoryElements) {
    if (!menuElements.includes(mandatoryElement)) {
      missingItems.push(mandatoryElement);
    }
  }

  return missingItems;
}
