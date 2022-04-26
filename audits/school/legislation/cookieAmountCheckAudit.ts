'use strict';
import { Page, Protocol } from "puppeteer";

import { LH } from "lighthouse";

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
const fs = require('fs')

// @ts-ignore
const storageFolder = __dirname + '/../../../storage/school'

const puppeteer = require('puppeteer')
const cookieAllowedBtnNamesFile = 'allowedCookieBtnNames.json'
const COOKIES_MIN_AMOUNT = 1

interface linksInterface {
    text: string,
    className: string
}

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'school-legislation-cookie-amount-check',
            title: 'Quantità di Cookie',
            failureTitle: 'La quantità di Cookie non è appropriata',
            scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
            description: 'Test per controllare la quantità di Cookie',
            requiredArtifacts: ['legislationCookieAmount']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const url = artifacts.legislationCookieAmount
        
        const browser = await puppeteer.launch();
        const page : Page = await browser.newPage();
        await page.goto(url, {waitUntil: ['load','domcontentloaded','networkidle0','networkidle2']});

        const links = await getLinksFromHTMLPage(page)

        await clickOnAcceptCookiesButtonIfExists(page, links)

        let cookies : Protocol.Network.Cookie[] = await page.cookies()
        await browser.close()

        let score = 0
        if (Boolean(cookies)) {
            if (cookies.length >= COOKIES_MIN_AMOUNT) {
                score = 1
            }
        }
        
        const headings = [ { key: 'cookie_amount', itemType: 'text', text: "Quantità di Cookie corrente" } ]

        let items = [ { cookie_amount: cookies.length } ]

        return {
            score: score,
            details: Audit.makeTableDetails(headings, items)
        }
    }
}

module.exports = LoadAudit;

function containsCookieWord(text: string) : boolean {
    const btnWords = (JSON.parse(fs.readFileSync(storageFolder + '/' + cookieAllowedBtnNamesFile))).allowedNames;

    for (let word of btnWords) {
        if (text.toLowerCase().includes(word)) {
            return true
        }
    }

    return false
}

async function getLinksFromHTMLPage(page: Page) : Promise<linksInterface[]> {
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

async function clickOnAcceptCookiesButtonIfExists(page: Page, links: linksInterface[]) {
    for (let link of links) {
        if (containsCookieWord(link.text) || link.className == '.ginger_btn.ginger-accept.ginger_btn_accept_all') {
            try {
                let element = await page.$(link.className)
                await element.click()
                await sleep(750)
                await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
                break
            } catch (e){
                continue
            }
        }
    }
}

async function sleep (time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}