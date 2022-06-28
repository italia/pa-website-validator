"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-informative-user-experience-evaluation",
      title:
        "C.SI.2.6 - VALUTAZIONE DELL’ESPERIENZA D’USO, CHIAREZZA INFORMATIVA DELLA SCHEDA DI SERVIZIO - Nel caso in cui il servizio non sia erogato in digitale, il sito deve permettere la valutazione dell’utilità della scheda di servizio, come per il criterio “valutazione dell’esperienza d’uso, chiarezza delle pagine informative”.",
      failureTitle:
        "C.SI.2.6 - VALUTAZIONE DELL’ESPERIENZA D’USO, CHIAREZZA INFORMATIVA DELLA SCHEDA DI SERVIZIO - Nel caso in cui il servizio non sia erogato in digitale, il sito deve permettere la valutazione dell’utilità della scheda di servizio, come per il criterio “valutazione dell’esperienza d’uso, chiarezza delle pagine informative”.",
      scoreDisplayMode: Audit.SCORING_MODES.INFORMATIVE,
      description:
        "RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni, eGovernment Benchmark method paper 2020-2023](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/v2022.1/index.html).",
      requiredArtifacts: [],
    };
  }

  static async audit(): Promise<{ score: number }> {
    return {
      score: 1,
    };
  }
}

module.exports = LoadAudit;
