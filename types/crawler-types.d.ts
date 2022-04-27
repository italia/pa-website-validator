import { Element } from "cheerio"

declare module crawlerTypes {
    interface cipher {
        version: string
    }

    interface links {
        text: string,
        className: string
    }

    interface cipherInfo {
        version: string,
        standardName: string
    }

    interface servizi {
        containsAllTheMandatoryItems: boolean,
        rightOrder: boolean,
        missingItems: string []
    }

    interface secondaryModelMenu {
        passed : boolean,
        items : Array<Element>,
        rawText : string [],
        missingItems: Array<string>
    }

    interface primaryModelMenu {
        passed : boolean,
        rightOrder: boolean,
        items: Array<Element>,
        rawText : string [],
        missingItems: Array<string>
    }

    interface cookie {
        name: string,
        value: string,
        domain: string,
        secure: string,
        httpOnly: string,
        isInBlacklist: boolean
    }
}

export default crawlerTypes