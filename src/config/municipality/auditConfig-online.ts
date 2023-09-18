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

const modelComplianceInformationAudits = [
  {
    id: "municipality-ux-ui-consistency-fonts-check",
    weight: 100,
    group: "user-experience",
  },
  {
    id: "municipality-ux-ui-consistency-bootstrap-italia-double-check",
    weight: 99,
    group: "user-experience",
  },
  {
    id: "municipality-servizi-structure-match-model",
    weight: 98,
    group: "user-experience",
  },
  {
    id: "municipality-ux-ui-consistency-theme-version-check",
    weight: 97,
    group: "user-experience",
  },
  {
    id: "municipality-controlled-vocabularies",
    weight: 96,
    group: "user-experience",
  },
  {
    id: "municipality-menu-structure-match-model",
    weight: 95,
    group: "user-experience",
  },
  {
    id: "municipality-second-level-pages",
    weight: 94,
    group: "user-experience",
  },
  {
    id: "municipality-booking-appointment-check",
    weight: 93,
    group: "function",
  },
  {
    id: "municipality-contacts-assistency",
    weight: 92,
    group: "function",
  },
  {
    id: "municipality-faq-is-present",
    weight: 91,
    group: "function",
  },
  {
    id: "municipality-inefficiency-report",
    weight: 90,
    group: "function",
  },
  {
    id: "municipality-feedback-element",
    weight: 89,
    group: "function",
  },
  {
    id: "municipality-user-experience-evaluation",
    weight: 88,
    group: "function",
  },
  {
    id: "municipality-legislation-cookie-domain-check",
    weight: 87,
    group: "legislation",
  },
  {
    id: "municipality-legislation-accessibility-declaration-is-present",
    weight: 86,
    group: "legislation",
  },
  {
    id: "municipality-legislation-privacy-is-present",
    weight: 85,
    group: "legislation",
  },
  {
    id: "municipality-license-and-attribution",
    weight: 84,
    group: "legislation",
  },
  {
    id: "municipality-security",
    weight: 83,
    group: "security",
  },
  {
    id: "municipality-domain",
    weight: 82,
    group: "security",
  },
];

const reccomandationsAndAdditionalTestsAudits = [
  {
    id: "municipality-metatag",
    weight: 79,
    group: "user-experience",
  },
  {
    id: "municipality-informative-cloud-infrastructure",
    weight: 78,
    group: "legislation",
  },
  {
    id: "municipality-informative-reuse",
    weight: 77,
    group: "legislation",
  },
];

const additionalTestsAudit = [
  { id: "common-security-ip-location", weight: 76 },
];

export default {
  extends: "lighthouse:default",
  settings: {
    onlyAudits: ["municipality-menu-structure-match-model"],
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
    municipalityAuditsFolder + "/contactsAssistencyAudit.js",
    municipalityAuditsFolder + "/feedbackElementAudit.js",
    municipalityAuditsFolder + "/domainAudit.js",
    municipalityAuditsFolder + "/serviziAudit.js",
    municipalityAuditsFolder + "/themeVersionCheckAudit.js",
    municipalityAuditsFolder + "/metatagAudit.js",
    municipalityAuditsFolder + "/licenseAndAttributionAudit.js",
    municipalityAuditsFolder + "/userExperienceEvaluation.js",

    municipalityInformativeAuditsFolder + "/cloudInfrastructureAudit.js",
    municipalityInformativeAuditsFolder + "/reuseAudit.js",

    commonAuditsFolder + "/ipLocationAudit.js",
  ],

  groups: groups,

  categories: {
    performance: {
      title:
        'Pacchetto Cittadino Informato: criterio "C.SI.4.1 - Velocità e tempi di risposta"',
      description:
        "CONDIZIONI DI SUCCESSO: il sito presenta livelli di prestazioni (media pesata di 6 metriche standard) pari o superiori a 50. Se il punteggio è inferiore a 50, il Comune deve pubblicare sul sito un “Piano di miglioramento del sito” raggiungibile dal footer che mostri, per ciascuna voce che impatta negativamente le prestazioni, le azioni future di miglioramento e le relative tempistiche di realizzazione attese; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/).",
    },

    modelComplianceInformation: {
      title: "Pacchetto Cittadino Informato: criteri di conformità",
      description:
        "Vengono mostrati i risultati degli audit relativi ai [criteri di conformità del Pacchetto Cittadino Informato](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/versione-corrente/conformita/conformita-modello-sito.html). NB: il superamento degli audit non implica il superamento dei corrispondenti criteri di conformità.",
      auditRefs: [...modelComplianceInformationAudits],
    },

    reccomandationsAndAdditionalTests: {
      title: "Pacchetto Cittadino Informato: raccomandazioni progettuali",
      description:
        "Vengono mostrati i risultati degli audit relativi ad alcune delle [raccomandazioni progettuali del Pacchetto Cittadino Informato](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/versione-corrente/conformita/conformita-modello-sito.html#raccomandazioni).",
      auditRefs: [...reccomandationsAndAdditionalTestsAudits],
    },

    additionalTests: {
      title: "Test aggiuntivi",
      description:
        "Vengono mostrati i risultati di test aggiuntivi utili a facilitare le attività di sviluppo e garantire un buon risultato.",
      auditRefs: [
        ...additionalTestsAudit,
        ...accessibilityAudits,
        ...bestPracticeAudits,
        ...seoAudits,
        ...pwaAudits,
      ],
    },
  },
};
