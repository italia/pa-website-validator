import {
  commonGatherersFolder,
  commonAuditsFolder,
  municipalityAuditsFolder,
  municipalityInformativeAuditsFolder,
} from "../configFolderingConstants.js";

import {
  groups,
  accessibilityAudits,
  bestPracticeAudits,
  seoAudits,
  pwaAudits,
} from "../commonAuditsParts.js";

const customModelComplianceAudits = [
  {
    id: "municipality-menu-structure-match-model",
    weight: 100,
    group: "user-experience",
  },
  {
    id: "municipality-second-level-pages",
    weight: 100,
    group: "user-experience",
  },
  {
    id: "municipality-ux-ui-consistency-bootstrap-italia-double-check",
    weight: 100,
    group: "user-experience",
  },

  {
    id: "municipality-informative-cloud-infrastructure",
    weight: 100,
    group: "legislation",
  },
  {
    id: "municipality-informative-license-and-attribution",
    weight: 100,
    group: "legislation",
  },
  {
    id: "municipality-informative-reuse",
    weight: 100,
    group: "legislation",
  },
  {
    id: "municipality-informative-user-experience-evaluation",
    weight: 100,
    group: "function",
  },

  {
    id: "municipality-legislation-cookie-domain-check",
    weight: 100,
    group: "legislation",
  },
  {
    id: "municipality-security",
    weight: 100,
    group: "security",
  },
  {
    id: "municipality-legislation-accessibility-declaration-is-present",
    weight: 100,
    group: "legislation",
  },
  {
    id: "municipality-legislation-privacy-is-present",
    weight: 100,
    group: "legislation",
  },
  {
    id: "municipality-faq-is-present",
    weight: 100,
    group: "function",
  },
  {
    id: "municipality-inefficiency-report",
    weight: 100,
    group: "function",
  },
  {
    id: "municipality-ux-ui-consistency-fonts-check",
    weight: 100,
    group: "user-experience",
  },
  {
    id: "municipality-booking-appointment-check",
    weight: 100,
    group: "function",
  },
  {
    id: "municipality-controlled-vocabularies",
    weight: 100,
    group: "function",
  },
];

const customReccomendationsAudits = [
  { id: "common-security-ip-location", weight: 100 },
];

export default {
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
        commonGatherersFolder + "/originGatherer.js",
        commonGatherersFolder + "/hostnameGatherer.js",
        commonGatherersFolder + "/bootstrapItaliaCheckGatherer.js",
        commonGatherersFolder + "/bootstrapItaliaSelectorCheckGatherer.js",
      ],
    },
  ],

  audits: [
    municipalityAuditsFolder + "/menuAudit.js",
    municipalityAuditsFolder + "/secondLevelPagesAudit.js",
    municipalityAuditsFolder + "/bootstrapItaliaDoubleCheckAudit.js",
    municipalityAuditsFolder + "/cookieDomainCheckAudit.js",
    municipalityAuditsFolder + "/securityAudit.js",
    municipalityAuditsFolder + "/accessibilityDeclarationIsPresentAudit.js",
    municipalityAuditsFolder + "/privacyAudit.js",
    municipalityAuditsFolder + "/faqAudit.js",
    municipalityAuditsFolder + "/inefficiencyReportAudit.js",
    municipalityAuditsFolder + "/fontsCheckAudit.js",
    municipalityAuditsFolder + "/bookingAppointmentAudit.js",
    municipalityAuditsFolder + "/controlledVocabulariesAudit.js",

    municipalityInformativeAuditsFolder + "/cloudInfrastructureAudit.js",
    municipalityInformativeAuditsFolder + "/licenseAndAttributionAudit.js",
    municipalityInformativeAuditsFolder + "/reuseAudit.js",
    municipalityInformativeAuditsFolder + "/userExperienceEvaluation.js",

    commonAuditsFolder + "/ipLocationAudit.js",
  ],

  groups: groups,

  categories: {
    modelCompliance: {
      title: "Test di conformità al modello di sito comunale",
      description:
        "Il validatore mostra i risultati degli audit per i singoli parametri di conformità in riferimento all'allegato 2 dell'Avviso 1.4.1.",
      auditRefs: [...customModelComplianceAudits],
    },

    recommendations: {
      title:
        "Raccomandazioni progettuali al modello di sito comunale e altri test",
      description:
        "Il validatore mostra i risultati degli audit per le raccomandazioni in riferimento all'allegato 2 dell'Avviso 1.4.1. A questi sono aggiunti ulteriori test per facilitare le attività di sviluppo e garantire un buon risultato.",
      auditRefs: [...customReccomendationsAudits],
    },

    additionalTests: {
      title: "Test aggiuntivi",
      description:
        "Vengono mostrati i risultati di test aggiuntivi di Lighthouse utili a facilitare le attività di sviluppo e garantire un buon risultato.",
      auditRefs: [
        ...accessibilityAudits,
        ...bestPracticeAudits,
        ...seoAudits,
        ...pwaAudits,
      ],
    },

    performance: {
      title: "Raccomandazione progettuale: Velocità e tempi di risposta",
      description:
        "Nel caso in cui il sito presenti livelli di prestazioni (media pesata di 6 metriche standard) inferiori a 50 secondo quanto calcolato e verificato tramite le librerie Lighthouse, il Comune deve pubblicare sul sito un “Piano di miglioramento del sito” che mostri, per ciascuna delle 6 metriche che impatta negativamente le prestazioni, le azioni future di miglioramento e le relative tempistiche di realizzazione attese. RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/)",
    },
  },
};
