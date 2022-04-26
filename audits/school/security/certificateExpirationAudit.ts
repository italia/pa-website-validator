'use strict'

import { LH } from "lighthouse"

// @ts-ignore
const Audit = require('lighthouse').Audit

const sslCertificate = require('get-ssl-certificate')

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-security-certificate-expiration',
            title: 'Scadenza del certificato',
            failureTitle: 'Il certificato è scaduto',
            scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
            description: 'Test per controllare se il certificato è scaduto',
            requiredArtifacts: ['securityCertificateExpiration'],
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const hostname = artifacts.securityCertificateExpiration

        let score = 0

        const headings = [
            { key: 'valid_from', itemType: 'text', text: "Data inizio validità certificato" },
            { key: 'valid_to', itemType: 'text', text: "Data fine validità del certificato" }
        ]

        let items = [ { valid_from: '', valid_to: '' } ]

        if (Boolean(hostname)) {
            const certificate = await sslCertificate.get(hostname)

            if (Boolean(certificate)) {
                const validFromTimestamp = Date.parse(certificate.valid_from ?? null)
                const validToTimestamp = Date.parse(certificate.valid_to ?? null)

                if (!isNaN(validFromTimestamp) && !isNaN(validToTimestamp)) {
                    let todayTimestamp = Date.now()
                    if (todayTimestamp > validFromTimestamp && todayTimestamp < validToTimestamp) {
                        score = 1
                    }
                }

                items[0].valid_from = certificate.valid_from ?? ''
                items[0].valid_to = certificate.valid_to ?? ''
            }
        }

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit