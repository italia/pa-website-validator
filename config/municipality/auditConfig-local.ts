import {
  commonGatherersFolder,
  commonInformativeAuditsFolder,
} from "../configFolderingConstants";

import {
  groups,
  accessibilityAudits,
  bestPracticeAudits,
  seoAudits,
  pwaAudits,
} from "../commonAuditsParts";

const customModelComplianceAudits = [
  {
    id: "common-informative-cookie-domain-check",
    weight: 100,
    group: "legislation",
  },
  {
    id: "common-informative-security",
    weight: 100,
    group: "security",
  },
];
const customReccomendationsAudits = [
  {
    id: "common-informative-ip-location",
    weight: 100,
    group: "security",
  },
];

module.exports = {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: [
      "modelCompliance",
      "recommendations",
      "additionalTests",
      "performance",
    ],
  },

  passes: [
    {
      gatherers: [
        commonGatherersFolder + "/bootstrapItaliaCheckGatherer.js",
        commonGatherersFolder + "/bootstrapItaliaSelectorCheckGatherer.js",
      ],
    },
  ],

  audits: [
    commonInformativeAuditsFolder + "/cookieDomainCheckAudit.js",
    commonInformativeAuditsFolder + "/ipLocationAudit.js",
    commonInformativeAuditsFolder + "/securityAudit.js",
  ],

  groups: groups,

  categories: {
    modelCompliance: {
      title: "Pacchetto Cittadino Informato: criteri di conformità",
      description:
        "Vengono mostrati i risultati degli audit, relativi ad alcuni dei criteri di conformità del Pacchetto Cittadino Informato, in riferimento all'[allegato 2 dell'Avviso 1.4.1](https://areariservata.padigitale2026.gov.it/Pa_digitale2026_dettagli_avviso?id=a017Q00000dk829QAA#allegati).",
      auditRefs: [...customModelComplianceAudits],
    },

    recommendations: {
      title: "Pacchetto Cittadino Attivo: criteri di conformità",
      description:
        "Vengono mostrati i risultati degli audit, relativi ad alcuni dei criteri di conformità del Pacchetto Cittadino Attivo, in riferimento all'[allegato 2 dell'Avviso 1.4.1](https://www.nic.it/sites/default/files/docs/comuni_list.html).",
      auditRefs: [...customReccomendationsAudits],
    },

    additionalTests: {
      title: "Raccomandazioni progettuali e test aggiuntivi",
      description:
        "Vengono mostrati i risultati degli audit, relativi ad alcune delle raccomandazioni progettuali del Pacchetto Cittadino Informato, in riferimento all'[allegato 2 dell'Avviso 1.4.1](https://areariservata.padigitale2026.gov.it/Pa_digitale2026_dettagli_avviso?id=a017Q00000dk829QAA#allegati). A questi sono aggiunti ulteriori test per facilitare le attività di sviluppo e garantire un buon risultato.",
      auditRefs: [
        ...accessibilityAudits,
        ...bestPracticeAudits,
        ...seoAudits,
        ...pwaAudits,
      ],
    },

    performance: {
      title:
        "Pacchetto Cittadino Informato: C.SI.4.1 - Velocità e tempi di risposta",
      description:
        "Nel caso in cui il sito presenti livelli di prestazioni (media pesata di 6 metriche standard) inferiori a 50 secondo quanto calcolato e verificato tramite le librerie Lighthouse, il Comune deve pubblicare sul sito un “Piano di miglioramento del sito” che mostri, per ciascuna delle 6 metriche che impatta negativamente le prestazioni, le azioni future di miglioramento e le relative tempistiche di realizzazione attese. RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/)",
    },
  },
};
