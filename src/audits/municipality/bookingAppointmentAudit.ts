"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  buildUrl,
  checkBreadcrumb,
  getHREFValuesDataAttribute,
  getPageElementDataAttribute,
  loadPageData,
} from "../../utils/utils";
import {
  getRandomThirdLevelPagesUrl,
  getServicePageUrl,
} from "../../utils/municipality/utils";
import { auditDictionary } from "../../storage/auditDictionary";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";

const Audit = lighthouse.Audit;

const auditId = "municipality-booking-appointment-check";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

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

    const titleSubHeadings = ["Bottone di prenotazione in pagina?"];
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
        subItemsHeading: { key: "inspected_page", itemType: "url" },
      },
      {
        key: "title_in_page_url",
        itemType: "text",
        text: "",
        subItemsHeading: {
          key: "in_page_url",
          itemType: "text",
        },
      },
    ];

    let $ = await loadPageData(url);

    const servicesPage = await getHREFValuesDataAttribute(
      $,
      '[data-element="all-services"]'
    );

    if (servicesPage.length === 0) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: auditData.nonExecuted,
            },
          ]
        ),
      };
    }

    let servicePageUrl = servicesPage[0];

    if (!servicePageUrl.includes(url)) {
      servicePageUrl = await buildUrl(url, servicePageUrl);
    }

    $ = await loadPageData(servicePageUrl);
    const bookingAppointmentPage = await getHREFValuesDataAttribute(
      $,
      '[data-element="appointment-booking"]'
    );

    if (bookingAppointmentPage.length === 0) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: auditData.nonExecuted,
            },
          ]
        ),
      };
    }

    const bookingAppointmentUrl = bookingAppointmentPage[0];

    let score = 1;
    $ = await loadPageData(bookingAppointmentUrl);
    let breadcrumbElements = await getPageElementDataAttribute(
      $,
      '[data-element="breadcrumb"]',
      "li"
    );
    breadcrumbElements = breadcrumbElements.map((x) =>
      x.trim().toLowerCase().replaceAll("/", "")
    );

    if (!checkBreadcrumb(breadcrumbElements)) {
      score = 0;
    }

    const randomServices: string[] = await getRandomThirdLevelPagesUrl(
      url,
      await getServicePageUrl(url),
      '[data-element="service-link"]',
      auditVariables.numberOfServicesToBeScanned
    );

    if (randomServices.length === 0) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: auditData.nonExecuted,
            },
          ]
        ),
      };
    }

    const correctItems = [];
    const wrongItems = [];

    for (const randomService of randomServices) {
      const item = {
        inspected_page: randomService,
        in_page_url: "No",
      };

      $ = await loadPageData(randomService);
      const bookingAppointmentPage = await getHREFValuesDataAttribute(
        $,
        '[data-element="appointment-booking"]'
      );

      if (
        bookingAppointmentPage.length === 0 ||
        bookingAppointmentPage[0] !== bookingAppointmentUrl
      ) {
        if (score > 0) {
          score = 0;
        }
        wrongItems.push(item);
        continue;
      }

      const inPageButton = $('[data-element="appointment-booking"]');
      if (inPageButton.length > 0) {
        item.in_page_url = "Sì";
      }

      correctItems.push(item);
    }

    const results = [];
    switch (score) {
      case 1:
        results.push({
          result: auditData.greenResult,
        });
        break;
      case 0:
        results.push({
          result: auditData.redResult,
        });
        break;
    }

    results.push({});

    if (wrongItems.length > 0) {
      results.push({
        result: auditData.subItem.redResult,
        title_in_page_url: titleSubHeadings[0],
      });

      for (const item of wrongItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    if (correctItems.length > 0) {
      results.push({
        result: auditData.subItem.greenResult,
        title_in_page_url: titleSubHeadings[0],
      });

      for (const item of correctItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
    };
  }
}

module.exports = LoadAudit;
