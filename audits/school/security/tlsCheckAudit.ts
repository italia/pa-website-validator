'use strict';

import { LH } from "lighthouse"

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
const https = require('https')

const allowedTlsVersions = ['TLSv1.2', 'TLSv1.3']

interface cipher {
    version: string;
}

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-security-tls-check',
            title: 'Versione del TLS',
            failureTitle: 'La versione del TLS non è valida, sono valide: TLSv1.2 e TLSv1.3',
            scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
            description: 'Test per controllare se la versione del TLS è corretta',
            requiredArtifacts: ['securityTlsCheck']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const hostname = artifacts.securityTlsCheck

        let score = 0
        const headings = [
            { key: 'tls_version', itemType: 'text', text: "Versione del certificato corrente" }
        ]
        let items = [ { tls_version: '' } ]

        const cipherInfo: cipher = {
            version: await getCipherVersion(hostname)
        }
        if (Boolean(cipherInfo) && Boolean(cipherInfo.version)) {
            if (allowedTlsVersions.includes(cipherInfo.version)) {
                score = 1
            }

            items[0].tls_version = cipherInfo.version ?? ''
        }

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }

}

module.exports = LoadAudit;

// @ts-ignore
async function getCipherVersion(hostname: string) : Promise<string> {
    return new Promise(function(resolve, reject) {
        https.request(hostname,  function(res) {
            resolve(res.socket.getCipher().version)
        }).end()
    })
}