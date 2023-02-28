"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  buildUrl,
  checkBreadcrumb,
  getHREFValuesDataAttribute,
  getPageElementDataAttribute,
  isInternalUrl,
  loadPageData,
} from "../../utils/utils";
import {
  getRandomThirdLevelPagesUrl,
  getPrimaryPageUrl,
  getSinglePageUrl,
} from "../../utils/municipality/utils";
import { auditDictionary } from "../../storage/auditDictionary";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";
import { primaryMenuItems } from "../../storage/municipality/menuItems";

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

    const titleSubHeadings = [
      "Componente individuato",
      "La breadcrumb rispetta i requisiti",
      'Nella sezione "Accedi al servizio" della scheda servizio è presente il pulsante di prenotazione appuntamento',
    ];
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
        subItemsHeading: { key: "inspected_page", itemType: "url" },
      },
      {
        key: "title_component_exist",
        itemType: "text",
        text: "",
        subItemsHeading: {
          key: "component_exist",
          itemType: "text",
        },
      },
      {
        key: "title_correct_breadcrumb",
        itemType: "text",
        text: "",
        subItemsHeading: {
          key: "correct_breadcrumb",
          itemType: "text",
        },
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
    if (
      (await isInternalUrl(servicePageUrl)) &&
      !servicePageUrl.includes(url)
    ) {
      servicePageUrl = await buildUrl(url, servicePageUrl);
    }

    const bookingAppointmentPage = await getSinglePageUrl(
      servicePageUrl,
      "appointment-booking"
    );

    if (bookingAppointmentPage === "") {
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

    const item = {
      inspected_page: servicePageUrl,
      component_exist: "Sì",
      correct_breadcrumb: "Sì",
      in_page_url: "Non si applica",
    };

    let score = 1;
    $ = await loadPageData(bookingAppointmentPage);
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
      item.correct_breadcrumb = "No";
      wrongItems.push(item);
    } else {
      correctItems.push(item);
    }

    const randomServicesUrl = await getRandomThirdLevelPagesUrl(
      url,
      await getPrimaryPageUrl(url, primaryMenuItems.services.data_element),
      `[data-element="${primaryMenuItems.services.third_item_data_element}"]`,
      auditVariables.numberOfServicesToBeScanned
    );

    if (randomServicesUrl.length === 0) {
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

    for (const randomService of randomServicesUrl) {
      const item = {
        inspected_page: randomService,
        component_exist: "Sì",
        correct_breadcrumb: score === 0 ? "No" : "Sì",
        in_page_url: "No",
      };

      const bookingAppointmentServicePage = await getSinglePageUrl(
        randomService,
        "appointment-booking"
      );

      const inPageButton = $('[data-element="appointment-booking"]');
      if (inPageButton.length > 0) {
        item.in_page_url = "Sì";
      }

      if (bookingAppointmentServicePage !== "") {
        item.component_exist = "No";
      }

      if (bookingAppointmentServicePage !== bookingAppointmentPage) {
        if (score > 0) {
          score = 0;
        }
        item.correct_breadcrumb = "No";
      }

      if (
        bookingAppointmentServicePage !== "" ||
        bookingAppointmentServicePage !== bookingAppointmentPage ||
        item.correct_breadcrumb === "No"
      ) {
        wrongItems.push(item);
        continue;
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
        title_component_exist: titleSubHeadings[0],
        title_correct_breadcrumb: titleSubHeadings[1],
        title_in_page_url: titleSubHeadings[2],
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
        title_component_exist: titleSubHeadings[0],
        title_correct_breadcrumb: titleSubHeadings[1],
        title_in_page_url: titleSubHeadings[2],
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
