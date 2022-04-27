'use strict'

import gatherer from "lighthouse/types/gatherer"
import PassContext = gatherer.PassContext
import LoadData = gatherer.LoadData

const { Gatherer } = require('lighthouse')

class fontsCheck extends Gatherer {
    afterPass(options: PassContext, loadData: LoadData) {
        const expression = `getComputedStyle(document.body).fontFamily`

        const driver = options.driver

        return driver.evaluateAsync(expression)
    }
}

module.exports = fontsCheck