'use strict'

import gatherer from "lighthouse/types/gatherer"
import PassContext = gatherer.PassContext
import LoadData = gatherer.LoadData
// @ts-ignore
import lighthouse from "lighthouse"

class bootstrapCheck extends lighthouse.Gatherer {
    async afterPass(options: PassContext, loadData: LoadData) {
        try {
            const expression = `(window.bootstrap !== undefined) ? window.bootstrap.Tooltip.VERSION : "0"`
            const driver = options.driver

            return driver.evaluateAsync(expression)
        } catch (exception) {

            return {}
        }
    }
}

module.exports = bootstrapCheck