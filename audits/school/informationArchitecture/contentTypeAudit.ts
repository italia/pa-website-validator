'use strict'

import { LH } from "lighthouse"
import crawlerTypes from "../../../types/crawler-types"
import servizi = crawlerTypes.servizi
import _ from "lodash"

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
const got = require('got')

// @ts-ignore
const cheerio = require('cheerio')

// @ts-ignore
const fs = require('fs')

// @ts-ignore
const storageFolder = __dirname + '/../../../storage/school'

const contentTypeItemsFile = 'contentTypeItems.json'

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-content-type-structure-match-model',
            title: 'Il content type rispetta le indicazioni fornite dal modello',
            failureTitle: 'Il content type non rispetta le indicazioni fornite dal modello',
            scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
            description: 'Test per verificare il rispetto delle regole per la costruzione del content principale',
            requiredArtifacts: ['contentTypeStructureMatchModel'],
        }
    }

    static async audit(artifacts : any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const url = artifacts.contentTypeStructureMatchModel

        let score = 0
        let headings = []
        let items = []

        const contentType = selectType(url)
        if (!Boolean(contentType)) {
            score = 0
            headings = [ { key: 'wrong_content_type', itemType: 'text', text: "Content type passato" } ]

            items = [ { wrong_content_type: 'Il content-type passato non è valido' } ]

            return {
                score: score,
                details: Audit.makeTableDetails(headings, items)
            }
        }

        let result: servizi = {
            containsAllTheMandatoryItems: false,
            rightOrder: false,
            missingItems: []
        }

        switch (contentType) {
            case 'servizio':
                result = await matchServizi(url)
                break
            case 'scheda-didattica':
                break
            case 'scheda-progetto':
                break
            case 'circolari':
                break
        }

        if (result.containsAllTheMandatoryItems && result.rightOrder) {
            score = 1
        }

        headings = [
            { key: 'contains_all_mandatory_items', itemType: 'text', text: "Content type contiene tutti i campi obbligatori" },
            { key: 'items_rigth_order', itemType: 'text', text: "Le voci del content type sono posizionate nell'ordine corretto" },
            { key: 'missing_mandatory_items', itemType: 'text', text: "Voci del content type mancanti" },
        ]

        items = [
            {
                contains_all_mandatory_items: result.containsAllTheMandatoryItems ? 'passato' : 'non passato',
                items_rigth_order: result.rightOrder ? 'passato' : 'non passato',
                missing_mandatory_items: result.missingItems.length === 0 ? 'nessuno' : result.missingItems.join(', ')
            }
        ]

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit

async function matchServizi(url: string) : Promise<servizi> {
    const response = await got(url)
	const $ = cheerio.load(response.body)
    const contentTypeItems = JSON.parse(fs.readFileSync(storageFolder + '/' + contentTypeItemsFile))
    const mandatoryItems: [] = contentTypeItems.Servizio

    const divMainContent = $('.main-content')
    const headingTags = $(divMainContent).find('h4, h6')
    let rightOrder = true
    let found = -1
    let elementsFound: [] = []

    for (let i = 0; i < mandatoryItems.length; i++) {
        for (let j = 0; j < headingTags.length; j++) {
            if (mandatoryItems[i] == $(headingTags[j]).text().trim()) {
                if (j < found) {
                    rightOrder = false
                }
                found = j
                elementsFound.push(mandatoryItems[i])
            }
        }
    }

    const arrayDiff = _.difference(mandatoryItems, elementsFound)

    return {
        containsAllTheMandatoryItems: arrayDiff.length <= 0,
        rightOrder,
        missingItems: arrayDiff
    }
}

function selectType(url: string) : string | null {
    let contentType

    if (url.includes('servizio')) {
        contentType = 'servizio'
    } else if (url.includes('scheda-didattica')) {
        contentType = 'servizi'
    } else if (url.includes('scheda-progetto')) {
        contentType = 'scheda-progetto'
    } else if (url.includes('circolare')) {
        contentType = 'circolare'
    } else {
        contentType = null
    }

    return contentType
}
