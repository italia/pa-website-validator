"use strict";

import { Page, Protocol } from "puppeteer";
import crawlerTypes from "../../../types/crawler-types";
import links = crawlerTypes.links;
// @ts-ignore
import lighthouse from "lighthouse";
import puppeteer from "puppeteer";
import { allowedNames } from "../../../storage/common/allowedCookieBtnNames";

const Audit = lighthouse.Audit;

const COOKIES_MIN_AMOUNT = 1;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "common-legislation-cookie-amount-check",
      title: "Quantità di Cookie",
      failureTitle: "La quantità di Cookie non è appropriata",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description: "Test per controllare la quantità di Cookie",
      requiredArtifacts: ["legislationCookieAmount"],
    };
  }

  static async audit(
    artifacts: any
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.legislationCookieAmount;

    const browser = await puppeteer.launch();

    const page: Page = await browser.newPage();
    await page.goto(url, {
      waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
    });

    const links = await getLinksFromHTMLPage(page);

    await clickOnAcceptCookiesButtonIfExists(page, links);

    const cookies: Protocol.Network.Cookie[] = await page.cookies();

    await browser.close();

    let score = 0;
    if (cookies) {
      if (cookies.length >= COOKIES_MIN_AMOUNT) {
        score = 1;
      }
    }

    const headings = [
      {
        key: "cookie_amount",
        itemType: "text",
        text: "Quantità di Cookie corrente",
      },
    ];

    const items = [{ cookie_amount: cookies.length }];

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;

function containsCookieWord(text: string): boolean {
  for (const word of allowedNames) {
    if (text.toLowerCase().includes(word)) {
      return true;
    }
  }

  return false;
}

async function getLinksFromHTMLPage(page: Page): Promise<links[]> {
  return await Promise.all(
    (
      await page.$$("a,button")
    ).map(async (a) => {
      // @ts-ignore
      const className: string = (
        await (await a.getProperty("className")).jsonValue()
      )
        .replaceAll(" ", ".")
        .trim();
      const text: string = await (await a.getProperty("innerText")).jsonValue();
      return {
        text: text,
        className: "." + className,
      };
    })
  );
}

async function clickOnAcceptCookiesButtonIfExists(page: Page, links: links[]) {
  for (const link of links) {
    if (
      containsCookieWord(link.text) ||
      link.className == ".ginger_btn.ginger-accept.ginger_btn_accept_all"
    ) {
      try {
        const element = await page.$(link.className);
        await element!.click();
        await sleep(750);
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        break;
      } catch (e) {
        continue;
      }
    }
  }
}

async function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
