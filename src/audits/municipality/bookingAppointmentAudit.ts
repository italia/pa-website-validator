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
import { errorHandling } from "../../config/commonAuditsParts";

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
  ): Promise<LH.Audit.ProductBase> {
    const url = artifacts.origin;

    const titleSubHeadings = [
      "Componente individuato",
      'Nella sezione "Accedi al servizio" della scheda servizio è presente il pulsante di prenotazione appuntamento',
    ];
    const headings: LH.Audit.Details.TableColumnHeading[] = [
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

    const bookingAppointmentPageUrl = new URL(bookingAppointmentPage);
    const bookingAppointmentPageUrlString =
      bookingAppointmentPageUrl.origin + bookingAppointmentPageUrl.pathname;

    const correctItems = [];
    const wrongItems = [];

    const item = {
      inspected_page: servicesPage,
      component_exist: "Sì",
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

    const pagesInError = [];

    for (const randomService of randomServices) {
      try {
        $ = await loadPageData(randomService);
      } catch (ex) {
        if (!(ex instanceof Error)) {
          throw ex;
        }
        let errorMessage = ex.message;
        errorMessage = errorMessage.substring(
          errorMessage.indexOf('"') + 1,
          errorMessage.lastIndexOf('"')
        );
        pagesInError.push({
          inspected_page: randomService,
          component_exist: errorMessage,
        });
        continue;
      }

      const item = {
        inspected_page: randomService,
        component_exist: "Sì",
        in_page_url: "No",
      };

      const bookingAppointmentServicePage = await getPrimaryPageUrl(
        randomService,
        "appointment-booking"
      );

      let bookingAppointmentServicePageUrlString = "";

      if (bookingAppointmentServicePage === "") {
        item.component_exist = "No";
      } else {
        const bookingAppointmentServicePageUrl = new URL(
          bookingAppointmentServicePage
        );
        bookingAppointmentServicePageUrlString =
          bookingAppointmentServicePageUrl.origin +
          bookingAppointmentServicePageUrl.pathname;
      }

      const inPageButton = $('[data-element="service-booking-access"]');
      if (inPageButton.length > 0) {
        item.in_page_url = "Sì";
      }

      if (
        bookingAppointmentServicePageUrlString !==
          bookingAppointmentPageUrlString &&
        score > 0
      ) {
        score = 0;
      }

      if (
        bookingAppointmentServicePage === "" ||
        bookingAppointmentServicePageUrlString !==
          bookingAppointmentPageUrlString
      ) {
        wrongItems.push(item);
        continue;
      }

      correctItems.push(item);
    }

    const results = [];
    if (pagesInError.length > 0) {
      results.push({
        result: errorHandling.errorMessage,
      });

      results.push({});

      results.push({
        result: errorHandling.errorColumnTitles[0],
        title_component_exist: errorHandling.errorColumnTitles[1],
        title_in_page_url: "",
      });

      for (const item of pagesInError) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }
    } else {
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
      errorMessage: pagesInError.length > 0 ? errorHandling.popupMessage : "",
    };
  }
}

module.exports = LoadAudit;
