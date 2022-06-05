"use strict";
import * as dns from "dns";
import * as util from "util";
import geoip from "geoip-lite";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { allowedCountries } from "../../../storage/common/allowedCountries";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "common-security-ip-location",
      title: "Localizzazione indirizzo IP",
      failureTitle: "L'indirizzo IP non rientra in uno stato membro dell'UE",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "Test per verificare l'area geografica dell'IP della macchina su cui è hostato il sito web",
      requiredArtifacts: ["securityIpLocation"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { securityIpLocation: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const hostname = artifacts.securityIpLocation;

    let score = 0;
    const headings = [
      { key: "ip_city", itemType: "text", text: "Città indirizzo IP" },
      { key: "ip_country", itemType: "text", text: "Paese indirizzo IP" },
    ];
    const items = [{ ip_city: "", ip_country: "" }];

    if (hostname) {
      const lookup = util.promisify(dns.lookup);
      const ip = await lookup(hostname);

      if (Boolean(ip) && Boolean(ip.address)) {
        const ipInformation = geoip.lookup(ip.address);

        if (ipInformation !== null) {
          if (allowedCountries.includes(ipInformation.country)) {
            score = 1;
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
