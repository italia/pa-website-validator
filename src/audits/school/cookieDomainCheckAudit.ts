"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  getRandomSchoolFirstLevelPagesUrl,
  getRandomSchoolSecondLevelPagesUrl,
  getRandomSchoolServicesUrl,
  getRandomSchoolLocationsUrl,
} from "../../utils/utils";
import crawlerTypes from "../../types/crawler-types";
import cookie = crawlerTypes.cookie;
import { auditDictionary } from "../../storage/auditDictionary";
import { run as cookieAudit } from "../../utils/cookieAuditLogic";
import { auditScanVariables } from "../../storage/school/auditScanVariables";

const Audit = lighthouse.Audit;

const auditId = "school-legislation-cookie-domain-check";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

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
    const url = artifacts.origin;
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato totale",
        subItemsHeading: { key: "inspected_page", itemType: "text" },
      },
      {
        key: "title_cookie_domain",
        itemType: "text",
        text: "Dominio del Cookie",
        subItemsHeading: { key: "cookie_domain", itemType: "text" },
      },
      {
        key: "title_cookie_name",
        itemType: "text",
        text: "Nome del Cookie",
        subItemsHeading: { key: "cookie_name", itemType: "text" },
      },
      {
        key: "title_cookie_value",
        itemType: "text",
        text: "Valore del Cookie",
        subItemsHeading: { key: "cookie_value", itemType: "text" },
      },
    ];

    const pagesToBeAnalyzed = [
      url,
      ...(await getRandomSchoolFirstLevelPagesUrl(
        url,
        auditVariables.numberOfFirstLevelPageToBeScanned
      )),
      ...(await getRandomSchoolSecondLevelPagesUrl(
        url,
        auditVariables.numberOfSecondLevelPageToBeScanned
      )),
      ...(await getRandomSchoolServicesUrl(
        url,
        auditVariables.numberOfServicesToBeScanned
      )),
      ...(await getRandomSchoolLocationsUrl(
        url,
        auditVariables.numberOfLocationsToBeScanned
      )),
    ];

    let score = 1;
    let items: cookie[] = [];

    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      const pageResult = await cookieAudit(pageToBeAnalyzed);
      if (pageResult.score < score) {
        score = pageResult.score;
      }

      items = [...items, ...pageResult.items];
    }

    const correctItems= [];
    const wrongItems = [];

    for (const item of items){
      if(item.is_correct){
        correctItems.push(item);
      }
      else {
        wrongItems.push(item);
      }
    }

    const results = [];
    switch (score) {
      case 1:
        results.push({
          result: auditData.greenResult,
        });
        break;
      case 0:
        results.push({
          result: auditData.redResult,
        });
        break;
    }

    results.push({});

    if(correctItems.length > 0){
      results.push({
        result: auditData.subItem.greenResult,
        title_cookie_domain: "Cookie domain",
        title_cookie_name: "Cookie name",
        title_cookie_value: "Cookie value"
      });

      for (const item of correctItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    if(wrongItems.length > 0){
      results.push({
        result: auditData.subItem.redResult,
        title_cookie_domain: "Cookie domain",
        title_cookie_name: "Cookie name",
        title_cookie_value: "Cookie value"
      });

      for (const item of wrongItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
    };
  }
}

module.exports = LoadAudit;
