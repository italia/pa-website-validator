"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  buildUrl,
  getHREFValuesDataAttribute,
  loadPageData,
} from "../../utils/utils";

const Audit = lighthouse.Audit;

const greenResult = "Il componente è presente in tutte le pagine valutate.";
const redResult =
  "Il componente non è presente in una o più delle pagine valutate.";
const notExecuted =
  "Non è stato possibile identificare l'elemento su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.";

class LoadAudit extends lighthouse.Audit {
  static get meta() {
    return {
      id: "municipality-feedback-element",
      title:
        "C.SI.2.5 - VALUTAZIONE DELL'ESPERIENZA D'USO, CHIAREZZA DELLE PAGINE INFORMATIVE - Il sito comunale deve consentire al cittadino di fornire una valutazione della chiarezza di ogni pagina di primo e secondo livello.",
      failureTitle:
        "C.SI.2.5 - VALUTAZIONE DELL'ESPERIENZA D'USO, CHIAREZZA DELLE PAGINE INFORMATIVE - Il sito comunale deve consentire al cittadino di fornire una valutazione della chiarezza di ogni pagina di primo e secondo livello.",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description:
        'CONDIZIONI DI SUCCESSO: la funzionalità per valutare la chiarezza informativa è presente su tutte le pagine di primo e secondo livello del sito; MODALITÀ DI VERIFICA: viene verificata la presenza del componente su una pagina di primo livello selezionata casualmente e su una pagina di secondo livello selezionata casualmente a partire dalla pagina "Servizi", ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [eGovernment benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;

    let score = 0;
    let pagesWithComponent = ""
    let pagesWithoutComponent = ""

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      {
        key: "page_with_component",
        itemType: "text",
        text: "Pagine dove è stato rilevato il componente",
      },
      {
        key: "page_without_component",
        itemType: "text",
        text: "Pagine dove non è stato rilevato il componente",
      }
    ];

    const items = [
      {
        result: redResult,
        page_with_component: pagesWithComponent,
        page_without_component: pagesWithoutComponent
      },
    ];

    let $ = await loadPageData(url);

    const administrationPage = await getHREFValuesDataAttribute(
      $,
      '[data-element="management"]'
    );
    const servicesPage = await getHREFValuesDataAttribute(
      $,
      '[data-element="all-services"]'
    );
    const newsPage = await getHREFValuesDataAttribute(
      $,
      '[data-element="news"]'
    );
    const lifePage = await getHREFValuesDataAttribute(
      $,
      '[data-element="live"]'
    );

    const firstLevelPages = [
      ...administrationPage,
      ...servicesPage,
      ...lifePage,
      ...newsPage,
    ];

    if (firstLevelPages.length <= 0) {
      items[0].result = notExecuted;
      return {
        score: 0,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    let randomFirstLevelPage =
      firstLevelPages[Math.floor(Math.random() * firstLevelPages.length)];
    if (!randomFirstLevelPage.includes(url)) {
      randomFirstLevelPage = await buildUrl(url, randomFirstLevelPage);
    }

    $ = await loadPageData(randomFirstLevelPage);
    let feedbackElement = $('[data-element="feedback"]');
    let firstLevelFeedbackElement = true;
    if (
      !feedbackElement ||
      feedbackElement.length === 0 ||
      feedbackElement.text().trim() === ""
    ) {
      firstLevelFeedbackElement = false;
    }

    if (servicesPage.length <= 0) {
      items[0].result = notExecuted;
      return {
        score: 0,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    let secondLevelPageUrl = servicesPage[0];
    if (!secondLevelPageUrl.includes(url)) {
      secondLevelPageUrl = await buildUrl(url, servicesPage[0]);
    }

    $ = await loadPageData(secondLevelPageUrl);
    const servicesSecondLevelPages = await getHREFValuesDataAttribute(
      $,
      '[data-element="service-category-link"]'
    );

    if (servicesSecondLevelPages.length <= 0) {
      items[0].result = notExecuted;
      return {
        score: 0,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    let randomSecondLevelServicePage =
      servicesSecondLevelPages[
        Math.floor(Math.random() * servicesSecondLevelPages.length)
      ];
    if (!randomSecondLevelServicePage.includes(url)) {
      randomSecondLevelServicePage = await buildUrl(
        url,
        randomSecondLevelServicePage
      );
    }

    $ = await loadPageData(randomSecondLevelServicePage);
    feedbackElement = $('[data-element="feedback"]');
    let secondLevelFeedbackElement = true;
    if (
      !feedbackElement ||
      feedbackElement.length === 0 ||
      feedbackElement.text().trim() === ""
    ) {
      secondLevelFeedbackElement = false;
    }

    if (firstLevelFeedbackElement && secondLevelFeedbackElement) {
      pagesWithComponent = randomFirstLevelPage + " " + randomSecondLevelServicePage
      items[0].result = greenResult;
      score = 1;
    } else if (firstLevelFeedbackElement && !randomSecondLevelServicePage) {
      pagesWithComponent = randomFirstLevelPage
      pagesWithoutComponent = randomSecondLevelServicePage
    } else if (!firstLevelFeedbackElement && randomSecondLevelServicePage) {
      pagesWithComponent = randomSecondLevelServicePage
      pagesWithoutComponent = randomFirstLevelPage
    } else {
      pagesWithoutComponent = randomFirstLevelPage + " " + randomSecondLevelServicePage
    }

    items[0].page_with_component = pagesWithComponent
    items[0].page_without_component = pagesWithoutComponent

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
