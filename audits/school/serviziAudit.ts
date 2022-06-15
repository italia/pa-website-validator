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

    let score = 1

    const mandatoryVoices = contentTypeItems.Indice
    const mandatoryHeaderVoices = contentTypeItems.Header
    const mandatoryBodyVoices = contentTypeItems.Body
    const mandatoryPlaceInfo = contentTypeItems.Luogo
    const totalMandatoryVoices = mandatoryVoices.length + mandatoryHeaderVoices.length + mandatoryPlaceInfo.length + mandatoryBodyVoices.length

    const mandatoryMetadata = contentTypeItems.Metadati
    const breadcrumbMandatoryElements = contentTypeItems.Breadcrumb

    /*const randomServiceToBeScanned: string = await getRandomServiceUrl(url)

    if (randomServiceToBeScanned === "") {
      item[0].result = notExecuted + ': nessun servizio trovato'
      return {
        score: 0,
        details: Audit.makeTableDetails(headings, item),
      }
    } */
    let randomServiceToBeScanned = 'http://wp-scuole.local/design-scuole-pagine-statiche/build/scuole-servizio-generico.html'

    item[0].inspected_page = randomServiceToBeScanned

    console.log('RANDOM SERVICE TO BE SCANNED', randomServiceToBeScanned)
    const $: CheerioAPI = await loadPageData(randomServiceToBeScanned)
    const indexElements = await getServicesFromIndex($, mandatoryVoices);
    console.log('INDEX ELEMENTS', indexElements)
    const orderResult = await checkOrder(mandatoryVoices, indexElements);
    console.log('ORDER RESULT', orderResult)
    let missingMandatoryItems = mandatoryVoices.filter((val) => !indexElements.includes(val));
    console.log('INITIAL MISSING MANDATORY ITEMS', missingMandatoryItems)

    const title = $("#titolo-servizio").text() ?? ""
    console.log('TITLE', title)
    if (!Boolean(title)) {
      missingMandatoryItems.push(mandatoryHeaderVoices[0])
    }

    const description = $("#descrizione-servizio").text() ?? ""
    console.log('DESCRIPTION', description)
    if (!Boolean(description)) {
      missingMandatoryItems.push(mandatoryHeaderVoices[1])
    }

    const breadcrumbElements = await getPageElement($, 'breadcrumb-list', 'li')
    console.log('BREADCRUMB', breadcrumbElements)
    if (!breadcrumbElements.includes(breadcrumbMandatoryElements[0]) && !breadcrumbElements.includes(breadcrumbMandatoryElements[1])) {
      missingMandatoryItems.push(mandatoryHeaderVoices[2])
    }

    const argumentsTag = await getPageElement($, 'lista-argomenti', 'a')
    console.log('ARGUMENTS', argumentsTag)
    if (argumentsTag.length <= 0) {
      missingMandatoryItems.push(mandatoryHeaderVoices[3])
    }

    const whatNeeds = $("#a-cosa-serve").text() ?? ""
    console.log('A COSA SERVE', whatNeeds)
    if (!Boolean(whatNeeds)) {
      missingMandatoryItems.push(mandatoryBodyVoices[0])
    }

    const responsibleStructure = await getElementHrefValues($, 'lista-strutture', 'a')
    console.log('RESPONSIBLE STRUCTURE', responsibleStructure)
    if (responsibleStructure.length <= 0) {
      missingMandatoryItems.push(mandatoryBodyVoices[1])
    }

    const placeInfo = await getPlaceInfo($, mandatoryPlaceInfo)
    console.log('PLACE INFO', placeInfo)
    if (placeInfo.length > 0) {
      missingMandatoryItems = [...missingMandatoryItems, ...placeInfo]
    }

    let metadata = $("#metadati").text() ?? ""
    console.log('METADATA', metadata)
    if (!metadata.includes(mandatoryMetadata[0]) || !metadata.includes(mandatoryMetadata[1])) {
      missingMandatoryItems.push(mandatoryBodyVoices[3])
    }

    const foundMandatoryVoicesPercentage = (( totalMandatoryVoices - missingMandatoryItems.length ) / totalMandatoryVoices) * 100;
    const foundMandatoryVoicesNotCorrectOrderPercentage = (orderResult.numberOfElementsNotInSequence / totalMandatoryVoices) * 100;
    console.log('FOUND MANDATORY VOICES PERCENTAGE', foundMandatoryVoicesPercentage)
    console.log('FOUND MANDATORY VOICES PERCENTAGE NOT CORRECT ORDER', foundMandatoryVoicesNotCorrectOrderPercentage)

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

async function getPlaceInfo($: CheerioAPI, mandatoryElements: string[]) {
  let elements = $("#location-list");

  if (elements.length <= 0) {
    return mandatoryElements
  }

  console.log('NUMBER OF LUOGO CARDS', elements.length)

  let placeCards = []
  for (let element of elements) {
    let placeCard = []
    let innerElementLabels = $(element).find('span')
    let innerElementValues = $(element).find('p')

    let gps = await getElementHrefValues($, 'location-list', 'a')
    let gpsLabel = ""
    let gpsValue = ""
    for (let gpsElement of gps) {
      if (Boolean(gpsElement.label) && Boolean(gpsElement.url)) {
        gpsLabel = gpsElement.label.toLowerCase()
        gpsValue = gpsElement.url
        break
      }
    }

    if (Boolean(gpsLabel)) {
      placeCard.push({
        [gpsLabel] : gpsValue
      })
    }

    for (let i = 0, j = 0; i < innerElementLabels.length, j < innerElementValues.length; i++, j++) {
       const labelText = $(innerElementLabels[i]).text().trim().toLowerCase() ?? null
       console.log('LABEL TEXT', labelText)
       if (Boolean(labelText)) {
           let labelValue = ""

           if (Boolean($(innerElementValues[j]))) {
               labelValue = $(innerElementValues[j]).text().trim().toLowerCase() ?? ""

               while (labelText !== 'orari' && (labelValue.includes('dalle') || labelValue.includes('alle'))) {
                  j++
                  labelValue = $(innerElementValues[j]).text().trim().toLowerCase() ?? ""
               }
           }

           placeCard.push({
              [labelText]: labelValue
           })
       }
    }

    placeCards.push(placeCard)
  }

  console.log('PLACE CARDS', placeCards)

  if (placeCards.length <= 0) {
    return []
  }

  let foundElements = []
  for (const card of placeCards) {
    for (const cardElement of placeCards) {
      for (const cardElementObj of cardElement) {
        const key = Object.keys(cardElementObj)
        if (key.length <= 0) {
          continue
        }
        const value = Object.values(cardElementObj) ?? []

        if (Boolean(value[0].toLowerCase()) && mandatoryElements.includes(key[0].toLowerCase())) {
          foundElements.push(key[0].toLowerCase())
        }
      }
    }
  }

  const removeDuplicates = [...new Set(foundElements)]
  console.log('REMOVED DUPLICATES', removeDuplicates)

  return mandatoryElements.filter((val) => !removeDuplicates.includes(val));
}
