"use strict";

import gatherer from "lighthouse/types/gatherer";
import PassContext = gatherer.PassContext;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

class bootstrapItaliaWPCheck extends lighthouse.Gatherer {
  afterPass(options: PassContext) {
    const expression = `document.getElementsByTagName('head')[0].innerHTML`;

    const driver = options.driver;

    return driver.evaluateAsync(expression);
  }
}

module.exports = bootstrapItaliaWPCheck;
