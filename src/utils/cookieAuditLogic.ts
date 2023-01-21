"use strict";

import { Page, Protocol } from "puppeteer";
import crawlerTypes from "../types/crawler-types";
import links = crawlerTypes.links;
import cookie = crawlerTypes.cookie;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import puppeteer from "puppeteer";
import { allowedNames } from "../storage/common/allowedCookieBtnNames";

const run = async (
  url: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
  const items = [];
  let score = 1;
  let cookies: Protocol.Network.Cookie[] = [];

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
  });
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

  const resultCookies = await checkCookieDomain(url, cookies);

  for (const resultCookie of resultCookies) {
    if (resultCookie.single_result === "Errato") {
      score = 0;
    }

    items.push(resultCookie);
  }

  return {
    score: score,
    items: items,
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
  cookies: Protocol.Network.Cookie[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<cookie[]> {
  const returnValue = [];

  for (const cookie of cookies) {
    const cookieValues = {
      inspected_page: url,
      cookie_name: cookie.name,
      cookie_value: cookie.value,
      cookie_domain: cookie.domain,
      single_result: "Errato",
    };

    if (url.includes(cookie.domain)) {
      cookieValues.single_result = "Corretto";
    }

    returnValue.push(cookieValues);
  }

  return returnValue;
}

export { run };
