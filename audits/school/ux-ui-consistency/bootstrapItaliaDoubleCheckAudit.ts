'use strict'

import { CheerioAPI } from "cheerio"

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
import * as cheerio from "cheerio"

// @ts-ignore
const themePossibleNames = [
    'design-scuole-wordpress'
]

const bootstrapItaliaLibraryName = 'bootstrap-italia.css'

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-ux-ui-consistency-bootstrap-italia-double-check',
            title: 'Libreria bootstrap italia',
            failureTitle: 'Non è presente la libreria bootstap italia o la versione è obsoleta (richiesta >= 4.*.* o >= 1.6.2)',
            scoreDisplayMode: Audit.SCORING_MODES.BINARY,
            description: "Test per verificare la presenza della libreria bootstrap italia",
            requiredArtifacts: ['bootstrapItaliaWPCheck', 'bootstrapItaliaCheck']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const headHtml = artifacts.bootstrapItaliaWPCheck
        const bootstrapItaliaVariableVersion = artifacts.bootstrapItaliaCheck

        const headings = [
            { key: 'library_name', itemType: 'text', text: "Nome libreria in uso" },
            { key: 'library_version', itemType: 'text', text: "Versione libreria in uso" },
            { key: 'library_required_version', itemType: 'text', text: "Versione libreria richiesta" },
        ]
        let items = []
        let score = 0

        if (bootstrapItaliaVariableVersion != null) {
            const splittedVersion = bootstrapItaliaVariableVersion.split('.')
            const majorVersion = splittedVersion[0]
            const middleVersion = splittedVersion[1]

            if (parseInt(majorVersion) >= 1 && parseInt(middleVersion) >= 6) {
                score = 1
            }

            items.push({
                library_name: 'bootstrap-italia',
                library_version: bootstrapItaliaVariableVersion,
                library_required_version: '>= 1.6.*'
            })
        } else {
            const $ : CheerioAPI = cheerio.load(headHtml);
            const linkTags = $('html').find('link')

            for (let linkTag of linkTags) {
                const cleanLinkHref = linkTag.attribs.href.replace('http://www.', '').replace('https://www.', '')
                const splitCleanLinkHref = cleanLinkHref.split('/')
                if (containsPossibleThemeName(splitCleanLinkHref)) {
                    for (let element of splitCleanLinkHref) {
                        if (element.includes(bootstrapItaliaLibraryName)) {
                            const splitElement = element.split('?')
                            const libraryName = splitElement[0]
                            const libraryVersion = splitElement[1].split('=')[1]

                            const majorLibraryVersion = libraryVersion.split('.')
                            if (parseInt(majorLibraryVersion[0]) >= 4) {
                                score = 1
                            }

                            items.push({
                                library_name: libraryName,
                                library_version: libraryVersion,
                                library_required_version: '>= 4.*.*'
                            })

                            break
                        }
                    }
                }
            }
        }

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit

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