// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

import { loadPageData } from "../../utils/utils";

const Audit = lighthouse.Audit;

const auditId = "municipality-performance-improvement-plan";

const improvementPlan = /piano di miglioramento del sito/i;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: "Il sito ha un link al piano di miglioramento nel footer",
      failureTitle:
        "Il sito non ha un link al piano di miglioramento nel footer",
      description:
        "Nel caso in cui il sito comunale presenti livelli di performance (media pesata di 6 metriche standard) inferiori a 50, secondo quanto calcolato e verificato tramite le [librerie Lighthouse](https://web.dev/performance-scoring/), il Comune pubblica sul sito comunale un «Piano di miglioramento del sito» che mostri, per ciascuna voce che impatta negativamente la performance, le azioni future di miglioramento della performance stessa e le relative tempistiche di realizzazione attese. RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/versione-corrente/index.html), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/it/versione-attuale/requisiti-e-modalita-verifica-comuni.html#criterio-c-si-4-1-velocita-e-tempi-di-risposta).",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<LH.Audit.ProductBase> {
    const url = artifacts.origin;

    const $ = await loadPageData(url);
    const footer = $("footer").text();

    if (footer.match(improvementPlan)) {
      return { score: 1 };
    } else {
      return { score: 0.5 };
    }
  }
}

module.exports = LoadAudit;
