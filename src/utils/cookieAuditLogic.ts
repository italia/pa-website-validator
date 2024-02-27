"use strict";

import { Protocol } from "puppeteer";
import crawlerTypes from "../types/crawler-types";
import cookie = crawlerTypes.cookie;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import puppeteer from "puppeteer";
import { gotoRetry, requestTimeout } from "./utils";
import { errorHandling } from "../config/commonAuditsParts";

const run = async (
  url: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
  const items = [];
  let score = 1;
  let cookies: Protocol.Network.Cookie[] = [];

  const browser = await puppeteer.launch({
    headless: "new",
    protocolTimeout: requestTimeout,
    args: ["--no-zygote", "--no-sandbox", "--accept-lang=it"],
  });
  const browserWSEndpoint = browser.wsEndpoint();
  try {
    const browser2 = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser2.newPage();

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (
        ["image", "imageset", "media"].indexOf(request.resourceType()) !== -1 ||
        new URL(request.url()).pathname.endsWith(".pdf")
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    const res = await gotoRetry(page, url, errorHandling.gotoRetryTentative);
    console.log(res?.url(), res?.status());

    cookies = await page.cookies();

    await page.goto("about:blank");
    await page.close();
    browser2.disconnect();
  } catch (ex) {
    console.error(`ERROR ${url}: ${ex}`);
    await browser.close();

    throw new Error(
      `Il test è stato interrotto perché nella prima pagina analizzata ${url} si è verificato l'errore "${ex}". Verificarne la causa e rifare il test.`
    );
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
