"use strict";

import gatherer from "lighthouse/types/gatherer";
import PassContext = gatherer.PassContext;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

class bootstrapItaliaSelectorCheck extends lighthouse.Gatherer {
  afterPass(options: PassContext) {
    const expression = `getComputedStyle(document.body).getPropertyValue('--bootstrap-italia-version') || null`;

    const driver = options.driver;

    return driver.evaluateAsync(expression);
  }
}

module.exports = bootstrapItaliaSelectorCheck;
