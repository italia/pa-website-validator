"use strict";

import { Page, Protocol } from "puppeteer";
import crawlerTypes from "../types/crawler-types";
import cookie = crawlerTypes.cookie;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import puppeteer from "puppeteer";

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
      timeout: 10000,
    });

    cookies = await page.cookies();
    await browser.close();
  } catch (e) {
    await browser.close();
  }

  const resultCookies = await checkCookieDomain(url, cookies);

  for (const resultCookie of resultCookies) {
    if (!resultCookie.is_correct) {
      score = 0;
    }

    items.push(resultCookie);
  }

  return {
    score: score,
    items: items,
  };
};

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
      is_correct: false,
    };

    if (url.includes(cookie.domain)) {
      cookieValues.is_correct = true;
    }

    returnValue.push(cookieValues);
  }

  return returnValue;
}

export { run };
