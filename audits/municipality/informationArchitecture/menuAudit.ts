'use strict'

import { Cheerio, CheerioAPI, Element } from "cheerio"
import crawlerTypes from "../../../types/crawler-types"
import primaryModelMenu = crawlerTypes.primaryModelMenu
import secondaryModelMenu = crawlerTypes.secondaryModelMenu

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
import got from "got"

// @ts-ignore
import * as cheerio from "cheerio"

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'municipality-menu-structure-match-model',
            title: 'Il menu rispetta le indicazioni fornite dal modello',
            failureTitle: 'Il menu non rispetta le indicazioni fornite dal modello',
            scoreDisplayMode: Audit.SCORING_MODES.BINARY,
            description: 'Test per verificare il rispetto delle regole per la costruzione del menu principale',
            requiredArtifacts: ['menuStructureMatchModel'],
        }
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
        let headerFirstLevelOrder = false
        let footerFirstLevelOrder = false
        let footerFirstLevelMissingItems = []
        let isFirstUl = true

        for (let ul of headerUl) {
            const listLi = $(ul).find('li')
            listMatchPrimaryMenuModelObj = listMatchPrimaryMenuModel(listLi, $)
            if (listMatchPrimaryMenuModelObj.missingItems.length < headerFirstLevelMissingItems.length || isFirstUl) {
                isFirstUl = false
                headerFirstLevelMissingItems = listMatchPrimaryMenuModelObj.missingItems
                headerFirstLevelOrder = listMatchPrimaryMenuModel(listLi, $).rightOrder
            }

            if (listMatchPrimaryMenuModelObj.passed){
                headerMenuPassed = true
            }
        }

        let footerMenuPassed = false

        const footerH4 = $('footer').find('h4')
        if (listMatchPrimaryMenuModel(footerH4, $).passed){
            footerMenuPassed = true
        }

        footerFirstLevelMissingItems = listMatchPrimaryMenuModel(footerH4, $).missingItems
        footerFirstLevelOrder = listMatchPrimaryMenuModel(footerH4, $).rightOrder

        let footerSubmenuPassed = true
        let footerFirstLevelVoicesWithIncorrectSecondLevelVoices = []

        if (footerMenuPassed){
            const passedItems = listMatchPrimaryMenuModel(footerH4, $).items
            for (let item of passedItems) {
                const parent = $(item).parent()
                const listLi : Cheerio<Element> = $(parent).find('ul li')
                if (!listMatchSecondaryMenuModel(item, listLi, $).passed) {
                    footerFirstLevelVoicesWithIncorrectSecondLevelVoices.push($(item).text().trim())
                    footerSubmenuPassed = false
                }
            }
        }

        if (headerMenuPassed == true && footerMenuPassed == true && footerSubmenuPassed == true){
            score = 1
        }

        const headings = [
            { key: 'header_first_level_voices_order', itemType: 'text', text: "Ordine delle voci di primo livello nell'header" },
            { key: 'header_missing_first_level_voices', itemType: 'text', text: "Voci di primo livello mancanti nell'header" },
            { key: 'footer_first_level_voices_order', itemType: 'text', text: "Ordine delle voci di primo livello nel footer" },
            { key: 'footer_missing_first_level_voices', itemType: 'text', text: "Voci di primo livello mancanti nel footer" },
            { key: 'footer_first_level_voices_with_incorrect_second_level_voices', itemType: 'text', text: "Voci di primo livello che non contengono una corretta quantità di voci di secondo livello" }
        ]

        const items = [
            {   header_first_level_voices_order : headerFirstLevelOrder ? 'rispettato' : 'non rispettato',
                header_missing_first_level_voices: JSON.stringify(headerFirstLevelMissingItems),
                footer_first_level_voices_order : footerFirstLevelOrder ? 'rispettato' : 'non rispettato',
                footer_missing_first_level_voices: JSON.stringify(footerFirstLevelMissingItems),
                footer_first_level_voices_with_incorrect_second_level_voices: JSON.stringify(footerFirstLevelVoicesWithIncorrectSecondLevelVoices)
            },
        ]

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit;

function listMatchPrimaryMenuModel(list: Cheerio<Element>, $: CheerioAPI) : primaryModelMenu {
    const primaryMenuItems = [
        'Amministrazione',
        'Novità',
        'Servizi', 
        'Documenti e dati',
        'Argomenti',
        'Area personale',
        'Cerca nel sito'
    ]

    let passedItems = []
    let passedRawText = []
    let rightOrder = true
    let count = 0
    let found = -1
    for (let i =0; i < list.length; i++){
       for (let j =0; j < primaryMenuItems.length; j++){
            if ($(list[i]).text().trim() == primaryMenuItems[j]){
                if (j < found){
                    rightOrder = false
                }
                found = j
                passedItems.push(list[i])
                passedRawText.push(primaryMenuItems[j])
                count++
            }
       }
    }

    if (rightOrder == false){
        return {
            'passed' : false,
            'rightOrder': rightOrder,
            'items' : passedItems,
            'rawText' : passedRawText,
            'missingItems': difference(primaryMenuItems, passedRawText)
        }
    }

    if (count >= 4){
        return {
            'passed' : true,
            'rightOrder': rightOrder,
            'items' : passedItems,
            'rawText' : passedRawText,
            'missingItems': difference(primaryMenuItems, passedRawText)
        }
    }

    return {
      'passed' : false,
      'rightOrder': rightOrder,
      'items' : passedItems,
      'rawText' : passedRawText,
      'missingItems': difference(primaryMenuItems, passedRawText)
    }
}

function listMatchSecondaryMenuModel(item: Element, list: Cheerio<Element>, $: CheerioAPI) : secondaryModelMenu {
    const secondaryMenuItems = {
        'Amministrazione' : [
            'Organi di governo',
            'Aree amministrative',
            'Uffici',
            'Enti e fondazioni',
            'Politici',
            'Personale amministrativo',
            'Luoghi'
        ],
        'Novità' : [
            'Notizie',
            'Comunicati',
            'Eventi'
        ],
        'Servizi' : [
            'Anagrafe e stato civile',
            'Cultura e tempo libero',
            'Vita lavorativa',
            'Attività produttive e commercio',
            'Appalti pubblici',
            'Catasto e urbanistica',
            'Turismo',
            'Mobilità e trasporti' ,
            'Educazione e formazione',
            'Giustizia e sicurezza pu,bblica',
            'Tributi e finanze',
            'Ambiente' ,
            'Salute, benessere e assistenza' ,
            'Autorizzazioni' ,
            'Agricoltura',
        ],
        'Documenti e dati' : [
            'Documenti albo pretorio',
            'Modulistica',
            'Documenti funzionamento interno',
            'Normative',
            'Accordi tra enti',
            'Documenti attività politica',
            'Rapporti (tecnici)',
            'Dataset',
        ],
        'Argomenti' : 'Lista argomenti',
        'Area personale' : [
            'Le mie pratiche',
            'Pagamenti',
            'Documenti',
            'Messaggi',
            'Scadenze',
            'Profilo',
        ],
        'Cerca nel sito': []
    }

    const h4Text = $(item).text().trim()
    let count=0
    let passedItems = []
    let passedRawText : Array<string> = []
    for (let i =0; i < list.length; i++){
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

function difference(array1: string [], array2: string []) : string [] {
    let result : string [] = []

    for (let a of array1) {
        if (!array2.includes(a)){
            result.push(a)
        }
    }

    return result
}