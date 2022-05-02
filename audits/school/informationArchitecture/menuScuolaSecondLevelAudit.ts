'use strict'

import { LH } from "lighthouse"
import {CheerioAPI} from "cheerio";
import {index} from "cheerio/lib/api/traversing";

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
const got = require('got')

// @ts-ignore
const cheerio = require('cheerio')

// @ts-ignore
const fs = require('fs')

const storageFolder = __dirname + '/../../../storage/school'
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
            { key: 'correct_order', itemType: 'text', text: "Sequenzialità delle voci obbligatorie rispettato" },
            { key: 'elements_not_in_correct_order', itemType: 'text', text: "Voci che non rispettano la sequenzialità" },
            { key: 'model_link', itemType: 'url', text: "Link al modello di riferimento" },
        ]

        const response = await got(url)
	    const $ : CheerioAPI = cheerio.load(response.body)

        const menuItems = JSON.parse(fs.readFileSync(storageFolder + '/' + menuItemsFile))
        const secondaryMenuScuolaItems = menuItems.secondaryMenuItems.Scuola

        let score
        let missingVoicesPercentage: any = 0

        const headerUl = $('#menu-la-scuola').find('li')
        let numberOfMandatoryVoicesPresent = 0
        let elementsFound = []
        for (let element of headerUl) {
            if (secondaryMenuScuolaItems.includes($(element).text().trim())) {
                numberOfMandatoryVoicesPresent++
            }

            elementsFound.push($(element).text().trim())
        }

        if (numberOfMandatoryVoicesPresent > 0) {
            missingVoicesPercentage = (((secondaryMenuScuolaItems.length - numberOfMandatoryVoicesPresent) / secondaryMenuScuolaItems.length) * 100).toFixed(0)
        }

        let correctOrder = true
        const correctOrderResult = await checkOrder(secondaryMenuScuolaItems, elementsFound)

        if (correctOrderResult.numberOfElementsNotInSequence > 0) {
            correctOrder = false
        }

        if (missingVoicesPercentage > 30) {
            score = 0
        } else if (missingVoicesPercentage <= 30 && !correctOrder) {
            score = 0.5
        } else {
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

async function checkOrder(mandatoryElements: string [], foundElements: string []) : Promise<{ numberOfElementsNotInSequence: number, elementsNotInSequence: string []}> {
    let newMandatoryElements = []
    let newFoundElements = []
    let numberOfElementsNotInSequence : number = 0
    let elementsNotInSequence : string [] = []

    for (let mandatoryElement of mandatoryElements) {
        if (foundElements.includes(mandatoryElement)) {
            newMandatoryElements.push(mandatoryElement)
        }
    }

    for (let foundElement of foundElements) {
        if (newMandatoryElements.includes(foundElement)) {
            newFoundElements.push(foundElement)
        }
    }

    for (let i = 0; i < newFoundElements.length; i++) {
        let indexInMandatory = newMandatoryElements.indexOf(newFoundElements[i])
        let isInSequence = true

        if (indexInMandatory != (newMandatoryElements.length - 1)) {
            if (i === (newFoundElements.length - 1)) {
                isInSequence = false
            } else if (newFoundElements[i + 1] != newMandatoryElements[indexInMandatory + 1]){
                isInSequence = false
            }
        }

        if (indexInMandatory != 0) {
            if (i === 0) {
                isInSequence = false
            } else if (newFoundElements[i - 1] != newMandatoryElements[indexInMandatory - 1]) {
                isInSequence = false
            }
        }

        if (!isInSequence) {
            numberOfElementsNotInSequence++
            elementsNotInSequence.push(newFoundElements[i])
        }
    }

    return {
        numberOfElementsNotInSequence: numberOfElementsNotInSequence,
        elementsNotInSequence: elementsNotInSequence
    }
}