'use strict';

import { LH } from "lighthouse"

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
const cheerio = require('cheerio')

// @ts-ignore
const https = require("https")

const currentVersion = '1.1.0'

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-ux-ui-consistency-theme-version-check',
            title: 'Versione tema wordpress',
            failureTitle: 'La versione del tema wordpress non è allineata alla più recente',
            scoreDisplayMode: Audit.SCORING_MODES.BINARY,
            description: "Test per verificare la corretta versione del tema",
            requiredArtifacts: ['themeVersionCheck']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const headHtml = artifacts.themeVersionCheck

        let score = 0
        const headings = [
            { key: 'current_theme_manifest', itemType: 'text', text: "Versione corrente del tema" },
            { key: 'theme_version_required', itemType: 'text', text: "Versione del tema richiesta" },
            { key: 'checked_element', itemType: 'text', text: "Elemento controllato" },
        ]
        let items = []

        const $ = cheerio.load(headHtml);
        const linkTags = $('html').find('link')
        const versionToCheck = 'Version: ' + currentVersion

        let themeManifest = ''
        let styleCSSurl = ''
        for (let linkTag of linkTags) {
            if (linkTag.attribs.href.includes('style.css')) {
                styleCSSurl = linkTag.attribs.href
                const CSS = await getCSS(styleCSSurl)
                if (CSS.includes(versionToCheck)) {
                    score = 1
                }

                themeManifest = CSS.split('/*!').pop().split('*/')[0]
            }
        }

        items.push({
            current_theme_manifest: themeManifest,
            theme_version_required: currentVersion,
            checked_element: styleCSSurl
        })

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit

async function getCSS(hostname: string) : Promise<string> {
    return new Promise(function(resolve, reject) {
        https.request(hostname,  function(res) {
            let data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                resolve(data)
            });
        }).end()
    })
}