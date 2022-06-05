"use strict";

import crawlerTypes from "../../../types/crawler-types";
import cipherInfo = crawlerTypes.cipherInfo;
import https from "https";
import { TLSSocket } from "tls";
// @ts-ignore
import lighthouse from "lighthouse";
import { allowedCiphers } from "../../../storage/common/allowedCiphers";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "common-security-cipher-check",
      title: "Versione della suite di cifratura",
      failureTitle: "La versione della suite di cifratura non è valida",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "Test per controllare se la versione della suite di cifratura",
      requiredArtifacts: ["securityCipherCheck"],
    };
  }

  static async audit(
    artifacts: any
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const hostname = artifacts.securityCipherCheck;

    let score = 0;
    const headings = [
      {
        key: "tls_version",
        itemType: "text",
        text: "Versione del certificato corrente",
      },
      {
        key: "cipher_version",
        itemType: "text",
        text: "Versione della suite di cifratura corrente",
      },
      {
        key: "allowed_tls12_versions",
        itemType: "text",
        text: "Versione suite accettate per TLSv1.2",
      },
      {
        key: "allowed_tls13_versions",
        itemType: "text",
        text: "Versione suite accettate per TLSv1.3",
      },
    ];

    const items = [
      {
        tls_version: "",
        cipher_version: "",
        allowed_tls12_versions: allowedCiphers.tls12.join(" | "),
        allowed_tls13_versions: allowedCiphers.tls13.join(" | "),
      },
    ];

    const cipherInfo: cipherInfo = {
      version: await getCipherVersion(hostname),
      standardName: await getCipherStandardName(hostname),
    };

    if (Boolean(cipherInfo) && Boolean(cipherInfo.version)) {
      switch (cipherInfo.version) {
        case "TLSv1.2":
          if (allowedCiphers.tls12.includes(cipherInfo.standardName)) {
            score = 1;
          }
          break;
        case "TLSv1.3":
          if (allowedCiphers.tls13.includes(cipherInfo.standardName)) {
            score = 1;
          }
          break;
        default:
          score = 0;
      }

      items[0].tls_version = cipherInfo.version ?? "";
      items[0].cipher_version = cipherInfo.standardName ?? "";
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;

async function getCipherVersion(hostname: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    https
      .request(hostname, function (res) {
        resolve((res.socket as TLSSocket).getCipher().version);
      })
      .end();
  });
}

async function getCipherStandardName(hostname: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    https
      .request(hostname, function (res) {
        resolve((res.socket as TLSSocket).getCipher().standardName);
      })
      .end();
  });
}
