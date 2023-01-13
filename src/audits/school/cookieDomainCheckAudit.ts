"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { auditDictionary } from "../../storage/auditDictionary";
import { run as cookieAudit } from "../../utils/cookieAuditLogic";
import {
  getRandomSchoolFirstLevelPagesUrl,
  getRandomSchoolLocationsUrl,
  getRandomSchoolSecondLevelPagesUrl,
  getRandomSchoolServicesUrl
} from "../../utils/utils";
import {auditScanVariables} from "../../storage/school/auditScanVariables";

const Audit = lighthouse.Audit;

const auditId = "school-legislation-cookie-domain-check";
const auditData = auditDictionary[auditId];

const accuracy = process.env['accuracy'] ?? 'suggested';
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

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

    const pageUrlToBeScanned = [
      ...await getRandomSchoolFirstLevelPagesUrl(url, auditVariables.numberOfFirstLevelPageToBeScanned),
      ...await getRandomSchoolSecondLevelPagesUrl(url, auditVariables.numberOfSecondLevelPageToBeScanned),
      ...await getRandomSchoolServicesUrl(url, auditVariables.numberOfServicesToBeScanned),
      ...await getRandomSchoolLocationsUrl(url, auditVariables.numberOfLocationsToBeScanned)
    ];

    return await cookieAudit(url, auditData);
  }
}

module.exports = LoadAudit;
