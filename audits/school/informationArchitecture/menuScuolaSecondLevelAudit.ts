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
const menuItemsFile = 'menuItems.json'

class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-menu-scuola-second-level-structure-match-model',
            title: 'Le voci di secondo livello per "La scuola" rispettano il modello',
            failureTitle: 'Il menu di secondo livello non contiene almeno il 30% delle voci obbligatorie del modello con nome corretto',
            scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
            description: 'Test per verificare la conformità delle voci di secondo livello per la voce "La scuola" del menù',
            requiredArtifacts: ['menuStructureScuolaSecondLevelMatchModel'],
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const url = artifacts.menuStructureScuolaSecondLevelMatchModel

        const headings = [
            { key: 'missing_voices', itemType: 'text', text: "Voci di secondo livello per 'Scuola' mancanti o con nome errato" },
            { key: 'missing_voices_percentage', itemType: 'text', text: "Percentuale voci mancanti" },
            { key: 'correct_order', itemType: 'text', text: "Sequenzialità delle voci obbligatorie (tra quelle presenti) rispettato" },
            { key: 'elements_not_in_correct_order', itemType: 'text', text: "Voci (tra quelle presenti) obbligatorie che non rispettano la sequenzialità" },
            { key: 'model_link', itemType: 'url', text: "Link al modello di riferimento" },
        ]

        let score = 0

        const response = await got(url)
	    const $ : CheerioAPI = cheerio.load(response.body)

        // @ts-ignore
        const menuItems = JSON.parse(fs.readFileSync(storageFolder + '/' + menuItemsFile))
        const secondaryMenuScuolaItems = menuItems.secondaryMenuItems.Scuola

        const headerUl = $('#menu-la-scuola').find('li')
        let numberOfMandatoryVoicesPresent = 0
        let elementsFound = []
        for (let element of headerUl) {
            if (secondaryMenuScuolaItems.includes($(element).text().trim())) {
                numberOfMandatoryVoicesPresent++
            }

            elementsFound.push($(element).text().trim())
        }

        const missingVoicesPercentage: any = (((secondaryMenuScuolaItems.length - numberOfMandatoryVoicesPresent) / secondaryMenuScuolaItems.length) * 100).toFixed(0)

        let correctOrder = true
        const correctOrderResult = await checkOrder(secondaryMenuScuolaItems, elementsFound)
        if (correctOrderResult.numberOfElementsNotInSequence > 0) {
            correctOrder = false
        }

        if (missingVoicesPercentage > 30) {
            score = 0
        } else if (missingVoicesPercentage <= 30 && !correctOrder) {
            score = 0.5
        } else if (missingVoicesPercentage <= 30 && correctOrder) {
            score = 1
        }

        const items = [
            {
                missing_voices: secondaryMenuScuolaItems.filter(val => !elementsFound.includes(val)).join(', '),
                missing_voices_percentage : missingVoicesPercentage + '%',
                correct_order : correctOrder,
                elements_not_in_correct_order: correctOrderResult.elementsNotInSequence.join(', '),
                model_link: 'https://docs.google.com/drawings/d/1qzpCZrTc1x7IxdQ9WEw_wO0qn-mUk6mIRtSgJlmIz7g/edit'
            }
        ]

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit