"use strict";

import { CheerioAPI } from "cheerio";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

import { getAllPageHTML, loadPageData, urlExists } from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

const auditId = "municipality-legislation-accessibility-declaration-is-present";
const auditData = auditDictionary[auditId];

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
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
        text: "Testo del link",
      },
      {
        key: "link_destination",
        itemType: "url",
        text: "Pagina di destinazione del link",
      },
      {
        key: "existing_page",
        itemType: "text",
        text: "Pagina esistente",
      },
      {
        key: "page_contains_correct_url",
        itemType: "text",
        text: "La pagina contiene l'url del sito di origine",
      },
      {
        key: "wcag",
        itemType: "text",
        text: "È dichiarata la conformità alle specifiche WCAG 2.1",
      },
    ];

    const items = [
      {
        result: auditData.redResult,
        link_name: "",
        link_destination: "",
        existing_page: "No",
        page_contains_correct_url: "",
        wcag: "",
      },
    ];

    const $: CheerioAPI = await loadPageData(url);

    const accessibilityDeclarationElement = $("footer").find(
      '[data-element="accessibility-link"]'
    );
    const elementObj = $(accessibilityDeclarationElement).attr();
    items[0].link_name = accessibilityDeclarationElement.text().trim() ?? "";
    items[0].link_destination = elementObj?.href ?? "";

    if (
      elementObj &&
      "href" in elementObj &&
      elementObj.href !== "#" &&
      elementObj.href !== ""
    ) {
      const href = elementObj.href;
      const checkUrl = await urlExists(url, href);

      if (checkUrl.exception)
        throw new Error("Possibile errore del server AGID, verificare.");

      if (!checkUrl.result) {
        return {
          score: 0,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      items[0].existing_page = "Sì";
      items[0].page_contains_correct_url = "No";
      items[0].wcag = "No";

      if (!href.includes("https://form.agid.gov.it/view/")) {
        return {
          score: 0,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      const domain = new URL(url).host.replace(/^www./, "");

      const privacyPageHTML: string = await getAllPageHTML(href);
      if (!privacyPageHTML.match(new RegExp(domain, "i"))) {
        return {
          score: 0,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      items[0].page_contains_correct_url = "Sì";

      if (!privacyPageHTML.match(/wcag 2.1/i)) {
        return {
          score: 0,
          details: Audit.makeTableDetails(headings, items),
        };
      } else {
        items[0].wcag = "Sì";
      }

      items[0].result = auditData.greenResult;
      score = 1;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
