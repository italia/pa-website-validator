"use strict";

import { CheerioAPI } from "cheerio";
// @ts-ignore
import lighthouse from "lighthouse";
import got from "got";
import * as cheerio from "cheerio";

// @ts-ignore
import { checkOrder } from "../../../utils/utils";
import { contentTypeItems } from "../../../storage/school/contentTypeItems";

const Audit = lighthouse.Audit;
const modelReferenceUrl =
  "https://docs.google.com/spreadsheets/d/1MoayTY05SE4ixtgBsfsdngdrFJf_Z2KNvDkMF3tKfc8/edit#gid=0";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-servizi-structure-match-model",
      title: "La scheda di servizio analizzata rispetta il modello",
      failureTitle:
        "La scheda non rispetta il modello: Ci sono meno del 90% delle voci obbligatorie oppure più del 10% delle voci obbligatorie è presente in ordine scorretto. Vedi il modello di riferimento per più informazioni: " +
        modelReferenceUrl,
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "Test per la verificare se una scheda di servizio rispetta il modello",
      requiredArtifacts: ["serviziStructure"],
    };
  }

  static async audit(
    artifacts: any
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.serviziStructure;

    const infoHeadings = [
      { key: "result_info", itemType: "text", text: "Info" },
    ];
    const pageNotFoundItems = [
      {
        result_info:
          "Non è stato possibile eseguire il test. Pagina tutti i servizi non trovata. Il listato di tutti i servizi deve essere esposto alla pagina: {{base_url}}/servizio",
      },
    ];
    const servicesNotFoundItems = [
      {
        result_info:
          "Non è stato possibile eseguire il test: Non sono state trovate schede servizio",
      },
    ];

    const headings = [
      {
        key: "number_of_mandatory_elements",
        itemType: "text",
        text: "Numero di voci trovate",
      },
      {
        key: "mandatory_elements_found",
        itemType: "text",
        text: "Voci trovate",
      },
      {
        key: "number_of_missing_mandatory_elements",
        itemType: "text",
        text: "Numero di voci obbligatorie mancanti",
      },
      {
        key: "missing_mandatory_elements_found",
        itemType: "text",
        text: "Voci obbligatorie mancanti",
      },
      {
        key: "number_of_mandatory_elements_not_right_order",
        itemType: "text",
        text: "Numero di voci obbligatorie che non rispettano la sequenzialità",
      },
      {
        key: "mandatory_elements_not_right_order",
        itemType: "text",
        text: "Voci obbligatorie che non rispettano la sequenzialità",
      },
      {
        key: "mandatory_voices_found_percentage",
        itemType: "text",
        text: "% Voci obbligatorie trovate",
      },
      {
        key: "mandatory_voices_not_right_order_found_percentage",
        itemType: "text",
        text: "% Voci obbligatorie che non rispettano la sequenzialità trovate",
      },
      {
        key: "inspected_page",
        itemType: "text",
        text: "Scheda servizio ispezionata",
      },
    ];

    const allServicesUrl = url + "/servizio/";

    try {
      await got(allServicesUrl);
    } catch (e) {
      return {
        score: 0,
        details: Audit.makeTableDetails(infoHeadings, pageNotFoundItems),
      };
    }

    let score = 1;
    const mandatoryVoices = contentTypeItems.Servizio;
    const mandatoryHeaderVoices = contentTypeItems.Header;
    const totalMandatoryVoices =
      mandatoryVoices.length + mandatoryHeaderVoices.length;

    const pagesToBeScanned = await getAllServicesPagesToBeScanned(
      allServicesUrl
    );
    const servicesUrl = await getAllServicesUrl(
      pagesToBeScanned,
      allServicesUrl
    );
    if (servicesUrl.length <= 0) {
      return {
        score: 0,
        details: Audit.makeTableDetails(infoHeadings, servicesNotFoundItems),
      };
    }

    const randomServiceToBeScanned =
      servicesUrl[Math.floor(Math.random() * (servicesUrl.length - 1 + 1) + 1)];

    const response = await got(randomServiceToBeScanned);
    const $ = cheerio.load(response.body);

    const indexElements = await getServicesFromIndex($);
    const orderResult = await checkOrder(mandatoryVoices, indexElements);

    const foundElements = indexElements;
    const missingMandatoryItems = mandatoryVoices.filter(
      (val) => !indexElements.includes(val)
    );

    const title = await getTitle($);
    if (!title) {
      missingMandatoryItems.push(mandatoryHeaderVoices[0]);
    } else {
      foundElements.push(mandatoryHeaderVoices[0]);
    }

    const description = await getDescription($);
    if (!description) {
      missingMandatoryItems.push(mandatoryHeaderVoices[1]);
    } else {
      foundElements.push(mandatoryHeaderVoices[1]);
    }

    const breadcrumb = await getBreadcrumb($);
    if (
      !breadcrumb.includes("Famiglie e studenti") &&
      !breadcrumb.includes("Personale scolastico")
    ) {
      missingMandatoryItems.push(mandatoryHeaderVoices[2]);
    } else {
      foundElements.push(mandatoryHeaderVoices[2]);
    }

    const foundMandatoryVoicesPercentage: any = (
      (foundElements.length / totalMandatoryVoices) *
      100
    ).toFixed(0);
    const foundMandatoryVoicesNotCorrectOrderPercentage: any = (
      (orderResult.numberOfElementsNotInSequence / totalMandatoryVoices) *
      100
    ).toFixed(0);

    if (
      foundMandatoryVoicesPercentage < 90 ||
      foundMandatoryVoicesNotCorrectOrderPercentage > 10
    ) {
      score = 0;
    } else if (
      (foundMandatoryVoicesPercentage > 90 &&
        foundMandatoryVoicesPercentage < 100) ||
      (foundMandatoryVoicesNotCorrectOrderPercentage > 0 &&
        foundMandatoryVoicesNotCorrectOrderPercentage < 10)
    ) {
      score = 0.5;
    }

    const items = [
      {
        number_of_mandatory_elements: foundElements.length,
        mandatory_elements_found: foundElements.join(", "),
        number_of_missing_mandatory_elements: missingMandatoryItems.length,
        missing_mandatory_elements_found: missingMandatoryItems.join(", "),
        number_of_mandatory_elements_not_right_order:
          orderResult.numberOfElementsNotInSequence,
        mandatory_elements_not_right_order:
          orderResult.elementsNotInSequence.join(", "),
        mandatory_voices_found_percentage: foundMandatoryVoicesPercentage + "%",
        mandatory_voices_not_right_order_found_percentage:
          foundMandatoryVoicesNotCorrectOrderPercentage + "%",
        inspected_page: randomServiceToBeScanned,
      },
    ];

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;

async function getAllServicesPagesToBeScanned(
  initialUrl: string
): Promise<string[]> {
  const pageScanned = [initialUrl];

  let noMorePageToScan = false;
  let pageToBeScan = initialUrl;

  while (!noMorePageToScan) {
    const tempResponse = await got(pageToBeScan);
    const $ = cheerio.load(tempResponse.body);
    const cheerioElements = $("body").find("a");
    if (cheerioElements.length <= 0) {
      noMorePageToScan = true;
    }

    for (const cheerioElement of cheerioElements) {
      const url = $(cheerioElement).attr("href");
      if (
        url !== undefined &&
        url.includes("/page/") &&
        !pageScanned.includes(url)
      ) {
        pageScanned.push(url);

        pageToBeScan = url;
      } else {
        noMorePageToScan = true;
      }
    }
  }

  return pageScanned;
}

async function getAllServicesUrl(
  pagesToScan: string[],
  initialUrl: string
): Promise<string[]> {
  const servicesUrl = [];
  for (const pageToScan of pagesToScan) {
    const pageResponse = await got(pageToScan);
    const $ = cheerio.load(pageResponse.body);
    const cheerioElements = $("body").find("a");
    if (cheerioElements.length <= 0) {
      continue;
    }

    for (const cheerioElement of cheerioElements) {
      const url = $(cheerioElement).attr("href");
      if (
        url !== undefined &&
        url.includes("/servizio/") &&
        url !== initialUrl &&
        !url.includes("/page/")
      ) {
        servicesUrl.push(url);
      }
    }
  }

  return servicesUrl;
}

async function getTitle($: CheerioAPI): Promise<string> {
  let title = "";
  const titleContent = $(".section-title");

  if ($(titleContent).find("h2").text()) {
    title = $(titleContent).find("h2").text();
  }

  return title;
}

async function getDescription($: CheerioAPI): Promise<string> {
  let description = "";
  const titleContent = $(".section-title");

  if ($(titleContent).find("p").text()) {
    description = $(titleContent).find("p").text();
  }

  return description;
}

async function getBreadcrumb($: CheerioAPI): Promise<string[]> {
  const resultElements: Array<string> = [];

  const breadcrumbContent = $(".breadcrumb");
  const breadcrumbElements = $(breadcrumbContent).find("span");

  if (Object.keys(breadcrumbElements).length === 0) {
    return resultElements;
  }

  for (let i = 0; i < breadcrumbElements.length; i++) {
    if ($(breadcrumbElements[i]).text().trim()) {
      resultElements.push($(breadcrumbElements[i]).text().trim());
    }
  }

  return resultElements;
}

async function getServicesFromIndex($: CheerioAPI): Promise<string[]> {
  const paragraphList = $("#lista-paragrafi");
  const indexElements = $(paragraphList).find("a");

  const returnValues = [];
  for (const indexElement of indexElements) {
    returnValues.push($(indexElement).text().trim());
  }

  return returnValues;
}
