import { Element } from "cheerio";

declare namespace crawlerTypes {
  interface cipher {
    version: string;
  }

  interface links {
    text: string;
    className: string;
  }

  interface cipherInfo {
    version: string;
    standardName: string;
  }

  interface servizi {
    containsAllTheMandatoryItems: boolean;
    rightOrder: boolean;
    missingItems: string[];
  }

  interface secondaryModelMenu {
    passed: boolean;
    items: Array<Element>;
    rawText: string[];
    missingItems: Array<string>;
  }

  interface primaryModelMenu {
    passed: boolean;
    rightOrder: boolean;
    items: Array<Element>;
    rawText: string[];
    missingItems: Array<string>;
  }

  interface cookie {
    inspected_page: string;
    cookie_name: string;
    cookie_value: string;
    cookie_domain: string;
    is_correct: boolean;
  }

  interface orderResult {
    numberOfElementsNotInSequence: number;
    elementsNotInSequence: string[];
  }

  interface vocabularyResult {
    allArgumentsInVocabulary: boolean;
    elementNotIncluded: string[];
    elementIncluded: string[];
  }

  interface requestPages {
    type: string;
    numberOfPages: number;
  }
}

export default crawlerTypes;
