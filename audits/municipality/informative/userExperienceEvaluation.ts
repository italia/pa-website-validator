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
        "C.SI.2.6 - VALUTAZIONE DELL’ESPERIENZA D’USO, CHIAREZZA INFORMATIVA DELLA SCHEDA DI SERVIZIO - Nel caso in cui il servizio non sia erogato in digitale, il sito deve permettere la valutazione dell’utilità della scheda di servizio, come per il criterio C.SI.2.5.",
      failureTitle:
        "C.SI.2.6 - VALUTAZIONE DELL’ESPERIENZA D’USO, CHIAREZZA INFORMATIVA DELLA SCHEDA DI SERVIZIO - Nel caso in cui il servizio non sia erogato in digitale, il sito deve permettere la valutazione dell’utilità della scheda di servizio, come per il criterio C.SI.2.5.",
      scoreDisplayMode: Audit.SCORING_MODES.INFORMATIVE,
      description:
        "RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [eGovernment Benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1).",
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
