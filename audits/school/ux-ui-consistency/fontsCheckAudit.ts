"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { allowedFonts } from "../../../storage/school/allowedFonts";
import got from "got";
import {CheerioAPI} from "cheerio";
import * as cheerio from "cheerio";

const Audit = lighthouse.Audit;

const greenResult = "Il sito non utilizza tutte le font del modello."
const redResult = "Il sito utilizza tutte le font del modello."

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-ux-ui-consistency-fonts-check",
      title: "CONSISTENZA DELL'UTILIZZO DELLE FONT (librerie di caratteri) - Il sito scuola deve utilizzare le font indicate dalla documentazione del modello di sito scuola.",
      failureTitle: "CONSISTENZA DELL'UTILIZZO DELLE FONT (librerie di caratteri) - Il sito scuola deve utilizzare le font indicate dalla documentazione del modello di sito scuola.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description: "CONDIZIONI DI SUCCESSO: il sito utilizza almeno le font Titillium Web e Lora; MODALITÀ DI VERIFICA: viene verificata la presenza delle font all'interno della Homepage del sito; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Scuole.](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/v2022.1/index.html)",
      requiredArtifacts: ["fontsCheck"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { fontsCheck: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.fontsCheck;

    let score = 0;
    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      { key: "found_fonts", itemType: "text", text: "Font trovati" },
      { key: "missing_fonts", itemType: "text", text: "Font mancanti" },
    ];

    let item = [{
      result: greenResult,
      found_fonts: "",
      missing_fonts: ""
    }]

    const allServicesUrl = url + "/servizio/"
    try {
      await got(allServicesUrl);
    } catch (e) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
   [ { key: "result_info", itemType: "text", text: "Info" } ],
     [ { result_info: "Non è stato possibile eseguire il test. Pagina tutti i servizi non trovata. Il listato di tutti i servizi deve essere esposto alla pagina: {{base_url}}/servizio" } ]
        ),
      };
    }

    return {
      score: 1,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;
