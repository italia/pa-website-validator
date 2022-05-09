'use strict'

import { CheerioAPI } from "cheerio"

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
import got from "got"

// @ts-ignore
import * as cheerio from "cheerio"

// @ts-ignore
import * as fs from "fs"

// @ts-ignore
import { checkOrder } from "../../../utils/utils"

// @ts-ignore
const storageFolder = __dirname + '/../../../storage/school'

// @ts-ignore
const contentTypeItemsFile = 'contentTypeItems.json'

// @ts-ignore
const modelReferenceUrl = 'https://docs.google.com/spreadsheets/d/1MoayTY05SE4ixtgBsfsdngdrFJf_Z2KNvDkMF3tKfc8/edit#gid=0'

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-servizi-structure-match-model',
            title: 'La scheda di servizio analizzata rispetta il modello',
            failureTitle: 'La scheda non rispetta il modello: Ci sono meno del 90% delle voci obbligatorie oppure più del 10% delle voci obbligatorie è presente in ordine scorretto. Vedi il modello di riferimento per più informazioni: ' + modelReferenceUrl,
            scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
            description: 'Test per la verificare se una scheda di servizio rispetta il modello',
            requiredArtifacts: ['serviziStructure'],
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const url = artifacts.serviziStructure

        let allServicesUrl = url + '/servizio/'
        let secondaryUrlTry = false

        try {
            await got(allServicesUrl)
        } catch (e) {
            console.error('Pagina servizio non trovata ... provando un altro URL')
            secondaryUrlTry = true
        }

        if (secondaryUrlTry) {
            try {
                allServicesUrl = url + '/index.php/servizio/'
                await got(allServicesUrl)
            } catch (e) {
                const pageNotFoundHeadings = [ { key: 'result_info', itemType: 'text', text: "Info" } ]
                const pageNotFoundItems = [ { result_info: "Non è stato possibile eseguire il test. Pagina tutti i servizi non trovata." } ]

                return {
                    score: 0,
                    details: Audit.makeTableDetails(pageNotFoundHeadings, pageNotFoundItems)
                }
            }
        }

        const headings = [
            { key: 'number_of_mandatory_elements', itemType: 'text', text: "Numero di voci trovate" },
            { key: 'mandatory_elements_found', itemType: 'text', text: "Voci trovate" },
            { key: 'number_of_missing_mandatory_elements', itemType: 'text', text: "Numero di voci obbligatorie mancanti" },
            { key: 'missing_mandatory_elements_found', itemType: 'text', text: "Voci obbligatorie mancanti" },
            { key: 'number_of_mandatory_elements_not_right_order', itemType: 'text', text: "Numero di voci obbligatorie che non rispettano la sequenzialità" },
            { key: 'mandatory_elements_not_right_order', itemType: 'text', text: "Voci obbligatorie che non rispettano la sequenzialità" },
            { key: 'mandatory_voices_found_percentage', itemType: 'text', text: "% Voci obbligatorie trovate" },
            { key: 'mandatory_voices_not_right_order_found_percentage', itemType: 'text', text: "% Voci obbligatorie che non rispettano la sequenzialità trovate" },
            { key: 'inspected_page', itemType: 'text', text: "Scheda servizio ispezionata" }
        ]

        let score = 1
        // @ts-ignore
        const contentTypeItems = await JSON.parse(await fs.readFileSync(storageFolder + '/' + contentTypeItemsFile))
        const mandatoryVoices = contentTypeItems.Servizio
        const mandatoryHeaderVoices = contentTypeItems.Header
        const totalMandatoryVoices = mandatoryVoices.length + mandatoryHeaderVoices.length

        const pagesToBeScanned = await getAllServicesPagesToBeScanned(allServicesUrl)
        const servicesUrl = await getAllServicesUrl(pagesToBeScanned, allServicesUrl)
        const randomServiceToBeScanned = servicesUrl[Math.floor(Math.random() * (servicesUrl.length - 1 + 1) + 1)]

        const response = await got(randomServiceToBeScanned)
        const $ = cheerio.load(response.body)

        const indexElements = await getServicesFromIndex($)
        const orderResult = await checkOrder(mandatoryVoices, indexElements)

        let foundElements = indexElements
        const missingMandatoryItems = mandatoryVoices.filter(val => !indexElements.includes(val))

        const title = await getTitle($)
        if (!Boolean(title)) {
            missingMandatoryItems.push(mandatoryHeaderVoices[0])
        } else {
            foundElements.push(mandatoryHeaderVoices[0])
        }

        const description = await getDescription($)
        if (!Boolean(description)) {
            missingMandatoryItems.push(mandatoryHeaderVoices[1])
        } else {
            foundElements.push(mandatoryHeaderVoices[1])
        }

        const breadcrumb = await getBreadcrumb($)
        if ((!breadcrumb.includes('Famiglie e studenti')) && !breadcrumb.includes('Personale scolastico')) {
            missingMandatoryItems.push(mandatoryHeaderVoices[2])
        } else {
            foundElements.push(mandatoryHeaderVoices[2])
        }

        const foundMandatoryVoicesPercentage: any = ((foundElements.length / totalMandatoryVoices) * 100).toFixed(0)
        const foundMandatoryVoicesNotCorrectOrderPercentage: any = ((orderResult.numberOfElementsNotInSequence / totalMandatoryVoices) * 100).toFixed(0)

        if (foundMandatoryVoicesPercentage < 90 || foundMandatoryVoicesNotCorrectOrderPercentage > 10) {
            score = 0
        } else if ((foundMandatoryVoicesPercentage > 90 && foundMandatoryVoicesPercentage < 100) || (foundMandatoryVoicesNotCorrectOrderPercentage > 0 && foundMandatoryVoicesNotCorrectOrderPercentage < 10)) {
            score = 0.5
        }

        const items = [
            {
                number_of_mandatory_elements: foundElements.length,
                mandatory_elements_found: foundElements.join(', '),
                number_of_missing_mandatory_elements: missingMandatoryItems.length,
                missing_mandatory_elements_found: missingMandatoryItems.join(', '),
                number_of_mandatory_elements_not_right_order: orderResult.numberOfElementsNotInSequence,
                mandatory_elements_not_right_order: orderResult.elementsNotInSequence.join(', '),
                mandatory_voices_found_percentage: foundMandatoryVoicesPercentage + '%',
                mandatory_voices_not_right_order_found_percentage: foundMandatoryVoicesNotCorrectOrderPercentage +'%',
                inspected_page: randomServiceToBeScanned
            }
        ]

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}


module.exports = LoadAudit

async function getAllServicesPagesToBeScanned(initialUrl: string) : Promise<string[]> {
    let pageScanned = [
        initialUrl
    ]
    let noMorePageToScan = false
    let pageToBeScan = initialUrl
    while (!noMorePageToScan) {
        let tempResponse = await got(pageToBeScan)
        const $ = cheerio.load(tempResponse.body)
        const cheerioElements = $('body').find('a')

        for (let cheerioElement of cheerioElements) {
            let url = $(cheerioElement).attr('href')
            if (Boolean(url) && url.includes('/page/') && !pageScanned.includes(url)) {
                pageScanned.push(url)

                pageToBeScan = url
            } else if (Boolean(url) && !url.includes('/page/')) {
                noMorePageToScan = true
            }
        }
    }

    return pageScanned
}

async function getAllServicesUrl(pagesToScan: string[], initialUrl: string) : Promise<string[]> {
    let servicesUrl = []
    for (let pageToScan of pagesToScan) {
        const pageResponse = await got(pageToScan)
        const $ = cheerio.load(pageResponse.body)
        const cheerioElements = $('body').find('a')

        for (let cheerioElement of cheerioElements) {
            let url = $(cheerioElement).attr('href')
            if (Boolean(url) && url.includes('/servizio/') && url !== initialUrl && !url.includes('/page/')) {
                servicesUrl.push(url)
            }
        }
    }

    return servicesUrl
}

async function getTitle($: CheerioAPI) : Promise<string> {
    let title = ''
    const titleContent = $('.section-title')

    if (Boolean($(titleContent).find('h2').text())) {
        title = $(titleContent).find('h2').text()
    }

    return title
}

async function getDescription($: CheerioAPI) : Promise<string> {
    let description = ''
    const titleContent = $('.section-title')

    if (Boolean($(titleContent).find('p').text())) {
        description = $(titleContent).find('p').text()
    }

    return description
}

async function getBreadcrumb($: CheerioAPI) : Promise<string[]> {
    let resultElements = []

    const breadcrumbContent = $('.breadcrumb')
    const breadcrumbElements = $(breadcrumbContent).find('span')

    if (Object.keys(breadcrumbElements).length === 0) {
        return resultElements
    }

    for (let i = 0; i < breadcrumbElements.length; i++) {
        if (Boolean($(breadcrumbElements[i]).text().trim())) {
            resultElements.push($(breadcrumbElements[i]).text().trim())
        }
    }

    return resultElements
}

async function getServicesFromIndex($: CheerioAPI) : Promise<string[]> {
    const paragraphList = $('#lista-paragrafi')
    const indexElements = $(paragraphList).find('a')

    let returnValues = []
    for (let indexElement of indexElements) {
        returnValues.push($(indexElement).text().trim())
    }

    return returnValues
}