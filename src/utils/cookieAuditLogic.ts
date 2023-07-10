"use strict";

import { Protocol } from "puppeteer";
import crawlerTypes from "../types/crawler-types";
import cookie = crawlerTypes.cookie;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import puppeteer from "puppeteer";
import { requestTimeout } from "./utils";

const run = async (
  url: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
  const items = [];
  let score = 1;
  let cookies: Protocol.Network.Cookie[] = [];

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-zygote", "--no-sandbox"],
  });
  const browserWSEndpoint = browser.wsEndpoint();
  try {
    const browser2 = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser2.newPage();

    page.on("request", (e) => {
      const res = e.response();
      if (res !== null && !res.ok())
        console.log(`Failed to load ${res.url()}: ${res.status()}`);
    });
    const res = await page.goto(url, {
      waitUntil: ["load", "networkidle0"],
      timeout: requestTimeout,
    });
    console.log(res?.url(), res?.status());

    cookies = await page.cookies();

    await page.goto("about:blank");
    await page.close();
    browser2.disconnect();
  } catch (e) {
    console.error(`ERROR ${url}: ${e}`);
  }

  await browser.close();
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

    const pageUrl = new URL(url).hostname.replaceAll("www.", "");

    if (
      pageUrl === cookie.domain.replaceAll("www.", "") ||
      cookie.domain.endsWith("." + pageUrl)
    ) {
      cookieValues.is_correct = true;
    }

    returnValue.push(cookieValues);
  }

  return returnValue;
}

export { run };
