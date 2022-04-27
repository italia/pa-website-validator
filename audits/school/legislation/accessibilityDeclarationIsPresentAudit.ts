'use strict'

import { CheerioAPI } from "cheerio"

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
const got = require('got')

// @ts-ignore
const cheerio = require('cheerio')

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-legislation-accessibility-declaration-is-present',
            title: 'Presenza Dichiarazione di Accessibilità',
            failureTitle: 'La dichiarazione di accessibilità non è presente',
            scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
            description: 'Test per controllare che il dominio presenti la Dichiarazione di Accessibilità',
            requiredArtifacts: ['legislationAccessibilityDeclarationIsPresent']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number }> {
        const origin = artifacts.legislationAccessibilityDeclarationIsPresent

        const request = await got(origin)
        const DOM = request.body
        let score = 0

        try {
            const $ : CheerioAPI = cheerio.load(DOM);
            const footer : string = $('footer').prop('outerHTML')

            if (Boolean(footer)) {
                const aTags = $(footer).find('a')

                for (let a of aTags) {
                    if (Boolean($(a).attr('href')) && $(a).attr('href').includes('form.agid.gov.it') && $(a).text().toLowerCase().includes('accessibilit')) {
                        score = 1
                        break
                    }
                }
            }
        } catch (e) {
            score = 0
        }

        return {
            score: score
        }
    }
}

module.exports = LoadAudit