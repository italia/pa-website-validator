"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { primaryMenuItems } from "../../storage/municipality/menuItems";
import {
  checkOrder,
  getPageElementDataAttribute,
  loadPageData,
} from "../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult = "Le voci del menù sono corrette e nell'ordine giusto.";
const yellowResult =
  "L'ordine delle voci del menu è corretto ma sono presenti fino a 3 voci aggiuntive.";
const redResult =
  "Almeno una delle voci obbligatorie è assente o inesatta e/o le voci obbligatorie sono in ordine errato e/o sono presenti 8 o più voci nel menù del sito.";

class LoadAudit extends lighthouse.Audit {
  static get meta() {
    return {
      id: "municipality-menu-structure-match-model",
      title:
        "C.SI.1.6 - VOCI DI MENÙ DI PRIMO LIVELLO - Il sito comunale deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito comunale.",
      failureTitle:
        "C.SI.1.6 - VOCI DI MENÙ DI PRIMO LIVELLO - Il sito comunale deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito comunale.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "CONDIZIONI DI SUCCESSO: le voci del menù di primo livello del sito sono esattamente quelle indicate nel documento di architettura dell'informazione e sono nell'ordine indicato (ovvero Amministrazione, Novità, Servizi, Vivere il Comune); MODALITÀ DI VERIFICA: ricercando uno specifico attributo \"data-element\" come spiegato nella documentazione tecnica, vengono identificate le voci presenti nel menù del sito, il loro ordine e confrontate con quanto indicato nel documento di architettura dell'informazione, applicando una tolleranza di massimo 3 voci aggiuntive; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
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
      '[data-element="main-navigation"]',
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

    if (
      menuElements.length === 4 &&
      containsMandatoryElementsResult &&
      orderResult.numberOfElementsNotInSequence === 0
    ) {
      score = 1;
      items[0].result = greenResult;
    } else if (
      menuElements.length > 4 &&
      menuElements.length < 8 &&
      containsMandatoryElementsResult &&
      orderResult.numberOfElementsNotInSequence === 0
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
