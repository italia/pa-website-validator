"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { primaryMenuItems } from "../../storage/school/menuItems";
import {
  checkOrder,
  getPageElementDataAttribute,
  loadPageData,
} from "../../utils/utils";

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
        "C.SC.1.4 - VOCI DI MENÙ DI PRIMO LIVELLO - Il sito scuola deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito scuola.",
      failureTitle:
        "C.SC.1.4 - VOCI DI MENÙ DI PRIMO LIVELLO - Il sito scuola deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito scuola.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "CONDIZIONI DI SUCCESSO: le voci di menù del sito sono esattamente quelle indicate nel documento di architettura dell'informazione e sono nell'ordine indicato, ovvero La scuola, Servizi, Novità, Didattica; MODALITÀ DI VERIFICA: vengono identificate le voci presenti nel menù del sito e il loro ordine, confrontandole con quanto indicato nel documento di architettura dell'informazione, applicando una tolleranza di 2 voci aggiuntive; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Scuole.](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/v2022.1/index.html)",
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

    const $: CheerioAPI = await loadPageData(url);

    const foundMenuElements = await getPageElementDataAttribute(
      $,
      '[data-element="menu"]',
      "> li > a"
    );

    const menuElements = [];
    for (const element of foundMenuElements) {
      menuElements.push(element.toLowerCase());
    }

    items[0].found_menu_voices = menuElements.join(", ");

    const primaryMenuItemsToLower: string[] = [];
    for (const element of primaryMenuItems) {
      primaryMenuItemsToLower.push(element.toLowerCase());
    }

    const missingMandatoryElements = missingMandatoryItems(
      menuElements,
      primaryMenuItemsToLower
    );
    items[0].missing_menu_voices = missingMandatoryElements.join(", ");

    const orderResult = await checkOrder(primaryMenuItemsToLower, menuElements);
    items[0].wrong_order_menu_voices =
      orderResult.elementsNotInSequence.join(", ");

    const containsMandatoryElementsResult = containsMandatoryElements(
      menuElements,
      primaryMenuItemsToLower
    );
    const mandatoryElementsCorrectOrder = correctOrderMandatoryElements(
      menuElements,
      primaryMenuItemsToLower
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
  const missingItems: string[] = [];

  for (const mandatoryElement of mandatoryElements) {
    if (!menuElements.includes(mandatoryElement)) {
      missingItems.push(mandatoryElement);
    }
  }

  return missingItems;
}
