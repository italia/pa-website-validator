"use strict";

import { Page, Protocol } from "puppeteer";
import crawlerTypes from "../../types/crawler-types";
import links = crawlerTypes.links;
import cookie = crawlerTypes.cookie;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import puppeteer from "puppeteer";
import { allowedNames } from "../../storage/common/allowedCookieBtnNames";

const Audit = lighthouse.Audit;

const greenResult = "Cookie idoneo.";
const redResult = "Cookie non idoneo.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "common-legislation-cookie-domain-check",
      title:
        "COOKIE - Il sito deve presentare cookie tecnici in linea con la normativa vigente.",
      failureTitle:
        "COOKIE - Il sito deve presentare cookie tecnici in linea con la normativa vigente.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "CONDIZIONI DI SUCCESSO: il sito presenta solo cookie idonei come definito dalla normativa; MODALITÀ DI VERIFICA: viene verificato che il dominio dei cookie identificati sia corrispondente al dominio del sito web; RIFERIMENTI TECNICI E NORMATIVI: [Linee guida cookie e altri strumenti di tracciamento - 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876)",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

    const headings = [
      { key: "cookie_name", itemType: "text", text: "Nome del Cookie" },
      { key: "cookie_value", itemType: "text", text: "Valore del Cookie" },
      { key: "cookie_domain", itemType: "text", text: "Dominio del cookie" },
      { key: "result", itemType: "text", text: "Risultato" },
    ];

    const items = [];
    let score = 1;

    const browser = await puppeteer.launch();
    const page: Page = await browser.newPage();
    await page.goto(url, {
      waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
    });

    const links = await getLinksFromHTMLPage(page);

    await clickOnAcceptCookiesButtonIfExists(page, links);

    const cookies: Protocol.Network.Cookie[] = await page.cookies();
    await browser.close();

    const resultCookies = await checkCookieDomain(url, cookies);
    for (const resultCookie of resultCookies) {
      if (resultCookie.result === redResult) {
        score = 0;
      }

      items.push(resultCookie);
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;

async function getLinksFromHTMLPage(page: Page): Promise<links[]> {
  return await Promise.all(
    (
      await page.$$("a,button")
    ).map(async (a) => {
      //@ts-ignore
      const className = ((await (await a.getProperty("className")).jsonValue()) as string).replaceAll(" ", ".").trim();
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
): Promise<cookie[]> {
  const returnValue = [];

  for (const cookie of cookies) {
    const cookieValues = {
      cookie_name: cookie.name,
      cookie_value: cookie.value,
      cookie_domain: cookie.domain,
      result: redResult,
    };

    if (url.includes(cookie.domain)) {
      cookieValues.result = greenResult;
    }

    returnValue.push(cookieValues);
  }

  return returnValue;
}
