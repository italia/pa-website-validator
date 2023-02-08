"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { loadPageData } from "../../utils/utils";
import {
  getRandomThirdLevelPagesUrl,
  getServicePageUrl,
} from "../../utils/municipality/utils";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

const auditId = "municipality-booking-appointment-check";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const redResult = auditData.redResult;
const notExecuted = auditData.nonExecuted;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
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
      { key: "inspected_page", itemType: "text", text: "Pagina ispezionata" },
    ];

    const item = [
      {
        result: redResult,
        inspected_page: "",
      },
    ];

    const randomServices: string[] = await getRandomThirdLevelPagesUrl(
      url,
      await getServicePageUrl(url),
      '[data-element="service-link"]'
    );

    if (randomServices.length === 0) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: notExecuted,
            },
          ]
        ),
      };
    }

    const randomServiceToBeScanned: string = randomServices[0];

    item[0].inspected_page = randomServiceToBeScanned;

    const $ = await loadPageData(randomServiceToBeScanned);
    const bookingAppointmentElement = $('[data-element="appointment-booking"]');
    const elementObj = $(bookingAppointmentElement).attr();
    const elementName = bookingAppointmentElement.text().trim().trim() ?? "";

    if (
      elementObj &&
      "href" in elementObj &&
      elementObj.href !== "#" &&
      elementObj.href !== "" &&
      elementName
    ) {
      score = 1;
      item[0].result = greenResult;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;
