'use strict'
import * as dns from "dns"
import * as util from "util"
import geoip from "geoip-lite"
// @ts-ignore
import lighthouse from "lighthouse"

const Audit = lighthouse.Audit
const storageFolder = __dirname + '/../../../storage/common'
const allowedCountriesFiles = 'allowedCountries.json'
const allowedCountriesItems = require(storageFolder + '/' + allowedCountriesFiles)

class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'common-security-ip-location',
            title: 'Localizzazione indirizzo IP',
            failureTitle: "L'indirizzo IP non rientra in uno stato membro dell'UE",
            scoreDisplayMode: Audit.SCORING_MODES.BINARY,
            description: "Test per verificare l'area geografica dell'IP della macchina su cui è hostato il sito web",
            requiredArtifacts: ['securityIpLocation']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const hostname = artifacts.securityIpLocation

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
                const ipInformation = geoip.lookup(ip.address)

                if (ipInformation !== null) {
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