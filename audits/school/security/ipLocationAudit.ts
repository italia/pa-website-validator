'use strict'

import { LH } from "lighthouse"

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
const geoip = require('geoip-lite')

// @ts-ignore
import * as fs from "fs"

// @ts-ignore
import * as dns from "dns"

// @ts-ignore
import * as util from "util"

// @ts-ignore
const storageFolder = __dirname + '/../../../storage/school'

// @ts-ignore
const allowedCountriesFiles = 'allowedCountries.json'

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-security-ip-location',
            title: 'Localizzazione indirizzo IP',
            failureTitle: "L'indirizzo IP non rientra in uno stato membro dell'UE",
            scoreDisplayMode: Audit.SCORING_MODES.BINARY,
            description: "Test per verificare l'area geografica dell'IP della macchina su cui è hostato il sito web",
            requiredArtifacts: ['securityIpLocation']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const hostname = artifacts.securityIpLocation

        // @ts-ignore
        const allowedCountriesItems = JSON.parse(fs.readFileSync(storageFolder + '/' + allowedCountriesFiles))
        const allowedCountries = allowedCountriesItems.allowedCountries

        let score = 0
        const headings = [
            { key: 'ip_city', itemType: 'text', text: "Città indirizzo IP" },
            { key: 'ip_country', itemType: 'text', text: "Paese indirizzo IP" }
        ]
        let items = [ { ip_city: '', ip_country: '' } ]

        if (Boolean(hostname)) {
            const lookup = util.promisify(dns.lookup)
            const ip = await lookup(hostname)

            if (Boolean(ip) && Boolean(ip.address)) {
                const ipInformation = await geoip.lookup(ip.address)

                if (Boolean(ipInformation) && Boolean(ipInformation.country)) {
                    if (allowedCountries.includes(ipInformation.country)) {
                        score = 1
                    }

                    items[0].ip_city = ipInformation.city ?? ''
                    items[0].ip_country = ipInformation.country ?? ''
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