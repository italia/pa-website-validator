'use strict';

import gatherer from "lighthouse/types/gatherer";
import PassContext = gatherer.PassContext;
import LoadData = gatherer.LoadData;

const { Gatherer } = require('lighthouse');

class securityHttpsIsPresent extends Gatherer {
    afterPass(options: PassContext, loadData: LoadData) {
        const expression = `window.location.protocol`;
        const driver = options.driver;

        return driver.evaluateAsync(expression);
    }
}

module.exports = securityHttpsIsPresent;