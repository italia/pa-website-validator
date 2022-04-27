'use strict'

import gatherer from "lighthouse/types/gatherer"
import PassContext = gatherer.PassContext
import LoadData = gatherer.LoadData

const { Gatherer } = require('lighthouse')

class legislationAccessibilityDeclarationIsPresent extends Gatherer {
    afterPass(options: PassContext, loadData: LoadData) {
        const expression = `window.location.origin`
        const driver = options.driver

        return driver.evaluateAsync(expression)
    }
}

module.exports = legislationAccessibilityDeclarationIsPresent