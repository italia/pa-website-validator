'use strict';

import { LH } from "lighthouse"
import { CheerioAPI } from "cheerio";

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
import * as cheerio from "cheerio"

// @ts-ignore
const themePossibleNames = [
    'design-scuole-wordpress'
]

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-ux-ui-consistency-theme-check',
            title: 'Tema wordpress',
            failureTitle: 'Non è presente il tema wordpress richiesto o il tema è stato rinominato',
            scoreDisplayMode: Audit.SCORING_MODES.BINARY,
            description: "Test per verificare l'utilizzo del tema wordpress corretto",
            requiredArtifacts: ['themeCheck']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const headHtml = artifacts.themeCheck

        let score = 0
        const headings = [
            { key: 'theme_element', itemType: 'text', text: "Elemento tema in uso" },
            { key: 'theme_element_version', itemType: 'text', text: "Versione elemento tema in uso" },
        ]
        let items = []

        const $ : CheerioAPI = cheerio.load(headHtml);
        const linkTags = $('html').find('link')

        for (let linkTag of linkTags) {
            const cleanLinkHref = linkTag.attribs.href.replace('http://www.', '').replace('https://www.', '')
            const splitCleanLinkHref = cleanLinkHref.split('/')

            if (containsPossibleThemeName(splitCleanLinkHref)) {
                score = 1
                const themeElement = splitCleanLinkHref[splitCleanLinkHref.length - 1]
                const splitThemeElement = themeElement.split('?')
                const splitThemeElementVersion = splitThemeElement[1].split('=')[1]

                items.push({
                    theme_element: splitThemeElement[0],
                    theme_element_version: splitThemeElementVersion,
                })
            }
        }

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit;

// @ts-ignore
function containsPossibleThemeName(array: Array<string>) : boolean {
    for (let element of array) {
        for (let name of themePossibleNames) {
            if (element.includes(name)) {
                return true
            }
        }
    }

    return false
}