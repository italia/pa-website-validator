"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { allowedFonts } from "../../storage/school/allowedFonts";
import got from "got";
import {getAllServicesPagesToBeScanned, getAllServicesUrl, getRandomServicesToBeScanned} from "../../utils/utils";
import puppeteer from "puppeteer"

const Audit = lighthouse.Audit;

const greenResult = "Il sito non utilizza tutte le font del modello."
const yellowResult = "Il sito non utilizza il font Lora."
const redResult = "Il sito utilizza tutte le font del modello."

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-ux-ui-consistency-fonts-check",
      title: "CONSISTENZA DELL'UTILIZZO DELLE FONT (librerie di caratteri) - Il sito scuola deve utilizzare le font indicate dalla documentazione del modello di sito scuola.",
      failureTitle: "CONSISTENZA DELL'UTILIZZO DELLE FONT (librerie di caratteri) - Il sito scuola deve utilizzare le font indicate dalla documentazione del modello di sito scuola.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description: "CONDIZIONI DI SUCCESSO: il sito utilizza almeno le font Titillium Web e Lora; MODALITÀ DI VERIFICA: viene verificata la presenza delle font all'interno della Homepage del sito; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Scuole.](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/v2022.1/index.html)",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;
    let score = 0;

    const testNotFoundHeadings = [ { key: "result", itemType: "text", text: "Risultato" } ]
    const testNotFoundItem = [ { result: "Non è stato possibile condurre il test. Controlla le \"Modalità di verifica\" per scoprire di più." } ]
    const testNotFoundReturnObj = {
      score: score,
      details: Audit.makeTableDetails(testNotFoundHeadings, testNotFoundItem),
    }

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      { key: "found_fonts", itemType: "text", text: "Font trovati" },
      { key: "missing_fonts", itemType: "text", text: "Font mancanti" },
    ];

    let item = [{
      result: redResult,
      found_fonts: "",
      missing_fonts: allowedFonts.join(', ')
    }]

    const allServicesUrl = url + "/servizio/"
    try {
      await got(allServicesUrl);
    } catch (e) {
      return testNotFoundReturnObj
    }

    const pagesToBeScanned = await getAllServicesPagesToBeScanned(
      allServicesUrl
    );
    const servicesUrl = await getAllServicesUrl(
      pagesToBeScanned,
      allServicesUrl
    );

    if (servicesUrl.length <= 0) {
      return testNotFoundReturnObj
    }

    const randomServiceToBeScanned: string = await getRandomServicesToBeScanned(servicesUrl)

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(randomServiceToBeScanned);
    const fonts: string = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily
    });
    await browser.close();

    const splittedFonts: string[] = fonts.replaceAll('"','').split(',')

    if (splittedFonts.length <= 0) {
      item[0].missing_fonts = allowedFonts.join(', ')
      return {
        score: score,
        details: Audit.makeTableDetails(headings, item),
      };
    }

    if (splittedFonts.includes(allowedFonts[0]) && splittedFonts.includes(allowedFonts[1])) {
      score = 1
      item[0].result = greenResult
      item[0].missing_fonts = ""
    } else if (splittedFonts.includes(allowedFonts[0])) {
      score = 0.5
      item[0].result = yellowResult
      item[0].missing_fonts = allowedFonts[1]
    }

    item[0].found_fonts = splittedFonts.join(', ')

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;
