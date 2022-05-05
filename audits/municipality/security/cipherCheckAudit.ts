'use strict'

import { LH } from "lighthouse"
import crawlerTypes from "../../../types/crawler-types"
import cipherInfo = crawlerTypes.cipherInfo

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
const https = require('https')

// @ts-ignore
const fs = require('fs')

// @ts-ignore
const storageFolder = __dirname + '/../../../storage/municipality'

const allowedCiphersFile = 'allowedCiphers.json'

class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'municipality-security-cipher-check',
            title: 'Versione della suite di cifratura',
            failureTitle: 'La versione della suite di cifratura non è valida',
            scoreDisplayMode: Audit.SCORING_MODES.BINARY,
            description: 'Test per controllare se la versione della suite di cifratura',
            requiredArtifacts: ['securityCipherCheck']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const hostname = artifacts.securityCipherCheck
        const allowedCiphersItems = JSON.parse(fs.readFileSync(storageFolder + '/' + allowedCiphersFile))

        let score = 0
        const headings = [
            { key: 'tls_version', itemType: 'text', text: "Versione del certificato corrente" },
            { key: 'cipher_version', itemType: 'text', text: "Versione della suite di cifratura corrente" },
            { key: 'allowed_tls12_versions', itemType: 'text', text: "Versione suite accettate per TLSv1.2" },
            { key: 'allowed_tls13_versions', itemType: 'text', text: "Versione suite accettate per TLSv1.3" }
        ]

        let allowedTls12 = ''
        allowedCiphersItems.tls12.forEach(item => allowedTls12+=item+' | ')

        let allowedTls13 = ''
        allowedCiphersItems.tls13.forEach(item => allowedTls13+=item+' | ')

        let items = [
            {
                tls_version: '',
                cipher_version: '',
                allowed_tls12_versions: allowedTls12,
                allowed_tls13_versions: allowedTls13
            }
        ]

        const cipherInfo: cipherInfo = {
            version: await getCipherVersion(hostname),
            standardName: await getCipherStandardName(hostname)
        }

        if (Boolean(cipherInfo) && Boolean(cipherInfo.version)) {
            switch(cipherInfo.version) {
                case 'TLSv1.2':
                    if (allowedCiphersItems.tls12.includes(cipherInfo.standardName)) {
                        score = 1
                    }
                    break
                case 'TLSv1.3':
                    if (allowedCiphersItems.tls13.includes(cipherInfo.standardName)) {
                        score = 1
                    }
                    break
                default:
                    score = 0
            }

            items[0].tls_version = cipherInfo.version ?? ''
            items[0].cipher_version = cipherInfo.standardName ?? ''
        }

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit

// @ts-ignore
async function getCipherVersion(hostname: string) : Promise<string> {
    return new Promise(function(resolve, reject) {
        https.request(hostname,  function(res) {
            resolve(res.socket.getCipher().version)
        }).end()
    })
}

async function getCipherStandardName(hostname: string) : Promise<string> {
    return new Promise(function(resolve, reject) {
        https.request(hostname,  function(res) {
            resolve(res.socket.getCipher().standardName)
        }).end()
    })
}