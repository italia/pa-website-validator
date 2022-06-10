"use strict";

import {Cheerio, CheerioAPI} from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import got from "got";
import * as cheerio from "cheerio";

import { checkOrder } from "../../../utils/utils";
import { contentTypeItems } from "../../../storage/school/contentTypeItems";
import { getAllServicesPagesToBeScanned, getAllServicesUrl, getRandomServicesToBeScanned} from "../../../utils/utils"

const Audit = lighthouse.Audit;

const greenResult = "Tutte le voci obbligatorie sono presenti e nell'ordine corretto."
const yellowResult = "Non sono presenti tutte le voci obbligatorie o non tutte le voci obbligatorie sono nell'ordine corretto."
const redResult = "Non sono presenti tutte le voci voci obbligatorie e non tutte le voci obbligatorie sono nell'ordine corretto."

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-servizi-structure-match-model",
      title: "SCHEDE INFORMATIVE DI SERVIZIO - Tutte le schede informative dei servizi devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
      failureTitle:
        "SCHEDE INFORMATIVE DI SERVIZIO - Tutte le schede informative dei servizi devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        "CONDIZIONI DI SUCCESSO: nella scheda servizio sono presenti almeno 7 su 8 delle voci obbligatorie e almeno 7 su 8 delle voci obbligatorie sono nell'ordine corretto; MODALITÀ DI VERIFICA: viene verificato quali voci sono presenti all'interno di una scheda servizio casualmente selezionata e il loro ordine; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Scuole.](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/v2022.1/index.html)",
      requiredArtifacts: ["serviziStructure"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { serviziStructure: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.serviziStructure;
    let score = 0

    const testNotFoundHeadings = [ { key: "result", itemType: "text", text: "Risultato" } ]
    const testNotFoundItem = [ { result: "Non è stato possibile condurre il test. Controlla le \"Modalità di verifica\" per scoprire di più." } ]
    const testNotFoundReturnObj = {
      score: score,
      details: Audit.makeTableDetails(testNotFoundHeadings, testNotFoundItem),
    }

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      { key: "inspected_page", itemType: "text", text: "Scheda di servizio ispezionata"},
      { key: "missing_mandatory_elements_found", itemType: "text", text: "Voci obbligatorie mancanti" },
      { key: "mandatory_elements_not_right_order", itemType: "text", text: "Voci obbligatorie che non rispettano l'ordine corretto" },
    ];

    let item = [{
      result: greenResult,
      missing_mandatory_elements_found: "",
      mandatory_elements_not_right_order: "",
      inspected_page: "",
    }]

    /*const allServicesUrl = url + "/servizio/";
    try {
      await got(allServicesUrl);
    } catch (e) {
      return testNotFoundReturnObj
    }*/

    score = 1;
    const mandatoryVoices = contentTypeItems.Indice
    const mandatoryHeaderVoices = contentTypeItems.Header
    const mandatoryPlaceInfo = contentTypeItems.Luogo
    const mandatoryBodyVoices = contentTypeItems.Body
    const mandatoryMetadata = contentTypeItems.Metadati
    const breadcrumbMandatoryElements = contentTypeItems.Breadcrumb
    const totalMandatoryVoices =
      mandatoryVoices.length +
      mandatoryHeaderVoices.length +
      mandatoryPlaceInfo.length +
      mandatoryBodyVoices.length +
      mandatoryMetadata.length +
      (breadcrumbMandatoryElements.length - 1)

    //const pagesToBeScanned = await getAllServicesPagesToBeScanned(allServicesUrl);
    //const servicesUrl = await getAllServicesUrl(pagesToBeScanned, allServicesUrl);

    /*if (servicesUrl.length <= 0) {
      return testNotFoundReturnObj
    }*/

    const randomServiceToBeScanned: string = 'http://wp-scuole.local/?servizio=servizio-mensa' //await getRandomServicesToBeScanned(servicesUrl)
    item[0].inspected_page = randomServiceToBeScanned

    const response = await got(randomServiceToBeScanned);
    const $ = cheerio.load(response.body);

    const indexElements = await getServicesFromIndex($, mandatoryVoices);
    const orderResult = await checkOrder(mandatoryVoices, indexElements);

    const foundElementsAmount = indexElements.length;
    const missingMandatoryItems = mandatoryVoices.filter((val) => !indexElements.includes(val));

    //TODO: integrazione metodi di scraping

    const foundMandatoryVoicesPercentage = (foundElementsAmount / totalMandatoryVoices) * 100;
    const foundMandatoryVoicesNotCorrectOrderPercentage = (orderResult.numberOfElementsNotInSequence / totalMandatoryVoices) * 100;

    if (foundMandatoryVoicesPercentage < 90 || foundMandatoryVoicesNotCorrectOrderPercentage > 10) {
      score = 0;
      item[0].result = redResult
    } else if ((foundMandatoryVoicesPercentage > 90 && foundMandatoryVoicesPercentage < 100) ||
               (foundMandatoryVoicesNotCorrectOrderPercentage > 0 && foundMandatoryVoicesNotCorrectOrderPercentage < 10)) {
      score = 0.5;
      item[0].result = yellowResult
    }

    item[0].missing_mandatory_elements_found = missingMandatoryItems.join(", ")
    item[0].mandatory_elements_not_right_order = orderResult.elementsNotInSequence.join(", ")

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;

async function isTitlePresent($: CheerioAPI): Promise<boolean> {
  let titlePresent = false
  const titleContent = $(".section-title");

  if ($(titleContent).find("h2").text()) {
    titlePresent = true
  }

  return titlePresent;
}

async function isDescriptionPresent($: CheerioAPI): Promise<boolean> {
  let descriptionPresent = false
  const titleContent = $(".section-title");

  if ($(titleContent).find("p").text()) {
    descriptionPresent = true
  }

  return descriptionPresent
}

async function isBreadcrumbCorrect($: CheerioAPI, breadcrumbMandatoryElements: string[]): Promise<boolean> {
  let breadcrumbCorrect = false
  const resultElements: Array<string> = [];

  const breadcrumbContent = $(".breadcrumb");
  const breadcrumbElements = $(breadcrumbContent).find("span");

  if (Object.keys(breadcrumbElements).length === 0) {
    return breadcrumbCorrect
  }

  for (let i = 0; i < breadcrumbElements.length; i++) {
    if ($(breadcrumbElements[i]).text().trim()) {
      resultElements.push($(breadcrumbElements[i]).text().trim());
    }
  }

  for (let element of breadcrumbMandatoryElements) {
    if (resultElements.includes(element)) {
      breadcrumbCorrect = true
    }
  }

  return breadcrumbCorrect
}

async function areArgumentsPresent($: CheerioAPI): Promise<boolean> {
  let argumentsCorrect = false
  const resultElements: Array<string> = [];

  const badgesContent = $(".badges");
  const argumentsElements = $(badgesContent).find("a");

  if (Object.keys(argumentsElements).length === 0) {
    return argumentsCorrect
  }

  for (let i = 0; i < argumentsElements.length; i++) {
    if ($(argumentsElements[i]).text().trim()) {
      resultElements.push($(argumentsElements[i]).text().trim());
    }
  }

  if (resultElements.length > 0) {
    argumentsCorrect = true
  }

  return argumentsCorrect
}

async function placeInfo($: CheerioAPI, placeInfo: string[]): Promise<{address: boolean, zip: boolean, time: boolean, gps: boolean}> {
  let correctPlaceInfo = {
    address: false,
    zip: false,
    time: false,
    gps: false
  }

  const resultElements: any = [];
  const badgesContent = $(".location-list");
  const numberOfPlaces = badgesContent.length
  const argumentsElementsLabel = $(badgesContent).find("span");
  const argumentsElementsValue = $(badgesContent).find("p");

  if (Object.keys(argumentsElementsLabel).length === 0 || Object.keys(argumentsElementsValue).length === 0) {
    return correctPlaceInfo
  }

  for (let i = 0; i < argumentsElementsLabel.length; i++) {
    const label = $(argumentsElementsLabel[i]).text().trim() ?? null
    const value = $(argumentsElementsValue[i]).text().trim() ?? null
    if (Boolean(label) && Boolean(value) && placeInfo.includes(label)) {
      resultElements.push(label)
    }
  }

  const argumentsGPSValue = $(badgesContent).find("a");
  for (let i = 0; i < argumentsGPSValue.length; i++) {
    const gpsUrl = $(argumentsGPSValue[i]).attr().href ?? null
     if (Boolean(gpsUrl) && gpsUrl.includes('google')) {
       resultElements.push('gps')
     }
  }

  const numOfAddress = resultElements.filter((x: string) => x === placeInfo[0]).length
  const numOfZIP = resultElements.filter((x: string) => x === placeInfo[1]).length
  const numOfTimes = resultElements.filter((x: string) => x === placeInfo[2]).length
  const numOfGPS = resultElements.filter((x: string) => x === placeInfo[3]).length

  correctPlaceInfo.address = (numOfAddress === numberOfPlaces)
  correctPlaceInfo.zip = (numOfZIP === numberOfPlaces)
  correctPlaceInfo.time = (numOfTimes === numberOfPlaces)
  correctPlaceInfo.gps = (numOfGPS === numberOfPlaces)

  return correctPlaceInfo
}

async function isStructureResponsiblePresent($: CheerioAPI, checkString: string): Promise<boolean> {
  let structureResponsiblePresent = false
  let h6Elements = []

  const badgesContent = $("h6");
  if (badgesContent.length <= 0) {
    return structureResponsiblePresent
  }

  for (let i = 0; i < badgesContent.length; i++) {
    if($(badgesContent[i]).text().trim()) {
      h6Elements.push($(badgesContent[i]).text().trim())
    }
  }

  if (h6Elements.includes(checkString)) {
    structureResponsiblePresent = true
  }

  return structureResponsiblePresent
}

async function areMetadataPresent($: CheerioAPI, metadata: string[]): Promise<boolean> {
  let returnValues: string[] = []

  const badgesContent = $(".article-footer");
  const metadataValues = $(badgesContent).find("p");

  if (Object.keys(metadataValues).length === 0) {
    return false;
  }

  for (let i = 0; i < metadataValues.length; i++) {
    const label = $(metadataValues[i]).text().trim() ?? null
    if (Boolean(label)) {
      for (let element of metadata) {
        if (label.includes(element)) {
          returnValues.push(element)
        }
      }
    }
  }

  return metadata.every(v => returnValues.includes(v))
}

async function getServicesFromIndex($: CheerioAPI, mandatoryElements: string[]): Promise<string[]> {
  const paragraphList = $("#lista-paragrafi");
  const indexElements = $(paragraphList).find("a");

  const returnValues = [];
  for (const indexElement of indexElements) {
    if (mandatoryElements.includes($(indexElement).text().trim())) {
      returnValues.push($(indexElement).text().trim());
    }
  }

  return returnValues;
}
