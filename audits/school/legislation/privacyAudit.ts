"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer"
import {CheerioAPI} from "cheerio";

const Audit = lighthouse.Audit;

const greenResult = "Il link è corretto e nella posizione corretta.";
const redResult = "Il link è errato o non è nella posizione corretta.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-legislation-privacy-is-present",
      title:
        "INFORMATIVA PRIVACY - Il sito scuola deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
      failureTitle:
        "INFORMATIVA PRIVACY - Il sito scuola deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta alla privacy policy; MODALITÀ DI VERIFICA: viene verificata la presenza e posizione del link nel footer e che riporti correttamente alla privacy policy; RIFERIMENTI TECNICI E NORMATIVI: GDPR Artt. 13 e 14, Reg. UE n. 679/2016.",
      requiredArtifacts: ["legislationPrivacyIsPresent"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { legislationPrivacyIsPresent: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.legislationPrivacyIsPresent;

    let score = 0;
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
      },
      {
        key: "link_destination",
        itemType: "text",
        text: "Destinazione link",
      },
    ];

    let items = [
      {
        result: redResult,
        link_destination: "",
      },
    ];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://wp-scuole.local/design-scuole-pagine-statiche/build/scuole-home.html');
    const data = await page.content();
    await browser.close();

    const $: CheerioAPI = cheerio.load(data);
    const privacyPolicyElement = $("#privacy-policy")
    const elementObj = $(privacyPolicyElement).attr()

    if (("href" in elementObj) && elementObj.href !== '#' && elementObj.href !== '') {
      items[0].result = greenResult
      items[0].link_destination = elementObj.href
      score = 1
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;