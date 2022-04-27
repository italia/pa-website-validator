'use strict'

import { Page, Protocol } from "puppeteer"
import { LH } from "lighthouse"
import crawlerTypes from "../../../types/crawler-types"
import links = crawlerTypes.links
import cookie = crawlerTypes.cookie

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
const fs = require('fs')

// @ts-ignore
const storageFolder = __dirname + '/../../../storage/municipality'

// @ts-ignore
const cookieBlackListFile = 'cookieBlackList.json'

// @ts-ignore
const cookieAllowedBtnNamesFile = 'allowedCookieBtnNames.json'

// @ts-ignore
const puppeteer = require('puppeteer')

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'municipality-legislation-cookie-blacklist-check',
            title: 'Cookie blacklist',
            failureTitle: 'Alcuni Cookie sono in una blacklist',
            scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
            description: 'Test per controllare se ci sono Cookie in blacklist',
            requiredArtifacts: ['legislationCookieBlacklist']
        }
    }

    static async  audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const url = artifacts.legislationCookieBlacklist

        const browser = await puppeteer.launch()

        const page : Page = await browser.newPage()
        await page.goto(url, {waitUntil: ['load','domcontentloaded','networkidle0','networkidle2']})

        const links = await getLinksFromHTMLPage(page)

        await clickOnAcceptCookiesButtonIfExists(page, links)

        let cookies : Protocol.Network.Cookie[] = await page.cookies()

        await browser.close()

        const result = await checkIfInBlacklist(cookies)
        const score = result.score

        const headings = [
            { key: 'cookie_name', itemType: 'text', text: "Nome del Cookie" },
            { key: 'cookie_value', itemType: 'text', text: "Valore del Cookie" },
            { key: 'cookie_domain', itemType: 'text', text: "Dominio del cookie" },
            { key: 'cookie_secure', itemType: 'text', text: "Flag secure" },
            { key: 'cookie_http_only', itemType: 'text', text: "Flag http only" },
            { key: 'cookie_blacklist', itemType: 'text', text: "Cookie in blacklist" }
        ]

        let items = []

        for (let cookieObj of result.cookies) {
            items.push({
                cookie_name: cookieObj.name,
                cookie_value: cookieObj.value,
                cookie_domain: cookieObj.domain,
                cookie_secure: cookieObj.secure,
                cookie_http_only: cookieObj.httpOnly,
                cookie_blacklist: cookieObj.isInBlacklist,
            })
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
                await element.click()
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
    const btnWords = (JSON.parse(fs.readFileSync(storageFolder + '/' + cookieAllowedBtnNamesFile))).allowedNames
    const splittedText = text.split(' ')

    for (let word of btnWords) {
        for (let item of splittedText) {
            if (item.toLowerCase().trim() == word) {
                return true
            }
        }
    }

    return false
}

async function checkIfInBlacklist(cookies: Protocol.Network.Cookie[]) : Promise<{ score: number; cookies: cookie[] }> {
    const cookieBlackList = JSON.parse(fs.readFileSync(storageFolder + '/' + cookieBlackListFile))
    let result = {
        score: 1,
        cookies: []
    }

    for (let cookie of cookies) {
        if (cookieBlackList.names.includes(cookie.name) || cookieBlackList.domains.includes(cookie.domain)) {
            result.score = 0
            result.cookies.push({
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
                isInBlacklist: true
            })
        } else {
            result.cookies.push({
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
                isInBlacklist: false
            })
        }
    }

    return result
}

async function sleep (time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
}