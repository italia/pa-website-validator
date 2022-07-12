"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  getRandomMunicipalityServiceUrl,
  loadPageData,
} from "../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult = "Il componente è presente.";
const redResult = "Il componente è assente.";
const notExecuted =
  "Non è stato possibile trovare una scheda servizio su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-booking-appointment-check",
      title:
        "C.SI.2.1 - PRENOTAZIONE APPUNTAMENTI - Il sito comunale deve consentire, per tutti i servizi che prevedono una erogazione a sportello, di prenotare un appuntamento presso lo sportello di competenza.",
      failureTitle:
        "C.SI.2.1 - PRENOTAZIONE APPUNTAMENTI - Il sito comunale deve consentire, per tutti i servizi che prevedono una erogazione a sportello, di prenotare un appuntamento presso lo sportello di competenza.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "CONDIZIONI DI SUCCESSO: la funzionalità di prenotazione appuntamenti è presente in tutte le schede servizio; MODALITÀ DI VERIFICA: viene verificata la presenza del componente, tramite il suo ID, su una pagina di scheda servizio selezionata casualmente; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/v2022.1/index.html).",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;
    let score = 0;

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      { key: "inspected_page", itemType: "text", text: "Pagina ispezionata" },
    ];

    const item = [
      {
        result: redResult,
        inspected_page: "",
      },
    ];

    const randomServiceToBeScanned: string =
      await getRandomMunicipalityServiceUrl(url);

    if (!randomServiceToBeScanned) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: notExecuted + " Pagina servizio non trovata.",
            },
          ]
        ),
      };
    }

    item[0].inspected_page = randomServiceToBeScanned;

    const $ = await loadPageData(randomServiceToBeScanned);
    const bookingAppointmentElement = $('[data-element="appointment-booking"]');
    const elementObj = $(bookingAppointmentElement).attr();
    const elementName = bookingAppointmentElement.text().trim().trim() ?? "";

    if (
      elementObj &&
      "href" in elementObj &&
      elementObj.href !== "#" &&
      elementObj.href !== "" &&
      elementName
    ) {
      score = 1;
      item[0].result = greenResult;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;
