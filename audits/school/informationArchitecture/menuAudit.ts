'use strict';

import { LH } from "lighthouse"
import {Cheerio, CheerioAPI, Element} from "cheerio";

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
const got = require('got')

// @ts-ignore
const fs = require('fs')

// @ts-ignore
const storageFolder = __dirname + '/../../../storage/school'

const cheerio = require('cheerio')
const menuItemsFile = 'menuItems.json'

interface primaryModelMenuInterface {
    passed : boolean,
    rightOrder: boolean,
    items: Array<Element>,
    rawText : string [],
    missingItems: []
}

interface secondaryModelMenuInterface {
    passed : boolean,
    items : Array<Element>,
    rawText : string [],
    missingItems: []
}

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-menu-structure-match-model',
            title: 'Il menu rispetta le indicazioni fornite dal modello',
            failureTitle: 'Il menu non rispetta le indicazioni fornite dal modello',
            scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
            description: 'Test per verificare il rispetto delle regole per la costruzione del menu principale',
            requiredArtifacts: ['menuStructureMatchModel'],
        };
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const url = artifacts.menuStructureMatchModel
        const response = await got(url)
	    const $ : CheerioAPI = cheerio.load(response.body);

        let score = 0

        let headerMenuPassed = false

        const headerUl = $('header').find('ul')
        let listMatchPrimaryMenuModelObj : primaryModelMenuInterface = {
            'passed' : false,
            'rightOrder': false,
            'items' : [],
            'rawText' : [],
            'missingItems': []
        }
        let headerFirstLevelMissingItems = []
        let headerFirstLevelPassedItems = []
        let headerFirstLevelOrder = false
        let isFirstUl = true

        for (let ul of headerUl) {
            const listLi : Cheerio<Element> = $(ul).find('> li > a')

            listMatchPrimaryMenuModelObj = listMatchPrimaryMenuModel(listLi, $)
            if (listMatchPrimaryMenuModelObj.missingItems.length < headerFirstLevelMissingItems.length || isFirstUl) {
                isFirstUl = false
                headerFirstLevelMissingItems = listMatchPrimaryMenuModelObj.missingItems
                headerFirstLevelPassedItems = listMatchPrimaryMenuModelObj.items
                headerFirstLevelOrder = listMatchPrimaryMenuModel(listLi, $).rightOrder
            }

            if (listMatchPrimaryMenuModelObj.passed) {
                headerMenuPassed = true
            }
        }

        let headerSubmenuPassed = true
        let headerFirstLevelVoicesWithIncorrectSecondLevelVoices = []
        for (let i = 0; i < headerFirstLevelPassedItems.length; i++) {
            const listLi : Cheerio<Element> = $(headerFirstLevelPassedItems[i]).parent().find('ul li')

            if (!listMatchSecondaryMenuModel(headerFirstLevelPassedItems[i], listLi, $).passed) {
                headerFirstLevelVoicesWithIncorrectSecondLevelVoices.push($(headerFirstLevelPassedItems[i]).text().trim())
                headerSubmenuPassed = false
            }
        }

        if (headerMenuPassed && headerSubmenuPassed) {
            score = 1
        }

        const headings = [
            { key: 'header_missing_first_level_voices', itemType: 'text', text: "Voci di primo livello mancanti nell'header" },
            { key: 'header_first_level_voices_order', itemType: 'text', text: "Ordine delle voci di primo livello nell'header" },
            { key: 'header_first_level_voices_with_incorrect_second_level_voices', itemType: 'text', text: "Voci di primo livello che non contengono una corretta quantità di voci di secondo livello (la quantità deve corrispondere almeno al 50% delle voci di secondo livello presenti nel modello di riferimento)" },
            { key: 'model_link', itemType: 'url', text: "Link al modello di riferimento" },
        ]

        const items = [
            {
                header_missing_first_level_voices: headerFirstLevelMissingItems.length === 0 ? 'nessuna' : headerFirstLevelMissingItems.join(', '),
                header_first_level_voices_order : headerFirstLevelOrder ? 'rispettato' : 'non rispettato',
                header_first_level_voices_with_incorrect_second_level_voices: headerFirstLevelVoicesWithIncorrectSecondLevelVoices.length === 0 ? 'nessuna' : headerFirstLevelVoicesWithIncorrectSecondLevelVoices.join(', '),
                model_link: 'https://docs.google.com/drawings/d/1qzpCZrTc1x7IxdQ9WEw_wO0qn-mUk6mIRtSgJlmIz7g/edit'
            }
        ]

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit;

function listMatchPrimaryMenuModel(list: Cheerio<Element>, $: CheerioAPI) : primaryModelMenuInterface {
    const menuItems = JSON.parse(fs.readFileSync(storageFolder + '/' + menuItemsFile))
    const primaryMenuItems = menuItems.primaryMenuItems

    let passedItems : Array<Element> = []
    let passedRawText : string [] = []
    let rightOrder = true
    let count = 0
    let found = -1
    for (let i = 0; i < list.length; i++) {
       for (let j = 0; j < primaryMenuItems.length; j++) {
            if ($(list[i]).text().trim() == primaryMenuItems[j]) {
                if (j < found) {
                    rightOrder = false
                }
                found = j
                passedItems.push(list[i])
                passedRawText.push(primaryMenuItems[j])
                count++
            }
       }
    }

    if (rightOrder == false) {
        return {
            'passed' : false,
            'rightOrder': rightOrder,
            'items' : passedItems,
            'rawText' : passedRawText,
            'missingItems': difference(primaryMenuItems,passedRawText)
        }
    }

    if (count >= 4) {
        return {
            'passed' : true,
            'rightOrder': rightOrder,
            'items' : passedItems,
            'rawText' : passedRawText,
            'missingItems': difference(primaryMenuItems,passedRawText)
        }
    }

    return {
      'passed' : false,
      'rightOrder': rightOrder,
      'items' : passedItems,
      'rawText' : passedRawText,
      'missingItems': difference(primaryMenuItems,passedRawText)
    }
}

function listMatchSecondaryMenuModel(item: Array<Element>, list: Cheerio<Element>, $: CheerioAPI) : secondaryModelMenuInterface {
    const menuItems = JSON.parse(fs.readFileSync(storageFolder + '/' + menuItemsFile))
    const secondaryMenuItems = menuItems.secondaryMenuItems

    const h4Text = $(item).text().trim()
    let count = 0
    let passedItems = []
    let passedRawText = []
    for (let i = 0; i < list.length; i++){
        if (Boolean(secondaryMenuItems[h4Text]) && secondaryMenuItems[h4Text].includes($(list[i]).text().trim())) {
            count++
            passedItems.push(list[i])
            passedRawText.push($(list[i]).text().trim())
        }
    }

    if (Boolean(secondaryMenuItems[h4Text]) && count >= (secondaryMenuItems[h4Text].length/2)) {
        return {
            'passed' : true,
            'items' : passedItems,
            'rawText' : passedRawText,
            'missingItems': difference(secondaryMenuItems[h4Text],passedRawText)
        }
    }

    return {
        'passed' : false,
        'items' : passedItems,
        'rawText' : passedRawText,
        'missingItems': difference(secondaryMenuItems[h4Text],passedRawText)
    }
}

function difference(array1: [], array2: string []) : [] {
    let result: [] = []

    for (let a of array1) {
        if (!array2.includes(a)) {
            result.push(a)
        }
    }

    return result
}