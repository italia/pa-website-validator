"use strict";

import { CheerioAPI } from "cheerio";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import got from "got";
import * as cheerio from "cheerio";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-legislation-accessibility-declaration-is-present",
      title: "Presenza Dichiarazione di Accessibilità",
      failureTitle: "La dichiarazione di accessibilità non è presente",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        "Test per controllare che il dominio presenti la Dichiarazione di Accessibilità",
      requiredArtifacts: ["legislationAccessibilityDeclarationIsPresent"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & {
      legislationAccessibilityDeclarationIsPresent: string;
    }
  ): Promise<{ score: number }> {
    const origin = artifacts.legislationAccessibilityDeclarationIsPresent;

    const request = await got(origin);
    const DOM = request.body;
    let score = 0;

    try {
      const $: CheerioAPI = cheerio.load(DOM);
      const footer = $("footer").prop("outerHTML");

      if (footer !== null) {
        const aTags = $(footer).find("a");

        for (const a of aTags) {
          const href = $(a).attr("href");
          if (
            href &&
            href.includes("form.agid.gov.it") &&
            $(a).text().toLowerCase().includes("accessibilit")
          ) {
            score = 1;
            break;
          }
        }
      }
    } catch (e) {
      score = 0;
    }

    return {
      score: score,
    };
  }
}

module.exports = LoadAudit;
