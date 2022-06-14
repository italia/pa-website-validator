"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

import {checkOrder, getElementHrefValues, getPageElement, getRandomServiceUrl, loadPageData} from "../../utils/utils";
import { contentTypeItems } from "../../storage/school/contentTypeItems";

const Audit = lighthouse.Audit;

const greenResult = "Tutte le voci obbligatorie sono presenti e nell'ordine corretto."
const yellowResult = "Non sono presenti tutte le voci obbligatorie o non tutte le voci obbligatorie sono nell'ordine corretto."
const redResult = "Non sono presenti tutte le voci obbligatorie e non tutte le voci obbligatorie sono nell'ordine corretto."
const notExecuted = "Non è stato possibile condurre il test. Controlla le \"Modalità di verifica\" per scoprire di più."

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
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;
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

    let score = 1;
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

    const randomServiceToBeScanned: string = await getRandomServiceUrl('http://wp-scuole.local/design-scuole-pagine-statiche/build/scuole-home.html')

    if (randomServiceToBeScanned === "") {
      item[0].result = notExecuted + ': nessun servizio trovato'
      return {
        score: 0,
        details: Audit.makeTableDetails(headings, item),
      }
    }

    item[0].inspected_page = randomServiceToBeScanned

    const $: CheerioAPI = await loadPageData(randomServiceToBeScanned)

    const indexElements = await getServicesFromIndex($, mandatoryVoices);
    const orderResult = await checkOrder(mandatoryVoices, indexElements);
    const foundElementsAmount = indexElements.length;
    const missingMandatoryItems = mandatoryVoices.filter((val) => !indexElements.includes(val));

    console.log('servizio: ', randomServiceToBeScanned)

    let title = $("#titolo-sevizio").text() ?? ""
    console.log('title', title)

    let description = $("#descrizione-servizio").text() ?? ""
    console.log('test2', description)

    let breadcrumbElements = await getPageElement($, 'breadcrumb-list', 'li')
    console.log('breadcrumb-list', breadcrumbElements)

    let argumentsTag = await getPageElement($, 'lista-argomenti', 'a')
    console.log('argomenti', argumentsTag)

    let locationList = await getPageElement($, 'location-list', 'span')
    console.log('location', locationList)
    let locationListValues = await getPageElement($, 'location-list', 'p')
    console.log('location values', locationListValues)

    let responsibleStructure = await getElementHrefValues($, 'lista-strutture', 'a')
    console.log('strutture URL', responsibleStructure)

    let metadata = $("#metadati").text() ?? ""
    console.log('metadata', metadata)

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

async function getServicesFromIndex($: CheerioAPI, mandatoryElements: string[]): Promise<string[]> {
  const indexList = await getPageElement($, 'index-list', '> li > a')

  const returnValues = [];
  for (const indexElement of indexList) {
    if (mandatoryElements.includes(indexElement)) {
      returnValues.push(indexElement);
    }
  }

  return returnValues;
}
