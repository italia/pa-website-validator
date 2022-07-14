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
const yellowResult = "Il componente è assente.";
const notExecuted =
  "Non è stato possibile identificare l'elemento su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.";

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-booking-appointment-check",
      title:
        "C.SI.2.1 - PRENOTAZIONE APPUNTAMENTI - Il sito comunale deve consentire, per tutti i servizi che prevedono una erogazione a sportello, di prenotare un appuntamento presso lo sportello di competenza.",
      failureTitle:
        "C.SI.2.1 - PRENOTAZIONE APPUNTAMENTI - Il sito comunale deve consentire, per tutti i servizi che prevedono una erogazione a sportello, di prenotare un appuntamento presso lo sportello di competenza.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        'CONDIZIONI DI SUCCESSO: la funzionalità di prenotazione di un appuntamento presso lo sportello è presente in tutte le schede servizio che lo richiedono; MODALITÀ DI VERIFICA: viene verificata la presenza del componente "Prenota appuntamento" all\'interno di una scheda servizio selezionata casualmente, ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica. Questo test non ha una condizione di fallimento in quanto dipende dal servizio specifico analizzato; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;
    let score = 0.5;

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      { key: "inspected_page", itemType: "text", text: "Pagina ispezionata" },
    ];

    const item = [
      {
        result: yellowResult,
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
