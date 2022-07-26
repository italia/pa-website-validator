"use strict";

import { Page, Protocol } from "puppeteer";
import crawlerTypes from "../types/crawler-types";
import links = crawlerTypes.links;
import cookie = crawlerTypes.cookie;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import puppeteer from "puppeteer";
import { allowedNames } from "../storage/common/allowedCookieBtnNames";

const Audit = lighthouse.Audit;


const run = async (
  url: string,
  auditData: any,
): Promise<{ score: number; details: LH.Audit.Details.Table }> => {
  const headings = [
    { key: "cookie_name", itemType: "text", text: "Nome del Cookie" },
    { key: "cookie_value", itemType: "text", text: "Valore del Cookie" },
    { key: "cookie_domain", itemType: "text", text: "Dominio del cookie" },
    { key: "result", itemType: "text", text: "Risultato" },
  ];

  const items = [];
  let score = 1;
  let cookies: Protocol.Network.Cookie[] = []

  const browser = await puppeteer.launch();
  try {
    const page: Page = await browser.newPage();
    await page.goto(url, {
      waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
    });
    const links = await getLinksFromHTMLPage(page);

    await clickOnAcceptCookiesButtonIfExists(page, links);

    cookies = await page.cookies();
    await browser.close();
  } catch (e) {
    await browser.close();
  }

  const resultCookies = await checkCookieDomain(url, cookies, auditData);
  for (const resultCookie of resultCookies) {
    if (resultCookie.result === auditData.redResult) {
      score = 0;
    }

    items.push(resultCookie);
  }

  return {
    score: score,
    details: Audit.makeTableDetails(headings, items),
  };
};

async function getLinksFromHTMLPage(page: Page): Promise<links[]> {
  return await Promise.all(
    (
      await page.$$("a,button")
    ).map(async (a) => {
      const className = (
        (await (await a.getProperty("className")).jsonValue()) as string
      )
        .toString()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
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
      link.className === ".ginger_btn.ginger-accept.ginger_btn_accept_all"
    ) {
      try {
        const element = await page.$(link.className);
        if (!element) {
          throw new Error("null element");
        }
        await element.click();
        await sleep(750);
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        break;
      } catch (e) {
        continue;
      }
    }
  }
}

function containsCookieWord(text: string): boolean {
  const splittedText = text.split(" ");

  for (const word of allowedNames) {
    for (const item of splittedText) {
      if (item.toLowerCase().trim() == word) {
        return true;
      }
    }
  }

  return false;
}

async function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function checkCookieDomain(
  url: string,
  cookies: Protocol.Network.Cookie[],
  auditData: any
): Promise<cookie[]> {
  const returnValue = [];

  for (const cookie of cookies) {
    const cookieValues = {
      cookie_name: cookie.name,
      cookie_value: cookie.value,
      cookie_domain: cookie.domain,
      result: auditData.redResult,
    };

    if (url.includes(cookie.domain)) {
      cookieValues.result = auditData.greenResult;
    }

    returnValue.push(cookieValues);
  }

  return returnValue;
}

export { run };
