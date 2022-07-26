"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  getRandomMunicipalityServiceUrl,
  loadPageData,
} from "../../utils/utils";
import { auditDictionary } from "../../storage/auditDictionary"

const Audit = lighthouse.Audit;

const auditId = "municipality-booking-appointment-check"
const auditData = auditDictionary[auditId]

const greenResult = auditData.greenResult
const yellowResult = auditData.yellowResult
const notExecuted = auditData.nonExecuted

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
    let score = 0.5;

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      { key: "inspected_page", itemType: "text", text: "Pagina ispezionata" },
    ];

    const item = [
      {
        result: yellowResult,
        inspected_page: "",
      },
    ];

    const randomServiceToBeScanned: string =
      await getRandomMunicipalityServiceUrl(url);

    if (!randomServiceToBeScanned) {
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
