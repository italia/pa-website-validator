'use strict';
import gatherer from "lighthouse/types/gatherer";
import PassContext = gatherer.PassContext;
import LoadData = gatherer.LoadData;

const { Gatherer } = require('lighthouse');

class bootstrapCheck extends Gatherer {
    async afterPass(options: PassContext, loadData: LoadData) {
        try {
            const expression = `(window.bootstrap !== undefined) ? window.bootstrap.Tooltip.VERSION : "0"`;
            const driver = options.driver;

            return driver.evaluateAsync(expression);
        } catch (exception) {

            return {}
        }
    }
}

module.exports = bootstrapCheck;