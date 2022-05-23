'use strict'

import { Page, Protocol } from "puppeteer"
import crawlerTypes from "../../../types/crawler-types"
import links = crawlerTypes.links
import cookie = crawlerTypes.cookie
// @ts-ignore
import lighthouse from "lighthouse"
import puppeteer from "puppeteer"

const Audit = lighthouse.Audit

const storageFolder = __dirname + '/../../../storage/common'

const cookieAllowedBtnNamesFile = 'allowedCookieBtnNames.json'

const btnWords = require(storageFolder + '/' + cookieAllowedBtnNamesFile)

class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'common-legislation-cookie-domain-check',
            title: 'Domini dei cookie',
            failureTitle: 'Alcuni Cookie hanno un dominio diverso da quello del sito',
            scoreDisplayMode: Audit.SCORING_MODES.BINARY,
            description: 'Test per controllare se ci sono Cookie con domini non consentiti',
            requiredArtifacts: ['legislationCookieDomain']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const url = artifacts.legislationCookieDomain

        const headings = [
            { key: 'cookie_name', itemType: 'text', text: "Nome del Cookie" },
            { key: 'cookie_value', itemType: 'text', text: "Valore del Cookie" },
            { key: 'cookie_domain', itemType: 'text', text: "Dominio del cookie" },
            { key: 'allowed_cookie', itemType: 'text', text: "Cookie consentito" }
        ]

        let items = []
        let score = 1

        const browser = await puppeteer.launch()
        const page : Page = await browser.newPage()
        await page.goto(url, {waitUntil: ['load','domcontentloaded','networkidle0','networkidle2']})

        const links = await getLinksFromHTMLPage(page)

        await clickOnAcceptCookiesButtonIfExists(page, links)

        let cookies : Protocol.Network.Cookie[] = await page.cookies()
        await browser.close()

        const resultCookies = await checkCookieDomain(url, cookies)
        for (let resultCookie of resultCookies) {
            if (resultCookie.allowed_cookie === 'No') {
                score = 0
            }

            items.push(resultCookie)
        }

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit

async function getLinksFromHTMLPage(page: Page) : Promise<links[]> {
    return await Promise.all(
        (await page.$$('a,button')).map(async a => {
            // @ts-ignore
            let className : string = (await (await a.getProperty('className')).jsonValue()).replaceAll(' ', '.').trim()
            let text : string = await (await a.getProperty('innerText')).jsonValue()
            return {
                "text" :  text,
                "className" : '.' + className
             }
        })
    )
}

async function clickOnAcceptCookiesButtonIfExists(page: Page, links: links[]) {
    for (let link of links) {
        if (containsCookieWord(link.text) || link.className === '.ginger_btn.ginger-accept.ginger_btn_accept_all') {
            try {
                let element = await page.$(link.className)
                await element!.click()
                await sleep(750)
                await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
                break
            } catch (e){
                continue
            }
        }
    }
}

function containsCookieWord(text: string) : boolean {
    const splittedText = text.split(' ')

    for (let word of btnWords.allowedNames) {
        for (let item of splittedText) {
            if (item.toLowerCase().trim() == word) {
                return true
            }
        }
    }

    return false
}

async function sleep (time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
}

async function checkCookieDomain (url : string, cookies: Protocol.Network.Cookie[]) : Promise<cookie[]> {
    let returnValue = []

    for (let cookie of cookies) {
        let cookieValues = {
            cookie_name: cookie.name,
            cookie_value: cookie.value,
            cookie_domain: cookie.domain,
            allowed_cookie: 'No'
        }

        if (url.includes(cookie.domain)) {
            cookieValues.allowed_cookie = 'Sì'
        }

        returnValue.push(cookieValues)
    }

    return returnValue
}