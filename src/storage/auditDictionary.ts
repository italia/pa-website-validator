export const auditDictionary = {
  "common-security-ip-location": {
    greenResult: "L'hosting è su territorio europeo.",
    yellowResult: "",
    redResult: "L'hosting non è su territorio europeo.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "LOCALIZZAZIONE IP - Il sito deve essere ospitato su datacenter localizzati su territorio europeo.",
    failureTitle:
      "LOCALIZZAZIONE IP - Il sito deve essere ospitato su datacenter localizzati su territorio europeo.",
    description:
      "CONDIZIONI DI SUCCESSO: l'indirizzo IP fa riferimento a un datacenter localizzato su territorio europeo; MODALITÀ DI VERIFICA: verifica che la localizzazione dell'IP rientri all'interno di uno dei confini degli stati membri dell'UE; RIFERIMENTI TECNICI E NORMATIVI: GDPR",
  },
  "common-informative-ip-location": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "LOCALIZZAZIONE IP - Il sito deve essere ospitato su datacenter localizzati su territorio europeo.",
    failureTitle:
      "LOCALIZZAZIONE IP - Il sito deve essere ospitato su datacenter localizzati su territorio europeo.",
    description:
      "CONDIZIONI DI SUCCESSO: l'indirizzo IP fa riferimento a un datacenter localizzato su territorio europeo; MODALITÀ DI VERIFICA: verifica che la localizzazione dell'IP rientri all'interno di uno dei confini degli stati membri dell'UE; RIFERIMENTI TECNICI E NORMATIVI: GDPR",
  },
  "municipality-legislation-accessibility-declaration-is-present": {
    greenResult:
      "Il link è nel footer, invia alla pagina corretta e contiene l'URL corretto.",
    yellowResult: "",
    redResult:
      "Il link non è nel footer o non invia alla pagina corretta o la pagina non esiste.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.3.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito comunale deve esporre la dichiarazione di accessibilità in conformità al modello e alle linee guida rese disponibili da AgID in ottemperanza alla normativa vigente in materia di accessibilità e con livelli di accessibilità contemplati nelle specifiche tecniche WCAG 2.1.",
    failureTitle:
      "C.SI.3.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito comunale deve esporre la dichiarazione di accessibilità in conformità al modello e alle linee guida rese disponibili da AgID in ottemperanza alla normativa vigente in materia di accessibilità e con livelli di accessibilità contemplati nelle specifiche tecniche WCAG 2.1.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta a una dichiarazione di accessibilità AgID valida per il sito; MODALITÀ DI VERIFICA: ricercando uno specifico attributo "data-element" come spiegato nella Documentazione delle App di valutazione, viene verificata la presenza del link nel footer, che riporti a una pagina esistente, che l\'url della pagina di destinazione inizi con "https://form.agid.gov.it/view/" e che la pagina contenga l\'url del sito del Comune; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [AgID Linee guida sull’accessibilità degli strumenti informatici](https://docs.italia.it/AgID/documenti-in-consultazione/lg-accessibilita-docs/it/), [Direttiva UE n. 2102/2016](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX%3A32016L2102), [Legge 9 gennaio 2004 n. 4](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.dataPubblicazioneGazzetta=2004-01-17&atto.codiceRedazionale=004G0015&atto.articolo.numero=0&atto.articolo.sottoArticolo=1&atto.articolo.sottoArticolo1=10&qId=cb6b9a05-f5c3-40ac-81b8-f89e73e5b4c7&tabID=0.029511124589268523&title=lbl.dettaglioAtto), [Web Content Accessibility Guidelines WCAG 2.1](https://www.w3.org/Translations/WCAG21-it/#background-on-wcag-2), [AgID dichiarazione di accessibilità](https://www.agid.gov.it/it/design-servizi/accessibilita/dichiarazione-accessibilita), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-booking-appointment-check": {
    greenResult: "Il componente è presente in tutte le pagine analizzate.",
    yellowResult: "",
    redResult: "Il componente non è presente in tutte le pagine analizzate.",
    subItem: {
      greenResult: "Pagine nelle quali è presente il componente:",
      yellowResult: "",
      redResult: "Pagine nelle quali non è presente il componente:",
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.2.1 - PRENOTAZIONE APPUNTAMENTI - Il sito comunale deve consentire di prenotare un appuntamento presso lo sportello di competenza.",
    failureTitle:
      "C.SI.2.1 - PRENOTAZIONE APPUNTAMENTI - Il sito comunale deve consentire di prenotare un appuntamento presso lo sportello di competenza.",
    description:
      'CONDIZIONI DI SUCCESSO: la funzionalità di prenotazione di un appuntamento è accessibile dalla sezione di funzionalità trasversali delle schede servizio e della pagina di primo livello "Servizi"; MODALITÀ DI VERIFICA: ricercando specifici attributi "data-element" come spiegato nella Documentazione delle App di valutazione, viene verificata la presenza del componente "Prenota appuntamento" all\'interno della sezione di funzionalità trasversali delle schede servizio analizzate e della pagina di primo livello "Servizi". Viene inoltre indicato se è stato rilevato il pulsante di accesso alla funzionalità di prenotazione appuntamento all\'interno della sezione "Accedi al servizio" delle schede servizio; RIFERIMENTI TECNICI E NORMATIVI:  [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/versione-corrente/index.html), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/it/versione-attuale/index.html).',
  },
  "municipality-ux-ui-consistency-bootstrap-italia-double-check": {
    greenResult:
      "In tutte le pagine analizzate la libreria Bootstrap Italia è presente in una versione idonea ed è in uso come richiesto.",
    yellowResult: "",
    redResult:
      "In almeno una delle pagine analizzate la libreria Bootstrap Italia non è presente, o non è in uso come richiesto o ne viene utilizzata una versione datata.",
    subItem: {
      greenResult:
        "Pagine che utilizzano la libreria in una versione idonea e nelle quali almeno il 30% delle classi CSS uniche appartiene a Bootstrap Italia:",
      yellowResult: "",
      redResult:
        "Pagine che non utilizzano la libreria in una versione idonea o nelle quali meno del 30% delle classi CSS uniche appartiene a Bootstrap Italia:",
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.1.2 - LIBRERIA DI ELEMENTI DI INTERFACCIA - Il sito comunale deve utilizzare la libreria Bootstrap Italia.",
    failureTitle:
      "C.SI.1.2 - LIBRERIA DI ELEMENTI DI INTERFACCIA - Il sito comunale deve utilizzare la libreria Bootstrap Italia.",
    description:
      "CONDIZIONI DI SUCCESSO: in ogni pagina è presente e in uso la libreria Bootstrap Italia in una versione uguale o superiore alla 2.0 e almeno il 30% delle classi CSS usate appartiene alle classi CSS di Bootstrap Italia; MODALITÀ DI VERIFICA: in ogni pagina analizzata viene verificata la presenza della libreria Bootstrap Italia e la versione in uso, individuando la proprietà CSS --bootstrap-italia-version all’interno del selettore :root o la variabile globale window.BOOTSTRAP_ITALIA_VERSION. Inoltre, viene verificato che almeno il 30% delle classi CSS uniche trovate nella pagina appartiene all'elenco delle classi CSS di Bootstrap Italia; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/versione-corrente/index.html), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "municipality-contacts-assistency": {
    greenResult:
      'In tutte le schede servizio analizzate la voce "Contatti" è presente.',
    yellowResult: "",
    redResult:
      'In almeno una delle schede servizio analizzate la voce "Contatti" è assente.',
    subItem: {
      greenResult:
        'Schede servizio analizzate nelle quali la voce "Contatti" è presente:',
      yellowResult: "",
      redResult:
        'Schede servizio analizzate nelle quali la voce "Contatti" è assente:',
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.2.2 - RICHIESTA DI ASSISTENZA / CONTATTI - All'interno del sito comunale, nel contenuto della scheda servizio, devono essere comunicati i contatti dell'ufficio preposto all'erogazione del servizio.",
    failureTitle:
      "C.SI.2.2 - RICHIESTA DI ASSISTENZA / CONTATTI - All'interno del sito comunale, nel contenuto della scheda servizio, devono essere comunicati i contatti dell'ufficio preposto all'erogazione del servizio.",
    description:
      "CONDIZIONI DI SUCCESSO: i contatti dell'ufficio preposto all'erogazione del servizio sono presenti in tutte le schede servizio; MODALITÀ DI VERIFICA: viene verificata la presenza della voce \"Contatti\" all'interno dell'indice e nel corpo della pagina delle schede servizio analizzate, ricercando specifici attributi \"data-element\" come spiegato nella Documentazione delle App di valutazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [eGovernment benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "municipality-controlled-vocabularies": {
    greenResult:
      "Tutti gli argomenti appartengono all’elenco di voci del modello e l'elenco degli argomenti è presente nella pagina indicata.",
    yellowResult:
      "Almeno il 50% degli argomenti appartengono all'elenco di voci del modello o al vocabolario EuroVoc e l'elenco degli argomenti è presente nella pagina indicata.",
    redResult:
      "Meno del 50% degli argomenti appartengono alle voci del modello Comuni o al vocabolario EuroVoc o l'elenco degli argomenti non è presente nella pagina indicata.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.1.5 - VOCABOLARI CONTROLLATI - Il sito comunale deve utilizzare argomenti forniti dal modello di sito comunale ovvero quelli appartenenti al vocabolario controllato europeo EuroVoc.",
    failureTitle:
      "C.SI.1.5 - VOCABOLARI CONTROLLATI - Il sito comunale deve utilizzare argomenti forniti dal modello di sito comunale ovvero quelli appartenenti al vocabolario controllato europeo EuroVoc.",
    description:
      "CONDIZIONI DI SUCCESSO: gli argomenti utilizzati appartengono alla lista indicata all'interno del documento di architettura dell'informazione del modello Comuni alla voce \"Tassonomia argomenti\" o al vocabolario controllato EuroVoc e l’elenco completo degli argomenti utilizzati è presente in una pagina raggiungibile dall'homepage; MODALITÀ DI VERIFICA: gli argomenti identificati all'interno della pagina contenente l'elenco degli argomenti vengono confrontati con l'elenco di voci presente nel documento di architettura dell'informazione e con il vocabolario controllato EuroVoc, ricercandoli usando specifici attributi \"data-element\" come spiegato nella Documentazione delle App di valutazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Elenco degli argomenti del Modello Comuni](https://docs.google.com/spreadsheets/d/1D4KbaA__xO9x_iBm08KvZASjrrFLYLKX/edit#gid=428595160), [Vocabolario EuroVoc](https://eur-lex.europa.eu/browse/eurovoc.html?locale=it), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "municipality-legislation-cookie-domain-check": {
    greenResult:
      "In tutte le pagine analizzate sono stati rilevati solo cookie idonei.",
    yellowResult: "",
    redResult:
      "In almeno una delle pagine analizzate sono stati rilevati cookie non idonei.",
    subItem: {
      greenResult: "Pagine nelle quali sono stati rilevati solo cookie idonei:",
      yellowResult: "",
      redResult: "Pagine nelle quali sono stati rilevati cookie non idonei:",
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.3.1 - COOKIE - Il sito comunale deve presentare cookie tecnici in linea con la normativa vigente.",
    failureTitle:
      "C.SI.3.1 - COOKIE - Il sito comunale deve presentare cookie tecnici in linea con la normativa vigente.",
    description:
      "CONDIZIONI DI SUCCESSO: il dominio di tutti i cookie già presenti nel sito, ovvero senza che sia stata espressa una preferenza da parte dell’utente riguardo il loro uso, è corrispondente al dominio del sito web del Comune; MODALITÀ DI VERIFICA: viene verificato che al caricamento di ogni pagina analizzata il dominio dei cookie identificati sia corrispondente al dominio del sito web; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Linee guida cookie e altri strumenti di tracciamento - 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876)",
  },
  "school-informative-legislation-accessibility-declaration-is-present": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "C.SC.2.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito della scuola deve esporre la dichiarazione di accessibilità.",
    failureTitle:
      "C.SC.2.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito della scuola deve esporre la dichiarazione di accessibilità.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta a una dichiarazione di accessibilità AgID valida per il sito; MODALITÀ DI VERIFICA: ricercando uno specifico attributo "data-element" come spiegato nella Documentazione delle App di valutazione, viene verificata la presenza del link nel footer, che riporti a una pagina esistente, che l\'url della pagina di destinazione inizi con "https://form.agid.gov.it/view/" e che la pagina contenga l\'url del sito della scuola; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [AgID Linee guida sull’accessibilità degli strumenti informatici](https://docs.italia.it/AgID/documenti-in-consultazione/lg-accessibilita-docs/it/), [Direttiva UE n. 2102/2016](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX%3A32016L2102), [Legge 9 gennaio 2004 n. 4](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.dataPubblicazioneGazzetta=2004-01-17&atto.codiceRedazionale=004G0015&atto.articolo.numero=0&atto.articolo.sottoArticolo=1&atto.articolo.sottoArticolo1=10&qId=cb6b9a05-f5c3-40ac-81b8-f89e73e5b4c7&tabID=0.029511124589268523&title=lbl.dettaglioAtto), [Web Content Accessibility Guidelines WCAG 2.1](https://www.w3.org/Translations/WCAG21-it/#background-on-wcag-2), [AgID dichiarazione di accessibilità](https://www.agid.gov.it/it/design-servizi/accessibilita/dichiarazione-accessibilita), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "school-informative-cookie-domain-check": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SC.2.3 - COOKIE - Il sito della scuola deve presentare cookie tecnici in linea con la normativa vigente.",
    failureTitle:
      "C.SC.2.3 - COOKIE - Il sito della scuola deve presentare cookie tecnici in linea con la normativa vigente.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito presenta solo cookie idonei come definito dalla normativa; MODALITÀ DI VERIFICA: viene verificato che il dominio dei cookie identificati sia corrispondente al dominio del sito web. Se nella pagina analizzata non vengono rilevati cookie non verrà generata una tabella di risultati; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Linee guida cookie e altri strumenti di tracciamento - 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876).",
  },
  "municipality-domain": {
    greenResult:
      'Tutte le pagine analizzate sono raggiungibili senza che sia necessario inserire "www." e il dominio utilizzato è corretto.',
    yellowResult: "",
    redResult:
      'Almeno una delle pagine analizzate non è raggiungibile senza inserire "www." o il dominio utilizzato è errato.',
    subItem: {
      greenResult:
        'Pagine raggiungibili senza che sia necessario inserire "www." e nelle quali il dominio utilizzato è corretto:',
      yellowResult: "",
      redResult:
        'Pagine non raggiungibili senza inserire "www." o nelle quali il dominio utilizzato è errato:',
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.5.2 - DOMINIO ISTITUZIONALE - Il sito comunale utilizza un dominio istituzionale secondo le modalità indicate nella documentazione del modello di sito comunale.",
    failureTitle:
      "C.SI.5.2 - DOMINIO ISTITUZIONALE - Il sito comunale utilizza un dominio istituzionale secondo le modalità indicate nella documentazione del modello di sito comunale.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito comunale è raggiungibile senza necessità di inserimento del sottodominio “www.” e le pagine utilizzano il sottodominio "comune." immediatamente seguito da uno dei domini utilizzabili presenti in [questa pagina](https://raw.githubusercontent.com/italia/pa-website-validator/main/src/storage/municipality/allowedDomains.ts) secondo la struttura indicata nel criterio di conformità; MODALITÀ DI VERIFICA: ricercando specifici attributi "data-element" come spiegato nella Documentazione delle App di valutazione, viene verificato che il dominio utilizzato nelle pagine analizzate rispetti la struttura richiesta dal criterio di conformità e che le pagine siano raggiungibili senza necessità di inserimento del sottodominio "www."; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Elenco Nomi a Dominio Riservati Per i Comuni Italiani](https://www.nic.it/sites/default/files/docs/comuni_list.html); [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-faq-is-present": {
    greenResult:
      "Il link è nel footer, la pagina di destinazione esiste e la label è nominata correttamente.",
    yellowResult:
      "Il link è nel footer, la pagina di destinazione esiste ma la label non è nominata correttamente.",
    redResult:
      "Il link non è nel footer o la pagina di destinazione è inesistente.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.2.3 - RICHIESTA DI ASSISTENZA / DOMANDE FREQUENTI - Il sito comunale deve contenere una sezione per le domande più frequenti (FAQ).",
    failureTitle:
      "C.SI.2.3 - RICHIESTA DI ASSISTENZA / DOMANDE FREQUENTI - Il sito comunale deve contenere una sezione per le domande più frequenti (FAQ).",
    description:
      'CONDIZIONI DI SUCCESSO: nel footer del sito è presente un link contenente le espressioni "FAQ" oppure "domande frequenti" che invia a una pagina di domande frequenti ; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, ricercando uno specifico attributo "data-element" come spiegato nella Documentazione delle App di valutazione, che il link invii ad una pagina esistente e che il testo del link contenga almeno una delle espressioni richieste, senza fare distinzione tra caratteri minuscoli o maiuscoli; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [eGovernment benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-feedback-element": {
    greenResult:
      "In tutte le pagine analizzate il componente è presente e rispetta le caratteristiche richieste.",
    yellowResult:
      "In tutte le pagine analizzate il componente è presente ma potrebbe non rispettare tutte le caratteristiche richieste.",
    redResult:
      "In almeno una delle pagine analizzate il componente non è presente o non rispetta le caratteristiche richieste.",
    subItem: {
      greenResult:
        "Pagine nelle quali il componente è presente e rispetta le caratteristiche richieste:",
      yellowResult:
        "Pagine nelle quali il componente è presente ma potrebbe non rispettare tutte le caratteristiche richieste:",
      redResult:
        "Pagine nelle quali il componente non è presente o non rispetta le caratteristiche richieste:",
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.2.5 - VALUTAZIONE DELL'ESPERIENZA D'USO, CHIAREZZA DELLE PAGINE INFORMATIVE - Il sito comunale deve consentire al cittadino di fornire una valutazione della chiarezza di ogni pagina di primo e secondo livello.",
    failureTitle:
      "C.SI.2.5 - VALUTAZIONE DELL'ESPERIENZA D'USO, CHIAREZZA DELLE PAGINE INFORMATIVE - Il sito comunale deve consentire al cittadino di fornire una valutazione della chiarezza di ogni pagina di primo e secondo livello.",
    description:
      'CONDIZIONI DI SUCCESSO: la funzionalità per valutare la chiarezza informativa è presente su tutte le pagine di primo e secondo livello del sito e rispetta tutte le caratteristiche e i passaggi richiesti; MODALITÀ DI VERIFICA: ricercando specifici attributi "data-element" come spiegato nella Documentazione delle App di valutazione, viene verificata la presenza del componente di valutazione nelle pagine di primo e di secondo livello, controllando che la funzionalità abbia le caratteristiche richieste nella documentazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/versione-corrente/index.html), [eGovernment benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/it/versione-attuale/index.html).',
  },
  "municipality-ux-ui-consistency-fonts-check": {
    greenResult:
      "In tutte le pagine analizzate vengono utilizzati i font come richiesto.",
    yellowResult:
      "In almeno una delle pagine analizzate sono presenti <h> o <p> che includono altri font oltre a quelli richiesti.",
    redResult:
      "In almeno una delle pagine analizzate sono presenti <h> o <p> che non utilizzano i font come richiesto.",
    subItem: {
      greenResult:
        "Pagine analizzate nelle quali vengono utilizzati i font come richiesto:",
      yellowResult:
        "Pagine analizzate nelle quali sono presenti <h> o <p> che includono altri font oltre a quelli richiesti:",
      redResult:
        "Pagine analizzate nelle quali sono presenti <h> o <p> che non utilizzano i font come richiesto:",
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.1.1 - COERENZA DELL'UTILIZZO DEI FONT (librerie di caratteri) - Il sito comunale deve utilizzare i font indicati dalla documentazione del modello di sito comunale.",
    failureTitle:
      "C.SI.1.1 - COERENZA DELL'UTILIZZO DEI FONT (librerie di caratteri) - Il sito comunale deve utilizzare i font indicati dalla documentazione del modello di sito comunale.",
    description:
      'CONDIZIONI DI SUCCESSO: tutti i titoli (heading) e tutti i paragrafi delle pagine del sito in lingua italiana utilizzano esclusivamente i font Titillium Web, Lora o Roboto Mono come font di default; MODALITÀ DI VERIFICA: ricercando specifici attributi "data-element" come spiegato nella Documentazione delle App di valutazione, nelle pagine analizzate viene verificato che i font di default siano quelli richiesti all\'interno di tutti gli <h> e <p>; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/versione-corrente/conformita/conformita-modello-sito.html), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-inefficiency-report": {
    greenResult:
      "Il link è nel footer, la pagina di destinazione esiste e la label è nominata correttamente.",
    yellowResult:
      "Il link è nel footer, la pagina di destinazione esiste ma la label non è nominata correttamente.",
    redResult:
      "Il link non è nel footer o la pagina di destinazione è inesistente.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.2.4 - SEGNALAZIONE DISSERVIZIO - Il sito comunale deve fornire al cittadino la possibilità di segnalare un disservizio, tramite email o servizio dedicato.",
    failureTitle:
      "C.SI.2.4 - SEGNALAZIONE DISSERVIZIO - Il sito comunale deve fornire al cittadino la possibilità di segnalare un disservizio, tramite email o servizio dedicato.",
    description:
      'CONDIZIONI DI SUCCESSO: nel footer del sito è presente un link contenente le espressioni "disservizio" oppure "segnala disservizio" oppure "segnalazione disservizio" che invia alla funzionalità di segnalazione di un disservizio. Se viene usata una funzionalità dedicata di segnalazione disservizio, devono essere presenti i campi richiesti nella Documentazione del modello; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, ricercando uno specifico attributo "data-element" come spiegato nella Documentazione delle App di valutazione, che il link invii ad una pagina esistente e che il testo del link contenga le espressioni indicate, senza fare distinzione tra caratteri minuscoli o maiuscoli; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [eGovernment benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-menu-structure-match-model": {
    greenResult:
      "Le voci del menù obbligatorie sono corrette, nell'ordine giusto e inviano a pagine interne al dominio del Comune.",
    yellowResult:
      "Le voci del menù obbligatorie e il loro ordine è corretto ma sono presenti fino a 3 voci aggiuntive. Tutte le voci inviano a pagine interne al dominio del Comune.",
    redResult:
      "Almeno una delle voci obbligatorie è assente o inesatta e/o le voci obbligatorie sono in ordine errato e/o sono presenti 8 o più voci nel menù del sito e/o sono presenti voci che inviano a pagine esterne al dominio del Comune.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.1.6 - VOCI DI MENÙ DI PRIMO LIVELLO - Il sito comunale deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito comunale.",
    failureTitle:
      "C.SI.1.6 - VOCI DI MENÙ DI PRIMO LIVELLO - Il sito comunale deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito comunale.",
    description:
      'CONDIZIONI DI SUCCESSO: le voci del menù di primo livello del sito sono esattamente quelle indicate nel documento di architettura dell’informazione e sono nell’ordine indicato (ovvero «Amministrazione», «Novità», «Servizi», «Vivere il Comune» oppure «Vivere [nome del Comune]») e tutte le pagine raggiungibili dal menu di primo livello portano a pagine interne al dominio del Comune; MODALITÀ DI VERIFICA: ricercando uno specifico attributo "data-element" come spiegato nella Documentazione delle App di valutazione, vengono identificate le voci presenti nel menù del sito e il loro ordine, confrontandole con quanto indicato nel documento di architettura dell\'informazione. Viene inoltre verificato che tutte le pagine raggiungibili dal menu di primo livello portino a pagine interne al dominio del Comune; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-metatag": {
    greenResult:
      "In tutte le schede servizio analizzate tutti i metatag richiesti sono presenti e corretti.",
    yellowResult:
      "In almeno una delle schede servizio analizzate non tutti i metatag richiesti sono presenti e corretti.",
    redResult:
      "In almeno una delle schede servizio analizzate meno del 50% dei metatag richiesti sono presenti e corretti.",
    subItem: {
      greenResult:
        "Pagine nelle quali tutti i metatag richiesti sono presenti e corretti:",
      yellowResult:
        "Pagine nelle quali almeno il 50% dei metatag richiesti sono presenti e corretti:",
      redResult:
        "Pagine nelle quali meno del 50% dei metatag richiesti sono presenti e corretti:",
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "R.SI.1.1 - METATAG - Nel sito comunale, le voci della scheda servizio devono presentare i metatag descritti dal modello, in base agli standard internazionali.",
    failureTitle:
      "R.SI.1.1 - METATAG - Nel sito comunale, le voci della scheda servizio devono presentare i metatag descritti dal modello, in base agli standard internazionali.",
    description:
      'CONDIZIONI DI SUCCESSO: le voci delle schede servizio presentano tutti i metatag richiesti dal modello; MODALITÀ DI VERIFICA: viene verificata la presenza e correttezza dei metatag indicati nella Documentazione delle App di valutazione all\'interno delle schede servizio analizzate, ricercando specifici attributi "data-element" come spiegato nella Documentazione delle App di valutazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/versione-corrente/index.html), [Schema](https://www.schema.org/), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/it/versione-attuale/index.html).',
  },
  "municipality-legislation-privacy-is-present": {
    greenResult:
      "Il link è nel footer e invia a una pagina esistente e sicura.",
    yellowResult: "",
    redResult:
      "Il link non è nel footer o non invia a una pagina esistente o sicura.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.3.3 - INFORMATIVA PRIVACY - Il sito comunale deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
    failureTitle:
      "C.SI.3.3 - INFORMATIVA PRIVACY - Il sito comunale deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta a una pagina sicura riguardante l\'informativa sulla privacy; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, che riporti a una pagina esistente e con certificato HTTPS valido e attivo, ricercando uno specifico attributo "data-element" come spiegato nella Documentazione delle App di valutazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/versione-corrente/index.html), [GDPR Artt. 13 e 14, Reg. UE n. 2016/679](https://www.garanteprivacy.it/regolamentoue), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/it/versione-attuale/index.html).',
  },
  "municipality-second-level-pages": {
    greenResult: "Tutti i titoli usati sono corretti.",
    yellowResult: "Almeno il 50% dei titoli usati è corretto.",
    redResult: "Meno del 50% dei titoli usati è corretto.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.1.7 - TITOLI DELLE PAGINE DI SECONDO LIVELLO - Nel sito comunale, i titoli delle pagine di secondo livello devono rispettare il vocabolario descritto dalla documentazione del modello di sito comunale.",
    failureTitle:
      "C.SI.1.7 - TITOLI DELLE PAGINE DI SECONDO LIVELLO - Nel sito comunale, i titoli delle pagine di secondo livello devono rispettare il vocabolario descritto dalla documentazione del modello di sito comunale.",
    description:
      'CONDIZIONI DI SUCCESSO: i titoli delle pagine di secondo livello corrispondono a quelli indicati nel capitolo "Conformità al modello Comuni" della Documentazione del Modello Comuni; MODALITÀ DI VERIFICA: ricercando specifici attributi "data-element" come spiegato nella Documentazione delle App di valutazione, viene verificato che i titoli delle card usate per rimandare alle pagine di secondo livello siano corretti e presenti sulle rispettive pagine genitore di primo livello. Nel caso della pagina di primo livello "Vivere il Comune", viene verificato che i titoli delle pagine di secondo livello raggiungibili da questa siano corretti. Nel conteggio vengono incluse anche le pagine di secondo livello raggiungibili da pagine di primo livello non indicate nella documentazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-security": {
    greenResult: "Il certificato del sito [url] è attivo e valido.",
    yellowResult: "",
    redResult: "Il certificato del sito [url] non è attivo o valido: ",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.5.1 - CERTIFICATO HTTPS - Il sito comunale deve avere un certificato https valido e attivo.",
    failureTitle:
      "C.SI.5.1 - CERTIFICATO HTTPS - Il sito comunale deve avere un certificato https valido e attivo.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito utilizza un certificato https valido e non obsoleto secondo le raccomandazioni AgID; MODALITÀ DI VERIFICA: viene verificato che il certificato https del sito sia valido e attivo; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Agid Raccomandazioni in merito allo standard Transport Layer Security (TLS)](https://cert-agid.gov.it/wp-content/uploads/2020/11/AgID-RACCSECTLS-01.pdf).",
  },
  "municipality-servizi-structure-match-model": {
    greenResult:
      "Sono presenti almeno 10 schede servizio e in tutte le pagine analizzate tutte le voci obbligatorie e i relativi contenuti sono presenti e, dove richiesto, sono nell'ordine corretto.",
    yellowResult:
      "Sono presenti almeno 10 schede servizio e in almeno una delle pagine analizzate fino a 2 voci obbligatorie o i relativi contenuti non sono presenti o 1 voce non è nell'ordine corretto.",
    redResult:
      "Non sono presenti almeno 10 schede servizio o in almeno una delle pagine analizzate più di 2 voci obbligatorie o i relativi contenuti non sono presenti o più di 1 voce non è nell'ordine corretto.",
    subItem: {
      greenResult:
        "Pagine nelle quali tutte le voci obbligatorie e i relativi contenuti sono presenti e, dove richiesto, sono nell'ordine corretto:",
      yellowResult:
        "Pagine nelle quali fino a 2 voci obbligatorie o i relativi contenuti non sono presenti o 1 voce non è nell'ordine corretto:",
      redResult:
        "Pagine nelle quali più di 2 voci obbligatorie o i relativi contenuti non sono presenti o più di 1 voce non è nell'ordine corretto:",
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.1.3 - SCHEDE INFORMATIVE DI SERVIZIO PER IL CITTADINO - Tutte le schede informative dei servizi per il cittadino devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
    failureTitle:
      "C.SI.1.3 - SCHEDE INFORMATIVE DI SERVIZIO PER IL CITTADINO - Tutte le schede informative dei servizi per il cittadino devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
    description:
      "CONDIZIONI DI SUCCESSO: sono presenti almeno 10 schede informative di servizio e in queste le voci obbligatorie e i relativi contenuti sono presenti e, dove richiesto, sono nell'ordine corretto; MODALITÀ DI VERIFICA: ricercando specifici attributi \"data-element\" come spiegato nella Documentazione delle App di valutazione, la presenza e l'ordine delle voci richieste viene verificato ricercandoli all'interno della pagina e dell'indice. Per essere ritenute valide, le voci devono avere contenuti associati della tipologia indicata all'interno del documento di architettura dell'informazione. Maggiori dettagli sono indicati nella Documentazione delle App di valutazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Content type: scheda servizio](https://docs.google.com/spreadsheets/d/1D4KbaA__xO9x_iBm08KvZASjrrFLYLKX/edit#gid=335720294dngdrFJf_Z2KNvDkMF3tKfc8/edit#gid=0), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "municipality-ux-ui-consistency-theme-version-check": {
    greenResult:
      "Il sito utilizza una versione uguale o superiore alla 1.0 del tema CMS del modello.",
    yellowResult: "Il sito non utilizza il tema CMS del modello.",
    redResult:
      "Il sito non utilizza una versione uguale o superiore alla 1.0 del tema CMS del modello.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.1.4 - UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito comunale, lo utilizza nella versione 1.0 o successive.",
    failureTitle:
      "C.SI.1.4 - UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito comunale, lo utilizza nella versione 1.0 o successive.",
    description:
      "CONDIZIONI DI SUCCESSO: se è in uso il tema CMS del modello per i Comuni, la versione utilizzata è uguale o superiore alla 1.0; MODALITÀ DI VERIFICA: viene verificato l'uso del tema CMS del modello e la versione in uso ricercando uno specifico testo all'interno di tutti i file .CSS presenti in pagina. Lo specifico testo ricercato viene indicato nella Documentazione delle App di valutazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/versione-corrente/index.html), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/it/versione-attuale/index.html).",
  },
  "municipality-informative-cloud-infrastructure": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "R.SI.2.1 - INFRASTRUTTURE CLOUD - Il sito comunale deve essere ospitato su infrastrutture qualificate ai sensi della normativa vigente.",
    failureTitle:
      "R.SI.2.1 - INFRASTRUTTURE CLOUD - Il sito comunale deve essere ospitato su infrastrutture qualificate ai sensi della normativa vigente.",
    description:
      "RIFERIMENTI TECNICI E NORMATIVI: per consentire un'erogazione più sicura, efficiente e scalabile del sito comunale, può essere utile considerare di impostare l'infrastruttura che lo ospita in cloud, secondo quanto descritto nella [Strategia Cloud Italia](https://cloud.italia.it/strategia-cloud-pa/).",
  },
  "municipality-informative-legislation-accessibility-declaration-is-present": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "C.SI.3.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito comunale deve esporre la dichiarazione di accessibilità in conformità al modello e alle linee guida rese disponibili da AgID in ottemperanza alla normativa vigente in materia di accessibilità e con livelli di accessibilità contemplati nelle specifiche tecniche WCAG 2.1.",
    failureTitle:
      "C.SI.3.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito comunale deve esporre la dichiarazione di accessibilità in conformità al modello e alle linee guida rese disponibili da AgID in ottemperanza alla normativa vigente in materia di accessibilità e con livelli di accessibilità contemplati nelle specifiche tecniche WCAG 2.1.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta a una dichiarazione di accessibilità AgID valida per il sito; MODALITÀ DI VERIFICA: ricercando uno specifico attributo "data-element" come spiegato nella Documentazione delle App di valutazione, viene verificata la presenza del link nel footer, che riporti a una pagina esistente, che l\'url della pagina di destinazione inizi con "https://form.agid.gov.it/view/" e che la pagina contenga l\'url del sito del Comune; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [AgID Linee guida sull’accessibilità degli strumenti informatici](https://docs.italia.it/AgID/documenti-in-consultazione/lg-accessibilita-docs/it/), [Direttiva UE n. 2102/2016](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX%3A32016L2102), [Legge 9 gennaio 2004 n. 4](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.dataPubblicazioneGazzetta=2004-01-17&atto.codiceRedazionale=004G0015&atto.articolo.numero=0&atto.articolo.sottoArticolo=1&atto.articolo.sottoArticolo1=10&qId=cb6b9a05-f5c3-40ac-81b8-f89e73e5b4c7&tabID=0.029511124589268523&title=lbl.dettaglioAtto), [Web Content Accessibility Guidelines WCAG 2.1](https://www.w3.org/Translations/WCAG21-it/#background-on-wcag-2), [AgID dichiarazione di accessibilità](https://www.agid.gov.it/it/design-servizi/accessibilita/dichiarazione-accessibilita), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-informative-cookie-domain-check": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.3.1 - COOKIE - Il sito comunale deve presentare cookie tecnici in linea con la normativa vigente.",
    failureTitle:
      "C.SI.3.1 - COOKIE - Il sito comunale deve presentare cookie tecnici in linea con la normativa vigente.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito presenta solo cookie idonei come definito dalla normativa; MODALITÀ DI VERIFICA: viene verificato che il dominio dei cookie identificati sia corrispondente al dominio del sito web. Se nella pagina analizzata non vengono rilevati cookie non verrà generata una tabella di risultati; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Linee guida cookie e altri strumenti di tracciamento - 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876)",
  },
  "municipality-informative-domain": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.5.2 - DOMINIO ISTITUZIONALE - Il sito comunale utilizza un dominio istituzionale secondo le modalità indicate nella documentazione del modello di sito comunale.",
    failureTitle:
      "C.SI.5.2 - DOMINIO ISTITUZIONALE - Il sito comunale utilizza un dominio istituzionale secondo le modalità indicate nella documentazione del modello di sito comunale.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito comunale è raggiungibile senza necessità di inserimento del sottodominio “www.” e le pagine utilizzano il sottodominio “comune.” immediatamente seguito da uno dei domini utilizzabili presenti in [questa pagina](https://raw.githubusercontent.com/italia/pa-website-validator/main/src/storage/municipality/allowedDomains.ts) secondo la struttura indicata nel criterio di conformità; MODALITÀ DI VERIFICA: ricercando specifici attributi “data-element” come spiegato nella Documentazione delle App di valutazione, viene verificato che il dominio utilizzato nelle pagine analizzate rispetti la struttura richiesta dal criterio di conformità e che le pagine siano raggiungibili senza necessità di inserimento del sottodominio “www.”; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Elenco Nomi a Dominio Riservati Per i Comuni Italiani](https://www.nic.it/sites/default/files/docs/comuni_list.html); [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "municipality-license-and-attribution": {
    greenResult:
      "La dicitura sulla licenza dei contenuti è presente nella pagina delle note legali raggiungibile dal footer.",
    yellowResult: "",
    redResult:
      "La dicitura sulla licenza dei contenuti è errata o non presente nella pagina delle note legali o questa non è raggiungibile dal footer.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.3.4 - LICENZA E ATTRIBUZIONE - Il sito comunale deve pubblicare dati, documenti e informazioni con licenza aperta comunicandolo come descritto nella documentazione del modello di sito comunale.",
    failureTitle:
      "C.SI.3.4 - LICENZA E ATTRIBUZIONE - Il sito comunale deve pubblicare dati, documenti e informazioni con licenza aperta comunicandolo come descritto nella documentazione del modello di sito comunale.",
    description:
      'CONDIZIONI DI SUCCESSO: nella pagina delle noti legali viene indicato che i dati, documenti e informazioni riportati sul sito sono rilasciati con licenza CC-BY 4.0; MODALITÀ DI VERIFICA: ricercando uno specifico attributo "data-element" come spiegato nella Documentazione delle App di valutazione, viene verificato che la pagina delle note legali sia raggiungibile dal footer e che questa contenga una sezione "Licenza dei contenuti" riportante la dicitura indicata nella Documentazione del modello; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [CAD Art. 52 d.lgs. 82/2005](https://docs.italia.it/italia/piano-triennale-ict/codice-amministrazione-digitale-docs/it/stabile/_rst/capo_V-sezione_I-articolo_52.html), [art. 7, comma 1, D.Lgs. n. 33/2013](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2013-03-14;33), [d.lgs. n. 36/2006](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2006-01-24;36!vig=), [AgID Linee guida su acquisizione e riuso di software per le pubbliche amministrazioni](https://www.agid.gov.it/it/design-servizi/riuso-open-source/linee-guida-acquisizione-riuso-software-pa), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-informative-reuse": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "R.SI.2.2 - RIUSO - Il Comune deve mettere a riuso sotto licenza aperta il software secondo le Linee Guida “acquisizione e riuso di software e riuso di software per le pubbliche amministrazioni.",
    failureTitle:
      "R.SI.2.2 - RIUSO - Il Comune deve mettere a riuso sotto licenza aperta il software secondo le Linee Guida “acquisizione e riuso di software e riuso di software per le pubbliche amministrazioni.",
    description:
      "RIFERIMENTI TECNICI E NORMATIVI: [CAD: Art. 69. (Riuso delle soluzioni e standard aperti)](https://docs.italia.it/italia/piano-triennale-ict/codice-amministrazione-digitale-docs/it/stabile/_rst/capo_VI-articolo_69.html), [AgID Linee guida su acquisizione e riuso di software per le pubbliche amministrazioni](https://www.agid.gov.it/it/design-servizi/riuso-open-source/linee-guida-acquisizione-riuso-software-pa).",
  },
  "municipality-informative-security": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.5.1 - CERTIFICATO HTTPS - Il sito comunale deve avere un certificato https valido e attivo.",
    failureTitle:
      "C.SI.5.1 - CERTIFICATO HTTPS - Il sito comunale deve avere un certificato https valido e attivo.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito utilizza un certificato https valido e non obsoleto secondo le raccomandazioni AgID; MODALITÀ DI VERIFICA: viene verificato che il certificato https del sito sia valido e attivo; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Agid Raccomandazioni in merito allo standard Transport Layer Security (TLS)](https://cert-agid.gov.it/wp-content/uploads/2020/11/AgID-RACCSECTLS-01.pdf).",
  },
  "municipality-user-experience-evaluation": {
    greenResult:
      "In tutte le pagine analizzate il componente è presente e rispetta le caratteristiche richieste.",
    yellowResult:
      "In tutte le pagine analizzate il componente è presente ma potrebbe non rispettare tutte le caratteristiche richieste.",
    redResult:
      "In almeno una delle pagine analizzate il componente non è presente o non rispetta le caratteristiche richieste.",
    subItem: {
      greenResult:
        "Pagine nelle quali il componente è presente e rispetta le caratteristiche richieste:",
      yellowResult:
        "Pagine nelle quali il componente è presente ma potrebbe non rispettare tutte le caratteristiche richieste:",
      redResult:
        "Pagine nelle quali il componente non è presente o non rispetta le caratteristiche richieste:",
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SI.2.6 - VALUTAZIONE DELL’ESPERIENZA D’USO, CHIAREZZA INFORMATIVA DELLA SCHEDA DI SERVIZIO - Il sito comunale deve permettere la valutazione della chiarezza informativa per ogni scheda di servizio secondo le modalità indicate nella documentazione del modello di sito comunale.",
    failureTitle:
      "C.SI.2.6 - VALUTAZIONE DELL’ESPERIENZA D’USO, CHIAREZZA INFORMATIVA DELLA SCHEDA DI SERVIZIO - Il sito comunale deve permettere la valutazione della chiarezza informativa per ogni scheda di servizio secondo le modalità indicate nella documentazione del modello di sito comunale.",
    description:
      'CONDIZIONI DI SUCCESSO: la funzionalità per valutare la chiarezza informativa è presente su tutte le schede servizio e rispetta tutte le caratteristiche e passaggi richiesti; MODALITÀ DI VERIFICA: ricercando specifici attributi "data-element" come spiegato nella Documentazione delle App di valutazione, viene verificata la presenza del componente di valutazione all\'interno delle schede servizio, controllando che la funzionalità abbia le caratteristiche richieste nella documentazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/it/versione-corrente/index.html), [eGovernment benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/it/versione-attuale/index.html).',
  },

  "school-legislation-accessibility-declaration-is-present": {
    greenResult: "Il link è nel footer e invia alla pagina corretta.",
    yellowResult: "",
    redResult:
      "Il link non è nel footer o non invia alla pagina corretta o la pagina non esiste.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SC.2.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito della scuola deve esporre la dichiarazione di accessibilità.",
    failureTitle:
      "C.SC.2.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito della scuola deve esporre la dichiarazione di accessibilità.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta a una dichiarazione di accessibilità AgID valida per il sito; MODALITÀ DI VERIFICA: ricercando uno specifico attributo "data-element" come spiegato nella Documentazione delle App di valutazione, viene verificata la presenza del link nel footer, che riporti a una pagina esistente, che l\'url della pagina di destinazione inizi con "https://form.agid.gov.it/view/" e che la pagina contenga l\'url del sito della scuola; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [AgID Linee guida sull’accessibilità degli strumenti informatici](https://docs.italia.it/AgID/documenti-in-consultazione/lg-accessibilita-docs/it/), [Direttiva UE n. 2102/2016](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX%3A32016L2102), [Legge 9 gennaio 2004 n. 4](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.dataPubblicazioneGazzetta=2004-01-17&atto.codiceRedazionale=004G0015&atto.articolo.numero=0&atto.articolo.sottoArticolo=1&atto.articolo.sottoArticolo1=10&qId=cb6b9a05-f5c3-40ac-81b8-f89e73e5b4c7&tabID=0.029511124589268523&title=lbl.dettaglioAtto), [Web Content Accessibility Guidelines WCAG 2.1](https://www.w3.org/Translations/WCAG21-it/#background-on-wcag-2), [AgID dichiarazione di accessibilità](https://www.agid.gov.it/it/design-servizi/accessibilita/dichiarazione-accessibilita), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "school-ux-ui-consistency-bootstrap-italia-double-check": {
    greenResult:
      "In tutte le pagine analizzate la libreria Bootstrap Italia è presente e in uso in una versione idonea.",
    yellowResult: "",
    redResult:
      "In almeno una delle pagine analizzate la libreria Bootstrap Italia non è presente, o non è in uso o ne viene utilizzata una versione datata.",
    subItem: {
      greenResult:
        "Pagine che utilizzano la libreria Bootstrap Italia in una versione idonea e utilizzano almeno una delle classi CSS indicate: ",
      yellowResult: "",
      redResult:
        "Pagine che non utilizzano la libreria Bootstrap Italia in una versione idonea o non utilizzano nessuna delle classi CSS indicate: ",
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SC.1.2 - LIBRERIA DI ELEMENTI DI INTERFACCIA - Il sito della scuola deve utilizzare la libreria Bootstrap Italia in una versione più recente di 1.6.",
    failureTitle:
      "C.SC.1.2 - LIBRERIA DI ELEMENTI DI INTERFACCIA - Il sito della scuola deve utilizzare la libreria Bootstrap Italia in una versione più recente di 1.6.",
    description:
      "CONDIZIONI DI SUCCESSO: la libreria Bootstrap Italia è presente e in uso in una versione uguale o superiore alla 1.6; MODALITÀ DI VERIFICA: in ogni pagina analizzata viene verificata la presenza della libreria Bootstrap Italia e la versione in uso, individuando la proprietà CSS --bootstrap-italia-version all’interno del selettore :root o la variabile globale window.BOOTSTRAP_ITALIA_VERSION. Inoltre deve utilizzare almeno una tra le classi CSS di Bootstrap Italia indicate nella Documentazione dell'App di valutazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs).",
  },
  "school-controlled-vocabularies": {
    greenResult:
      "Tutti gli argomenti appartengono all’elenco di voci del modello e l'elenco degli argomenti è presente nella pagina dei risultati di ricerca.",
    yellowResult:
      "Almeno il 50% degli argomenti appartengono all'elenco di voci del modello e l'elenco degli argomenti è presente nella pagina dei risultati di ricerca.",
    redResult:
      "Meno del 50% degli argomenti appartengono alle voci del modello o l'elenco degli argomenti non è presente nella pagina dei risultati di ricerca.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "R.SC.1.1 - VOCABOLARI CONTROLLATI - Il sito della scuola deve utilizzare argomenti forniti dal modello di sito scuola.",
    failureTitle:
      "R.SC.1.1 - VOCABOLARI CONTROLLATI - Il sito della scuola deve utilizzare argomenti forniti dal modello di sito scuola.",
    description:
      "CONDIZIONI DI SUCCESSO: gli argomenti utilizzati appartengono alla lista indicata all'interno del documento di architettura dell'informazione del modello scuole alla voce \"Le parole della scuola\"  e l’elenco completo degli argomenti utilizzati è presente nella pagina dei risultati di ricerca; MODALITÀ DI VERIFICA: gli argomenti identificati all'interno della funzione di ricerca del sito vengono confrontati con l'elenco di voci presente nel documento di architettura dell'informazione, ricercandoli usando specifici attributi \"data-element\" come spiegato nella Documentazione delle App di valutazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Elenco degli argomenti del Modello scuole](https://docs.google.com/spreadsheets/d/1MoayTY05SE4ixtgBsfsdngdrFJf_Z2KNvDkMF3tKfc8/edit#gid=2135815526), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "school-legislation-cookie-domain-check": {
    greenResult:
      "In tutte le pagine analizzate sono stati rilevati solo cookie idonei.",
    yellowResult: "",
    redResult:
      "In almeno una delle pagine analizzate sono stati rilevati cookie non idonei.",
    subItem: {
      greenResult: "Pagine nelle quali sono stati rilevati solo cookie idonei:",
      yellowResult: "",
      redResult: "Pagine nelle quali sono stati rilevati cookie non idonei:",
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SC.2.3 - COOKIE - Il sito della scuola deve presentare cookie tecnici in linea con la normativa vigente.",
    failureTitle:
      "C.SC.2.3 - COOKIE - Il sito della scuola deve presentare cookie tecnici in linea con la normativa vigente.",
    description:
      "CONDIZIONI DI SUCCESSO: il dominio di tutti i cookie già presenti nel sito, ovvero senza che sia stata espressa una preferenza da parte dell’utente riguardo il loro uso, è corrispondente al dominio del sito web della scuola; MODALITÀ DI VERIFICA: viene verificato che al caricamento di ogni pagina analizzata il dominio dei cookie identificati sia corrispondente al dominio del sito web; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Linee guida cookie e altri strumenti di tracciamento - 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876).",
  },
  "school-ux-ui-consistency-fonts-check": {
    greenResult:
      "In tutte le pagine analizzate vengono utilizzati i font come richiesto.",
    yellowResult:
      "In almeno una delle pagine analizzate sono presenti <h> o <p> che includono altri font oltre a quelli richiesti.",
    redResult:
      "In almeno una delle pagine analizzate sono presenti <h> o <p> che non utilizzano i font come richiesto.",
    subItem: {
      greenResult:
        "Pagine analizzate nelle quali vengono utilizzati i font come richiesto:",
      yellowResult:
        "Pagine analizzate nelle quali sono presenti <h> o <p> che includono altri font oltre a quelli richiesti:",
      redResult:
        "Pagine analizzate nelle quali sono presenti <h> o <p> che non utilizzano i font come richiesto:",
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SC.1.1 - COERENZA DELL'UTILIZZO DEI FONT (librerie di caratteri) - Il sito della scuola deve utilizzare i font indicati dalla documentazione del modello di sito della scuola.",
    failureTitle:
      "C.SC.1.1 - COERENZA DELL'UTILIZZO DEI FONT (librerie di caratteri) - Il sito della scuola deve utilizzare i font indicati dalla documentazione del modello di sito della scuola.",
    description:
      'CONDIZIONI DI SUCCESSO: tutti i titoli (heading) e tutti i paragrafi delle pagine del sito in lingua italiana utilizzano esclusivamente i font Titillium Web, Lora o Roboto Mono come font di default; MODALITÀ DI VERIFICA: ricercando specifici attributi "data-element" come spiegato nella Documentazione delle App di valutazione, nelle pagine analizzate viene verificato che i font di default siano quelli richiesti all\'interno di tutti gli <h> e <p>; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "school-menu-structure-match-model": {
    greenResult:
      "Le voci del menù sono corrett, nell'ordine giusto e inviano a pagine interne al dominio della scuola.",
    yellowResult:
      "L'ordine delle voci del menu è corretto ma sono presenti fino a 3 voci aggiuntive. Tutte le voci inviano a pagine interne al dominio della scuola.",
    redResult:
      "Almeno una delle voci obbligatorie è assente o inesatta e/o le voci obbligatorie sono in ordine errato e/o sono presenti 8 o più voci nel menù del sito e/o sono presenti voci che inviano a pagine esterne al dominio della scuola.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SC.1.4 - VOCI DI MENÙ DI PRIMO LIVELLO - Il sito della scuola deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito scolastico.",
    failureTitle:
      "C.SC.1.4 - VOCI DI MENÙ DI PRIMO LIVELLO - Il sito della scuola deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito scolastico.",
    description:
      'CONDIZIONI DI SUCCESSO: le voci del menù di primo livello del sito sono esattamente quelle indicate nel documento di architettura dell’informazione e sono nell’ordine indicato (ovvero Scuola, Servizi, Novità, Didattica) e tutte le pagine raggiungibili dal menu di primo livello appartengono al dominio della scuola; MODALITÀ DI VERIFICA: ricercando uno specifico attributo "data-element" come spiegato nella Documentazione delle App di valutazione, vengono identificate le voci presenti nel menù del sito, il loro ordine e confrontate con quanto indicato nel documento di architettura dell\'informazione, applicando una tolleranza di massimo 3 voci aggiuntive. Inoltre, viene verificato che tutte le pagine raggiungibili dal menu di primo livello portino a pagine interne al dominio del sito della scuola; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "school-menu-scuola-second-level-structure-match-model": {
    greenResult:
      "Tutte le voci usate sono corrette e inviano a pagine interne al dominio della scuola.",
    yellowResult:
      "Almeno il 30% delle voci usate sono corrette e tutte le voci inviano a pagine interne al dominio della scuola.",
    redResult:
      "Meno del 30% delle voci sono corrette o sono presenti voci che inviano a pagine esterne al dominio della scuola.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SC.1.5 - VOCI DI MENÙ DI SECONDO LIVELLO - Il sito presenta le voci di menù di secondo livello come descritto nella documentazione del modello di sito della scuola.",
    failureTitle:
      "C.SC.1.5 - VOCI DI MENÙ DI SECONDO LIVELLO - Il sito presenta le voci di menù di secondo livello come descritto nella documentazione del modello di sito della scuola.",
    description:
      'CONDIZIONI DI SUCCESSO: tutte le voci del menù di secondo livello usate fanno riferimento alla voce di primo livello corrispondente secondo quanto indicato nel documento di architettura dell\'informazione del modello scuole; MODALITÀ DI VERIFICA: ricercando specifici attributi "data-element" come spiegato nella Documentazione delle App di valutazione, vengono verificate le voci di secondo livello usate rispetto ad ognuna delle voci di primo livello del menù e che tutte le pagine raggiungibili dal menu di secondo livello appartengano al dominio della scuola. Nel conteggio vengono incluse anche le voci di secondo livello riferite a voci di primo livello non indicate nella documentazione. Inoltre, viene verificato che tutte le pagine raggiungibili dal menu di secondo livello portino a pagine interne al dominio del sito della scuola; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "school-legislation-privacy-is-present": {
    greenResult:
      "Il link è nel footer e invia a una pagina esistente e sicura.",
    yellowResult: "",
    redResult:
      "Il link non è nel footer o non invia a una pagina esistente o sicura.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SC.2.1 - INFORMATIVA PRIVACY - Il sito della scuola deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
    failureTitle:
      "C.SC.2.1 - INFORMATIVA PRIVACY - Il sito della scuola deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta a una pagina sicura riguardante l\'informativa sulla privacy; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, che riporti a una pagina esistente e con certificato HTTPS valido e attivo, ricercando uno specifico attributo "data-element" come spiegato nella Documentazione delle App di valutazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/versione-corrente/index.html), [GDPR Artt. 13 e 14, Reg. UE n. 2016/679](https://www.garanteprivacy.it/regolamentoue), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/it/versione-attuale/index.html).',
  },
  "school-security": {
    greenResult: "Il certificato del sito [url] è attivo e valido.",
    yellowResult: "",
    redResult: "Il certificato del sito [url] non è attivo o valido: ",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SC.3.1 - CERTIFICATO HTTPS - Il sito della scuola deve avere un certificato https valido e attivo.",
    failureTitle:
      "C.SC.3.1 - CERTIFICATO HTTPS - Il sito della scuola deve avere un certificato https valido e attivo.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito utilizza un certificato https valido e non obsoleto secondo le raccomandazioni AgID; MODALITÀ DI VERIFICA: viene verificato che il certificato https del sito sia valido e attivo; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Agid Raccomandazioni in merito allo standard Transport Layer Security (TLS)](https://cert-agid.gov.it/wp-content/uploads/2020/11/AgID-RACCSECTLS-01.pdf).",
  },
  "school-servizi-structure-match-model": {
    greenResult:
      "In tutte le pagine analizzate tutte le voci obbligatorie e i relativi contenuti sono presenti e, dove richiesto, sono nell'ordine corretto.",
    yellowResult:
      "In almeno una delle pagine analizzate fino a 2 voci obbligatorie o i relativi contenuti non sono presenti o 1 voce non è nell'ordine corretto.",
    redResult:
      "In almeno una delle pagine analizzate più di 2 voci obbligatorie o i relativi contenuti non sono presenti o più di 1 voce non è nell'ordine corretto.",
    subItem: {
      greenResult:
        "Pagine nelle quali tutte le voci obbligatorie e i relativi contenuti sono presenti e, dove richiesto, sono nell'ordine corretto:",
      yellowResult:
        "Pagine nelle quali fino a 2 voci obbligatorie o i relativi contenuti non sono presenti o 1 voce non è nell'ordine corretto:",
      redResult:
        "Pagine nelle quali più di 2 voci obbligatorie o i relativi contenuti non sono presenti o più di 1 voce non è nell'ordine corretto:",
    },
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "R.SC.1.2 - SCHEDE INFORMATIVE DI SERVIZIO - Tutte le schede informative dei servizi devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
    failureTitle:
      "R.SC.1.2 - SCHEDE INFORMATIVE DI SERVIZIO - Tutte le schede informative dei servizi devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
    description:
      "CONDIZIONI DI SUCCESSO: nelle schede informative di servizio le voci obbligatorie e i relativi contenuti sono presenti e, dove richiesto, sono nell'ordine corretto; MODALITÀ DI VERIFICA: ricercando specifici attributi \"data-element\" come spiegato nella Documentazione delle App di valutazione, la presenza e l'ordine delle voci richieste viene verificato ricercandoli all'interno della pagina e dell'indice. Per essere ritenute valide, le voci devono avere contenuti associati della tipologia indicata all'interno del documento di architettura dell'informazione. Maggiori dettagli sono indicati nella Documentazione delle App di valutazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Content type: scheda servizio](https://docs.google.com/spreadsheets/d/1MoayTY05SE4ixtgBsfsdngdrFJf_Z2KNvDkMF3tKfc8/edit#gid=0), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "school-ux-ui-consistency-theme-version-check": {
    greenResult:
      "Il sito utilizza una versione uguale o superiore alla 2.0 del tema CMS del modello.",
    yellowResult: "Il sito non utilizza il tema CMS del modello.",
    redResult:
      "Il sito non utilizza una versione uguale o superiore alla 2.0 del tema CMS del modello.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SC.1.3 - UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito della scuola, lo utilizza nella versione 2.0 o successive.",
    failureTitle:
      "C.SC.1.3 - UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito della scuola, lo utilizza nella versione 2.0 o successive.",
    description:
      "CONDIZIONI DI SUCCESSO: se è in uso il tema CMS del modello scuole, la versione utilizzata è uguale o superiore alla 2.0; MODALITÀ DI VERIFICA: viene verificato l'uso del tema CMS del modello e la versione in uso ricercando uno specifico testo all'interno di tutti i file .CSS presenti in pagina. Lo specifico testo ricercato viene indicato nella Documentazione delle App di valutazione; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/versione-corrente/index.html), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/it/versione-attuale/index.html).",
  },

  "school-informative-cloud-infrastructure": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "R.SC.2.3 - INFRASTRUTTURE CLOUD - Il sito della scuola deve essere ospitato su infrastrutture qualificate ai sensi della normativa vigente.",
    failureTitle:
      "R.SC.2.3 - INFRASTRUTTURE CLOUD - Il sito della scuola deve essere ospitato su infrastrutture qualificate ai sensi della normativa vigente.",
    description:
      "RIFERIMENTI TECNICI E NORMATIVI: per consentire un'erogazione più sicura, efficiente e scalabile del sito della scuola, può essere utile considerare di impostare l'infrastruttura che lo ospita in cloud, secondo quanto descritto nella [Strategia Cloud Italia](https://cloud.italia.it/strategia-cloud-pa/).",
  },
  "school-license-and-attribution": {
    greenResult:
      "La dicitura sulla licenza dei contenuti è presente nella pagina delle note legali raggiungibile dal footer.",
    yellowResult: "",
    redResult:
      "La dicitura sulla licenza dei contenuti è errata o non presente nella pagina delle note legali o questa non è raggiungibile dal footer.",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "R.SC.2.2 - LICENZA E ATTRIBUZIONE - Il sito della scuola deve pubblicare dati, documenti e informazioni con licenza aperta (es. CC-BY 4.0).",
    failureTitle:
      "R.SC.2.2 - LICENZA E ATTRIBUZIONE - Il sito della scuola deve pubblicare dati, documenti e informazioni con licenza aperta (es. CC-BY 4.0).",
    description:
      'CONDIZIONI DI SUCCESSO: nella pagina delle noti legali viene indicato che i dati, documenti e informazioni riportati sul sito sono rilasciati con licenza CC-BY 4.0; MODALITÀ DI VERIFICA: ricercando uno specifico attributo "data-element" come spiegato nella Documentazione delle App di valutazione, viene verificato che la pagina delle note legali sia raggiungibile dal footer e che questa contenga una sezione "Licenza dei contenuti" riportante la dicitura indicata nella Documentazione del modello; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [CAD Art. 52 d.lgs. 82/2005](https://docs.italia.it/italia/piano-triennale-ict/codice-amministrazione-digitale-docs/it/stabile/_rst/capo_V-sezione_I-articolo_52.html), [art. 7, comma 1, D.Lgs. n. 33/2013](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2013-03-14;33), [d.lgs. n. 36/2006](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2006-01-24;36!vig=), [AgID Linee guida su acquisizione e riuso di software per le pubbliche amministrazioni](https://www.agid.gov.it/it/design-servizi/riuso-open-source/linee-guida-acquisizione-riuso-software-pa), [Documentazione delle App di valutazione](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "school-informative-reuse": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "R.SC.2.1 - RIUSO - La scuola deve mettere a riuso sotto licenza aperta il software secondo le Linee Guida “acquisizione e riuso di software e riuso di software per le pubbliche amministrazioni“.",
    failureTitle:
      "R.SC.2.1 - RIUSO - La scuola deve mettere a riuso sotto licenza aperta il software secondo le Linee Guida “acquisizione e riuso di software e riuso di software per le pubbliche amministrazioni“.",
    description:
      "RIFERIMENTI TECNICI E NORMATIVI: [CAD: Art. 69. (Riuso delle soluzioni e standard aperti)](https://docs.italia.it/italia/piano-triennale-ict/codice-amministrazione-digitale-docs/it/stabile/_rst/capo_VI-articolo_69.html), [AgID Linee guida su acquisizione e riuso di software per le pubbliche amministrazioni](https://www.agid.gov.it/it/design-servizi/riuso-open-source/linee-guida-acquisizione-riuso-software-pa).",
  },
  "school-informative-security": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted:
      "Uno o più data-element necessari per condurre il test non sono stati trovati. Verifica il capitolo sui Requisiti tecnici nella Documentazione delle App di valutazione per risolvere il problema.",
    title:
      "C.SC.3.1 - CERTIFICATO HTTPS - Il sito della scuola deve avere un certificato https valido e attivo.",
    failureTitle:
      "C.SC.3.1 - CERTIFICATO HTTPS - Il sito della scuola deve avere un certificato https valido e attivo.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito utilizza un certificato https valido e non obsoleto secondo le raccomandazioni AgID; MODALITÀ DI VERIFICA: viene verificato che il certificato https del sito sia valido e attivo; RIFERIMENTI TECNICI E NORMATIVI: [Documentazione del Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Agid Raccomandazioni in merito allo standard Transport Layer Security (TLS)](https://cert-agid.gov.it/wp-content/uploads/2020/11/AgID-RACCSECTLS-01.pdf).",
  },
};
