'use strict'

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
import * as fs from "fs"

// @ts-ignore
const storageFolder = __dirname + '/../../../storage/municipality'

// @ts-ignore
const allowedDomainsFile = 'allowedDomains.json'

class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'municipality-security-domain-name-check',
            title: 'Nome del dominio',
            failureTitle: 'Il dominio non rispetta le regole del dominio istituzionale',
            scoreDisplayMode: Audit.SCORING_MODES.BINARY,
            description: 'Test per controllare se il dominio rispetti le regole del dominio istituzionale',
            requiredArtifacts: ['securityDomainNameCheck']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const hostname = artifacts.securityDomainNameCheck

        let score = 0
        const headings = [ { key: 'domain_name', itemType: 'text', text: "Dominio corrente" } ]

        // @ts-ignore
        const allowedDomains = JSON.parse(fs.readFileSync(storageFolder + '/' + allowedDomainsFile))

        for (let domain of allowedDomains.domains) {
            if (hostname.includes(domain)) {
                score = 1
                break
            }
        }

        let items = [ { domain_name: hostname } ]

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit