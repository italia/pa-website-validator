'use strict'

// @ts-ignore
import lighthouse from "lighthouse"

const Audit = lighthouse.Audit
const storageFolder = __dirname + '/../../../storage/school'
const allowedDomainsFile = 'allowedDomains.json'
const allowedDomains = require(storageFolder + '/' + allowedDomainsFile)

class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-security-domain-name-check',
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

        const headings = [
            { key: 'domain_name', itemType: 'text', text: "Dominio corrente" },
            { key: 'domain_rule', itemType: 'text', text: "Regola: deve contenere" }
        ]

        for (let domain of allowedDomains.domains) {
            if (hostname.includes(domain)) {
                score = 1
                break
            }
        }

        const items = [ { domain_name: hostname, domain_rule: '.it' } ]

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit