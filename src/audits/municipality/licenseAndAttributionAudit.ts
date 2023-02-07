"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { auditDictionary } from "../../storage/auditDictionary";
import { CheerioAPI } from "cheerio";
import { loadPageData, urlExists } from "../../utils/utils";

const Audit = lighthouse.Audit;

const auditId = "municipality-license-and-attribution";
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
        key: "page_section",
        itemType: "text",
        text: "Sezione trovata nella pagine analizzata",
      },
      {
        key: "page_contains_correct_text",
        itemType: "text",
        text: "La sezione indicata contiene il testo necessario",
      },
    ];

    const items = [
      {
        result: auditData.redResult,
        link_destination: "",
        existing_page: "No",
        page_section: "",
        page_contains_correct_text: "No",
      },
    ];

    const dataElementLegalNotes = '[data-element=""]';
    let $: CheerioAPI = await loadPageData(url);
    const legalNotesElements = $("footer").find(dataElementLegalNotes);
    const elementObj = $(legalNotesElements).attr();

    if (elementObj && "href" in elementObj && elementObj["href"] !== "#") {
      items[0].link_destination = elementObj.href;

      const checkUrl = await urlExists(url, elementObj.href);
      if (!checkUrl.result) {
        return {
          score: 0,
          details: Audit.makeTableDetails(headings, items),
        };
      }

      items[0].existing_page = "Sì";

      $ = await loadPageData(elementObj.href);
      const sectionDataElement = '[data-element=""]';
      const sectionElement = $(sectionDataElement);

      if (sectionElement.length > 0) {
        //TODO: define where the title and the text is
      }

      items[0].page_contains_correct_text = "Sì";
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
