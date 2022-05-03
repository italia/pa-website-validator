'use strict'

import { LH } from "lighthouse"
import { Cheerio, CheerioAPI, Element } from "cheerio"
import crawlerTypes from "../../../types/crawler-types"
import primaryModelMenu = crawlerTypes.primaryModelMenu
import secondaryModelMenu = crawlerTypes.secondaryModelMenu
import _ from "lodash"

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
        let listMatchPrimaryMenuModelObj : primaryModelMenu = {
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

        if (headerMenuPassed) {
            score = 1
        }

        const headings = [
            { key: 'header_missing_first_level_voices', itemType: 'text', text: "Voci di primo livello mancanti (o diverse) nell'header" },
            { key: 'header_first_level_voices_order', itemType: 'text', text: "Ordine delle voci di primo livello nell'header" },
            { key: 'model_link', itemType: 'url', text: "Link al modello di riferimento" },
        ]

        const items = [
            {
                header_missing_first_level_voices: headerFirstLevelMissingItems.length === 0 ? 'nessuna' : headerFirstLevelMissingItems.join(', '),
                header_first_level_voices_order : headerFirstLevelOrder ? 'rispettato' : 'non rispettato',
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

function listMatchPrimaryMenuModel(list: Cheerio<Element>, $: CheerioAPI) : primaryModelMenu {
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
            'missingItems': _.difference(primaryMenuItems, passedRawText)
        }
    }

    if (count >= 4) {
        return {
            'passed' : true,
            'rightOrder': rightOrder,
            'items' : passedItems,
            'rawText' : passedRawText,
            'missingItems': _.difference(primaryMenuItems, passedRawText)
        }
    }

    return {
      'passed' : false,
      'rightOrder': rightOrder,
      'items' : passedItems,
      'rawText' : passedRawText,
      'missingItems': _.difference(primaryMenuItems, passedRawText)
    }
}
