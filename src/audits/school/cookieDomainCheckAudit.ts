"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { auditDictionary } from "../../storage/auditDictionary";
import { run as cookieAudit } from "../../utils/cookieAuditLogic";

const Audit = lighthouse.Audit;

const auditId = "school-legislation-cookie-domain-check";
const auditData = auditDictionary[auditId];

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "school-legislation-cookie-domain-check",
      title:
        "C.SC.2.3 - COOKIE - Il sito della scuola deve presentare cookie tecnici in linea con la normativa vigente.",
      failureTitle:
        "C.SC.2.3 - COOKIE - Il sito della scuola deve presentare cookie tecnici in linea con la normativa vigente.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "CONDIZIONI DI SUCCESSO: il sito presenta solo cookie idonei come definito dalla normativa; MODALITÀ DI VERIFICA: viene verificato che il dominio dei cookie identificati sia corrispondente al dominio del sito web; RIFERIMENTI TECNICI E NORMATIVI: [Linee guida cookie e altri strumenti di tracciamento - 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876)",
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(artifacts: LH.Artifacts & { origin: string }) {
    ///** @type {LH.Audit.Details.TableItem[]} */
    //const results = [];
    //
    //results.push(
    //  {
    //    total_result: "Fino a 2 voci obbligatorie non sono presenti o 1 voce non è nell'ordine corretto.",
    //  },
    //  {
    //    subItems: {
    //      type: "subitems",
    //      items: [
    //        {
    //          single_result: "Corretto",
    //          inspected_page: "https://www.icmarcellinara.edu.it/servizio/registro-elettronico-2/",
    //          missing_mandatory_elements_found: "",
    //          mandatory_elements_not_right_order: ""
    //        },
    //      ],
    //    },
    //  },
    //  {
    //    subItems: {
    //      type: "subitems",
    //      items: [
    //        {
    //          single_result: "Tolleranza",
    //          inspected_page: "https://www.icmarcellinara.edu.it/servizio/registro-elettronico-2/",
    //          missing_mandatory_elements_found: "Cosa serve; Tempi e scadenze",
    //          mandatory_elements_not_right_order: ""
    //        },
    //      ],
    //    },
    //  },
    //  {
    //    subItems: {
    //      type: "subitems",
    //      items: [
    //        {
    //          single_result: "Tolleranza",
    //          inspected_page: "https://www.icmarcellinara.edu.it/servizio/area-riservata-docenti/",
    //          missing_mandatory_elements_found: "",
    //          mandatory_elements_not_right_order: "Ulteriori informazioni; Contatti"
    //        },
    //      ],
    //    },
    //  },
    //);
    //
    ///** @type {LH.Audit.Details.Table['headings']} */
    //const headings = [
    //  /* eslint-disable max-len */
    //  { key: "total_result", itemType: "text", text: "Risultato Totale" },
    //  {
    //    key: "node",
    //    itemType: "node",
    //    subItemsHeading: { key: "single_result", itemType: "text" },
    //    text: "Risultato singolo",
    //  },
    //  {
    //    key: null,
    //    itemType: "text",
    //    subItemsHeading: { key: "inspected_page", itemType: "text" },
    //    text: "Inspected Page",
    //  },
    //  {
    //    key: null,
    //    itemType: "text",
    //    subItemsHeading: { key: "missing_mandatory_elements_found", itemType: "text" },
    //    text: "Missing Mandatory Elements Found",
    //  },
    //  {
    //    key: null,
    //    itemType: "text",
    //    subItemsHeading: { key: "mandatory_elements_not_right_order", itemType: "text" },
    //    text: "Mandatory Elements Not Right Order",
    //  },
    //  /* eslint-enable max-len */
    //];
    //
    //const details = Audit.makeTableDetails(headings, results);
    //
    //return {
    //  score: 0.5,
    //  details,
    //};

    const url = artifacts.origin;

    return await cookieAudit(url, auditData);
  }
}

module.exports = LoadAudit;
