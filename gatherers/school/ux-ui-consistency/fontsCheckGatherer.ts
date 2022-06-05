"use strict";

import gatherer from "lighthouse/types/gatherer";
import PassContext = gatherer.PassContext;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

class fontsCheck extends lighthouse.Gatherer {
  afterPass(options: PassContext) {
    const expression = `getComputedStyle(document.body).fontFamily`;

    const driver = options.driver;

    return driver.evaluateAsync(expression);
  }
}

module.exports = fontsCheck;
