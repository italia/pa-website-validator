"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import * as dns from "dns";
import * as util from "util";
import geoip from "geoip-lite";
import { allowedCountries } from "../../storage/common/allowedCountries";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

const auditId = "common-security-ip-location";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const redResult = auditData.redResult;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      requiredArtifacts: ["hostname"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { hostname: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const hostname = artifacts.hostname;

    let score = 0;
    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      { key: "ip_city", itemType: "text", text: "Città indirizzo IP" },
      { key: "ip_country", itemType: "text", text: "Paese indirizzo IP" },
    ];
    const items = [{ result: redResult, ip_city: "", ip_country: "" }];

    if (hostname) {
      const lookup = util.promisify(dns.lookup);
      const ip = await lookup(hostname);

      if (Boolean(ip) && Boolean(ip.address)) {
        const ipInformation = geoip.lookup(ip.address);

        if (ipInformation !== null) {
          if (allowedCountries.includes(ipInformation.country)) {
            score = 1;
            items[0].result = greenResult;
          }

          items[0].ip_city = ipInformation.city ?? "";
          items[0].ip_country = ipInformation.country ?? "";
        }
      }
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
