"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { loadPageData } from "../../utils/utils";
import {
  getRandomThirdLevelPagesUrl,
  getPrimaryPageUrl,
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
    const servicesPage = await getPrimaryPageUrl(url, "all-services");

    if (servicesPage === "") {
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

    const bookingAppointmentPage = await getPrimaryPageUrl(
      servicesPage,
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
      inspected_page: servicesPage,
      component_exist: "Sì",
      correct_breadcrumb: "Sì",
      in_page_url: "Non si applica",
    };

    let score = 1;

    correctItems.push(item);

    const randomServices = await getRandomThirdLevelPagesUrl(
      url,
      await getPrimaryPageUrl(url, primaryMenuItems.services.data_element),
      `[data-element="${primaryMenuItems.services.third_item_data_element}"]`,
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

    for (const randomService of randomServices) {
      $ = await loadPageData(randomService);
      const item = {
        inspected_page: randomService,
        component_exist: "Sì",
        in_page_url: "No",
      };

      const bookingAppointmentServicePage = await getPrimaryPageUrl(
        randomService,
        "appointment-booking"
      );

      if (bookingAppointmentServicePage === "") {
        item.component_exist = "No";
      }

      const inPageButton = $('[data-element="service-booking-access"]');
      if (inPageButton.length > 0) {
        item.in_page_url = "Sì";
      }

      if (
        bookingAppointmentServicePage !== bookingAppointmentPage ||
        score > 0
      ) {
        score = 0;
      }

      if (
        bookingAppointmentServicePage === "" ||
        bookingAppointmentServicePage !== bookingAppointmentPage
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
        title_in_page_url: titleSubHeadings[1],
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
        title_in_page_url: titleSubHeadings[1],
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
