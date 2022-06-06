"use strict";
import * as dns from "dns";
import * as util from "util";
import geoip from "geoip-lite";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { allowedCountries } from "../../../storage/common/allowedCountries";

const Audit = lighthouse.Audit;

const greenResult = "L'hosting è su territorio europeo."
const redResult = "L'hosting non è su territorio europeo."

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "common-security-ip-location",
      title: "LOCALIZZAZIONE IP - Il sito deve essere hostato su datacenter localizzati su territorio europeo.",
      failureTitle: "LOCALIZZAZIONE IP - Il sito deve essere hostato su datacenter localizzati su territorio europeo.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "CONDIZIONI DI SUCCESSO: l'indirizzo IP fa riferimento a un datacenter localizzato su territorio europeo; MODALITÀ DI VERIFICA: verifica che la localizzazione dell'IP rientri all'interno di uno dei confini degli stati membri dell'UE; RIFERIMENTI TECNICI E NORMATIVI: GDPR",
      requiredArtifacts: ["securityIpLocation"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { securityIpLocation: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const hostname = artifacts.securityIpLocation;

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
          }

          items[0].result = greenResult
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
