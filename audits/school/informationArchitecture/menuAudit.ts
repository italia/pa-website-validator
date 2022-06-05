"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import got from "got";
import * as cheerio from "cheerio";
import { primaryMenuItems } from "../../../storage/school/menuItems";

const Audit = lighthouse.Audit;

class LoadAudit extends lighthouse.Audit {
  static get meta() {
    return {
      id: "school-menu-structure-match-model",
      title: "Le voci del menù rispettano il modello",
      failureTitle:
        "Il menu non rispetta le indicazioni fornite dal modello: non sono presenti le voci obbligatorie oppure sono in ordine scorretto prima delle non obbligatorie",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "Test per verificare il rispetto delle regole per la costruzione del menu principale",
      requiredArtifacts: ["menuStructureMatchModel"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { menuStructureMatchModel: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.menuStructureMatchModel;

    let score = 0;
    const headings = [
      { key: "menu_elements", itemType: "text", text: "Elementi del menù" },
      {
        key: "required_menu_elements",
        itemType: "text",
        text: "Elementi richiesti (in questo ordine)",
      },
      {
        key: "required_menu_elements_presence",
        itemType: "text",
        text: "Elementi obbligatori presenti",
      },
      {
        key: "required_menu_elements_correct_order",
        itemType: "text",
        text: "Elementi obbligatori presenti e ordinati correttamente",
      },
      {
        key: "model_link",
        itemType: "text",
        text: "Link al modello di riferimento",
      },
    ];

    const response = await got(url);
    const $ = cheerio.load(response.body);

    const menuElements = getMenuElements($);
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
    } else if (
      menuElements.length > 4 &&
      menuElements.length < 7 &&
      containsMandatoryElementsResult &&
      mandatoryElementsCorrectOrder
    ) {
      score = 0.5;
    }

    const items = [
      {
        menu_elements: menuElements.join(", "),
        required_menu_elements: primaryMenuItems.join(", "),
        required_menu_elements_presence: containsMandatoryElementsResult
          ? "Sì"
          : "No",
        required_menu_elements_correct_order: mandatoryElementsCorrectOrder
          ? "Sì"
          : "No",
        model_link:
          "https://docs.google.com/drawings/d/1qzpCZrTc1x7IxdQ9WEw_wO0qn-mUk6mIRtSgJlmIz7g/edit",
      },
    ];

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
