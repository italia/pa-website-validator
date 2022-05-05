'use strict'

import { LH } from "lighthouse"

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-security-https-is-present',
            title: 'Presenza protocollo HTTPS',
            failureTitle: 'Il protocollo HTTPS non è presente',
            scoreDisplayMode: Audit.SCORING_MODES.BINARY,
            description: 'Test per controllare che il dominio utilizzi il protocollo HTTPS',
            requiredArtifacts: ['securityHttpsIsPresent']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const protocol = artifacts.securityHttpsIsPresent.replace(':','') ?? ''
        let score = 1

        const items = [ { protocol: protocol } ]

        const headings = [ { key: 'protocol', itemType: 'text', text: "Protocollo usato dal dominio" } ]

        if (!Boolean(protocol) || protocol !== 'https') {
            score = 0
        }

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit