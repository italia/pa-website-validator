"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { auditDictionary } from "../../storage/auditDictionary";
import { CheerioAPI } from "cheerio";
import { loadPageData, urlExists } from "../../utils/utils";
import { legalNotes } from "../../storage/common/legalNotes";

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
        key: "page_section",
        itemType: "text",
        text: "Il titolo della sezione è corretto",
      },
      {
        key: "page_contains_correct_text",
        itemType: "text",
        text: "La dicitura è corretta",
      },
    ];

    const items = [
      {
        result: auditData.redResult,
        link_name: "",
        link_destination: "",
        page_section: "",
        page_contains_correct_text: "",
      },
    ];

    const dataElementLegalNotes = `[data-element="${legalNotes.dataElement}"]`;
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

      items[0].link_name = legalNotesElements.text().trim() ?? "";
      items[0].page_section = "No";
      items[0].page_contains_correct_text = "No";

      $ = await loadPageData(elementObj.href);
      const sectionDataElement = `[data-element="${legalNotes.section.dataElement}"]`;
      const sectionElement = $(sectionDataElement);
      const sectionTitle = sectionElement?.text().trim().toLowerCase() ?? "";
      if (
        sectionElement.length > 0 &&
        sectionTitle === legalNotes.section.title.toLowerCase()
      ) {
        items[0].page_section = "Sì";
      }

      const bodyDataElement = `[data-element="${legalNotes.body.dataElement}"]`;
      const bodyElements = $(bodyDataElement);
      let textBody = "";
      for (const bodyElement of bodyElements) {
        textBody += $(bodyElement)?.text().trim().toLowerCase() ?? "";
      }
      if (textBody === legalNotes.body.text.toLowerCase()) {
        items[0].page_section = "Sì";
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
