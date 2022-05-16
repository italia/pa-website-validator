'use strict'
// @ts-ignore
import lighthouse from "lighthouse"

const Audit = lighthouse.Audit

class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-ux-ui-consistency-bootstrap-check',
            title: 'Versione di bootstrap',
            failureTitle: 'La versione di bootstrap è troppo vecchia o non è stata trovata, versioni supportate: >=4',
            scoreDisplayMode: Audit.SCORING_MODES.BINARY,
            description: "Test per verificare la versione della libreria bootstrap",
            requiredArtifacts: ['bootstrapCheck']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const bootstrapVersion = artifacts.bootstrapCheck

        let score = 0
        const headings = [
            { key: 'bootstrap_version', itemType: 'text', text: "Versione di Bootstrap corrente" }
        ]
        let items = [ { bootstrap_version: bootstrapVersion } ]

        if (bootstrapVersion !== '0') {
            const detailVersioning = bootstrapVersion.split('.')
            const mainVersion = parseInt(detailVersioning[0])
            if (mainVersion >= 4) {
                score = 1
            }
        }

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit