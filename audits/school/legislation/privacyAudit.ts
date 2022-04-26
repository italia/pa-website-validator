'use strict';

// @ts-ignore
const Audit = require('lighthouse').Audit;

// @ts-ignore
const fs = require('fs')

//@ts-ignore
const storageFolder = __dirname + '/../../../storage/school'

const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const allowedPrivacyPolicyWordsFile = 'allowedPrivacyPolicyWords.json'

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-legislation-privacy-is-present',
            title: 'Presenza del link per la privacy policy',
            failureTitle: 'Non è presente il link per la privacy policy',
            scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
            description: 'Test per verificare la presenza del link per la privacy policy',
            requiredArtifacts: ['legislationPrivacyIsPresent'],
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number }> {
        const url = artifacts.legislationPrivacyIsPresent
        const response = await got(url)
        const dom = new JSDOM(response.body);

        let score = 0
        const footerLinks = dom.window.document.querySelectorAll('footer a')
        for (let a of footerLinks) {
            if (includesPrivacyPolicyWords(a.text.toLowerCase())) {
                score = 1
                break
            }
        }

        return {
            score: score
        }
    }
}

module.exports = LoadAudit

function includesPrivacyPolicyWords(text: string) : boolean {
    const allowedPrivacyPolicyItems = JSON.parse(fs.readFileSync(storageFolder + '/' + allowedPrivacyPolicyWordsFile))
    const allowedPrivacyPolicyWords = allowedPrivacyPolicyItems.allowedNames

    for (let word of allowedPrivacyPolicyWords){
        if (text.includes(word)){
            return true
        }
    }

    return false
}