export const auditDictionary = {
  "common-security-ip-location": {
    greenResult: "L'hosting è su territorio europeo.",
    yellowResult: "",
    redResult: "L'hosting non è su territorio europeo.",
    nonExecuted: "",
    title:
      "LOCALIZZAZIONE IP - Il sito deve essere hostato su datacenter localizzati su territorio europeo.",
    failureTitle:
      "LOCALIZZAZIONE IP - Il sito deve essere hostato su datacenter localizzati su territorio europeo.",
    description:
      "CONDIZIONI DI SUCCESSO: l'indirizzo IP fa riferimento a un datacenter localizzato su territorio europeo; MODALITÀ DI VERIFICA: verifica che la localizzazione dell'IP rientri all'interno di uno dei confini degli stati membri dell'UE; RIFERIMENTI TECNICI E NORMATIVI: GDPR",
  },

  "common-informative-ip-location": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "LOCALIZZAZIONE IP - Il sito deve essere hostato su datacenter localizzati su territorio europeo.",
    failureTitle:
      "LOCALIZZAZIONE IP - Il sito deve essere hostato su datacenter localizzati su territorio europeo.",
    description:
      "CONDIZIONI DI SUCCESSO: l'indirizzo IP fa riferimento a un datacenter localizzato su territorio europeo; MODALITÀ DI VERIFICA: verifica che la localizzazione dell'IP rientri all'interno di uno dei confini degli stati membri dell'UE; RIFERIMENTI TECNICI E NORMATIVI: GDPR",
  },

  "municipality-legislation-accessibility-declaration-is-present": {
    greenResult: "Il link è nel footer e invia alla pagina corretta.",
    yellowResult: "",
    redResult:
      "Il link non è nel footer o non invia alla pagina corretta o la pagina non esiste.",
    nonExecuted: "",
    title:
      "C.SI.3.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito comunale deve esporre la dichiarazione di accessibilità.",
    failureTitle:
      "C.SI.3.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito comunale deve esporre la dichiarazione di accessibilità.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta alla dichiarazione di accessibilità di AgID, in conformità al modello e alle linee guida rese disponibile da AgID in ottemperanza alla normativa vigente in materia di accessibilità, con livelli di accessibilità contemplati nelle specifiche tecniche WCAG 2.1; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, che riporti a una pagina esistente e che sia quella contenente la dichiarazione di accessibilità (il link deve iniziare con "https://form.agid.gov.it/view/"), ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: AgID Linee guida sull’accessibilità degli strumenti informatici, Direttiva UE n. 2102/2016, Legge 9 gennaio 2004 n. 4, Web Content Accessibility Guidelines WCAG 2.1, [AgID dichiarazione di accessibilità](https://www.agid.gov.it/it/design-servizi/accessibilita/dichiarazione-accessibilita), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-booking-appointment-check": {
    greenResult: "Il componente è presente.",
    yellowResult: "Il componente è assente.",
    redResult: "",
    nonExecuted:
      "Non è stato possibile identificare l'elemento su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.",
    title:
      "C.SI.2.1 - PRENOTAZIONE APPUNTAMENTI - Il sito comunale deve consentire, per tutti i servizi che prevedono una erogazione a sportello, di prenotare un appuntamento presso lo sportello di competenza.",
    failureTitle:
      "C.SI.2.1 - PRENOTAZIONE APPUNTAMENTI - Il sito comunale deve consentire, per tutti i servizi che prevedono una erogazione a sportello, di prenotare un appuntamento presso lo sportello di competenza.",
    description:
      'CONDIZIONI DI SUCCESSO: la funzionalità di prenotazione di un appuntamento presso lo sportello è presente in tutte le schede servizio che lo richiedono; MODALITÀ DI VERIFICA: viene verificata la presenza del componente "Prenota appuntamento" all\'interno di una scheda servizio selezionata casualmente, ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica. Questo test non ha una condizione di fallimento in quanto dipende dal servizio specifico analizzato; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-ux-ui-consistency-bootstrap-italia-double-check": {
    greenResult:
      "Il sito utilizza la libreria Bootstrap Italia in una versione idonea.",
    yellowResult: "",
    redResult:
      "Il sito non utilizza la libreria Bootstrap Italia o ne utilizza una versione datata.",
    nonExecuted: "",
    title:
      "C.SI.1.2 - LIBRERIA DI ELEMENTI DI INTERFACCIA - Il sito comunale deve utilizzare la libreria Bootstrap Italia.",
    failureTitle:
      "C.SI.1.2 - LIBRERIA DI ELEMENTI DI INTERFACCIA - Il sito comunale deve utilizzare la libreria Bootstrap Italia.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito usa la libreria Bootstrap Italia in una versione uguale o superiore alla 2.0; MODALITÀ DI VERIFICA: viene verificata la presenza della libreria Bootstrap Italia e la versione in uso individuando la proprietà CSS --bootstrap-italia-version all’interno del selettore :root o la variabile globale window.BOOTSTRAP_ITALIA_VERSION; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/).",
  },
  "municipality-contacts-assistency": {
    greenResult: 'La voce "Contatti" è presente.',
    yellowResult: "",
    redResult: 'La voce "Contatti" è assente.',
    nonExecuted:
      "Non è stato possibile identificare l'elemento su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.",
    title:
      "C.SI.2.2 - RICHIESTA DI ASSISTENZA / CONTATTI - All'interno del sito comunale, nel contenuto della scheda servizio, devono essere comunicati i contatti dell'ufficio preposto all'erogazione del servizio.",
    failureTitle:
      "C.SI.2.2 - RICHIESTA DI ASSISTENZA / CONTATTI - All'interno del sito comunale, nel contenuto della scheda servizio, devono essere comunicati i contatti dell'ufficio preposto all'erogazione del servizio.",
    description:
      "CONDIZIONI DI SUCCESSO: i contatti dell'ufficio preposto all'erogazione del servizio sono presenti in tutte le schede servizio; MODALITÀ DI VERIFICA: viene verificata la presenza della voce \"Contatti\" all'interno dell'indice di una scheda servizio selezionata casualmente, ricercando uno specifico attributo \"data-element\" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [eGovernment benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "municipality-controlled-vocabularies": {
    greenResult:
      "Tutti gli argomenti appartengono all’elenco di voci del modello.",
    yellowResult:
      "Almeno il 50% degli argomenti appartengono all'elenco di voci del modello o al vocabolario EuroVoc.",
    redResult:
      "Meno del 50% degli argomenti appartengono alle voci del modello Comuni o al vocabolario EuroVoc.",
    nonExecuted:
      "Non è stato possibile trovare gli argomenti o la pagina che li contiene. Controlla le “Modalità di verifica” per scoprire di più.",
    title:
      "C.SI.1.5 - VOCABOLARI CONTROLLATI - Il sito comunale deve utilizzare argomenti forniti dal modello di sito comunale o appartenenti al vocabolario controllato europeo EuroVoc.",
    failureTitle:
      "C.SI.1.5 - VOCABOLARI CONTROLLATI - Il sito comunale deve utilizzare argomenti forniti dal modello di sito comunale o appartenenti al vocabolario controllato europeo EuroVoc.",
    description:
      "CONDIZIONI DI SUCCESSO: gli argomenti utilizzati appartengono alla lista indicata all'interno del documento di architettura dell'informazione del modello Comuni alla voce \"Tassonomia ARGOMENTI\" o al vocabolario controllato EuroVoc; MODALITÀ DI VERIFICA: gli argomenti identificati all'interno della funzione di ricerca del sito vengono confrontati con l'elenco di voci presente nel documento di architettura dell'informazione e con il vocabolario controllato EuroVoc, ricercandoli usando specifici attributi \"data-element\" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/), [Elenco degli argomenti del Modello Comuni](https://docs.google.com/spreadsheets/d/1D4KbaA__xO9x_iBm08KvZASjrrFLYLKX/edit#gid=428595160), [Vocabolario EuroVoc](https://eur-lex.europa.eu/browse/eurovoc.html?locale=it).",
  },
  "municipality-legislation-cookie-domain-check": {
    greenResult: "Cookie idoneo.",
    yellowResult: "",
    redResult: "Cookie non idoneo.",
    nonExecuted: "",
    title:
      "C.SI.3.1 - COOKIE - Il sito comunale deve presentare cookie tecnici in linea con la normativa vigente.",
    failureTitle:
      "C.SI.3.1 - COOKIE - Il sito comunale deve presentare cookie tecnici in linea con la normativa vigente.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito presenta solo cookie idonei come definito dalla normativa; MODALITÀ DI VERIFICA: viene verificato che il dominio dei cookie identificati sia corrispondente al dominio del sito web; RIFERIMENTI TECNICI E NORMATIVI: [Linee guida cookie e altri strumenti di tracciamento - 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876)",
  },
  "municipality-domain": {
    greenResult: "Il dominio utilizzato è corretto.",
    yellowResult: "",
    redResult:
      "Il dominio utilizzato non è presente nell'elenco dei domini riservati.",
    nonExecuted: "",
    title:
      "C.SI.5.2 - DOMINIO ISTITUZIONALE - Il sito comunale deve utilizzare un dominio istituzionale presente all’interno dell’Anagrafe dei domini.",
    failureTitle:
      "C.SI.5.2 - DOMINIO ISTITUZIONALE - Il sito comunale deve utilizzare un dominio istituzionale presente all’interno dell’Anagrafe dei domini.",
    description:
      "CONDIZIONI DI SUCCESSO: il dominio istituzione del sito è valido; MODALITÀ DI VERIFICA: viene verificato che il dominio utilizzato dal sito sia presente nell'Elenco Nomi a Dominio Riservati per i Comuni Italiani; RIFERIMENTI TECNICI E NORMATIVI: [Elenco Nomi a Dominio Riservati Per i Comuni Italiani](https://www.nic.it/sites/default/files/docs/comuni_list.html).",
  },
  "municipality-faq-is-present": {
    greenResult:
      "Il link è nel footer, la pagina di destinazione esiste e la label è nominata correttamente.",
    yellowResult:
      "Il link è nel footer, la pagina di destinazione esiste ma la label non è nominata correttamente.",
    redResult:
      "Il link non è nel footer o la pagina di destinazione è inesistente.",
    nonExecuted: "",
    title:
      "C.SI.2.3 - RICHIESTA DI ASSISTENZA / DOMANDE FREQUENTI - Il sito comunale deve contenere una sezione per le domande più frequenti (FAQ).",
    failureTitle:
      "C.SI.2.3 - RICHIESTA DI ASSISTENZA / DOMANDE FREQUENTI - Il sito comunale deve contenere una sezione per le domande più frequenti (FAQ).",
    description:
      'CONDIZIONI DI SUCCESSO: nel footer del sito è presente un link alle domande più frequenti che contenga le espressioni "FAQ" oppure "domande frequenti"; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica, che il link invii ad una pagina esistente e che il testo del link contenga almeno una delle espressioni richieste, senza fare distinzione tra caratteri minuscoli o maiuscoli; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [eGovernment benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-feedback-element": {
    greenResult: "Il componente è presente in tutte le pagine valutate.",
    yellowResult: "",
    redResult:
      "Il componente non è presente in una o più delle pagine valutate.",
    nonExecuted:
      "Non è stato possibile identificare l'elemento su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.",
    title:
      "C.SI.2.5 - VALUTAZIONE DELL'ESPERIENZA D'USO, CHIAREZZA DELLE PAGINE INFORMATIVE - Il sito comunale deve consentire al cittadino di fornire una valutazione della chiarezza di ogni pagina di primo e secondo livello.",
    failureTitle:
      "C.SI.2.5 - VALUTAZIONE DELL'ESPERIENZA D'USO, CHIAREZZA DELLE PAGINE INFORMATIVE - Il sito comunale deve consentire al cittadino di fornire una valutazione della chiarezza di ogni pagina di primo e secondo livello.",
    description:
      'CONDIZIONI DI SUCCESSO: la funzionalità per valutare la chiarezza informativa è presente su tutte le pagine di primo e secondo livello del sito; MODALITÀ DI VERIFICA: viene verificata la presenza del componente su una pagina di primo livello selezionata casualmente e su una pagina di secondo livello selezionata casualmente a partire dalla pagina "Servizi", ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [eGovernment benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-ux-ui-consistency-fonts-check": {
    greenResult: "Il sito utilizza tutti i font necessari.",
    yellowResult: "Il sito utilizza il font Titillium Web ma non il font Lora.",
    redResult: "Il sito non utilizza i font del modello.",
    nonExecuted:
      "Non è stato possibile trovare una scheda servizio su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.",
    title:
      "C.SI.1.1 - CONSISTENZA DELL'UTILIZZO DEI FONT (librerie di caratteri) - Il sito comunale deve utilizzare i font indicati dalla documentazione del modello di sito comunale.",
    failureTitle:
      "C.SI.1.1 - CONSISTENZA DELL'UTILIZZO DEI FONT (librerie di caratteri) - Il sito comunale deve utilizzare i font indicati dalla documentazione del modello di sito comunale.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito utilizza almeno i font Titillium Web e Lora; MODALITÀ DI VERIFICA: ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica, viene verificata la presenza dei font all\'interno di una scheda servizio casualmente selezionata; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-inefficiency-report": {
    greenResult:
      "Il link è nel footer, la pagina di destinazione esiste e la label è nominata correttamente.",
    yellowResult:
      "Il link è nel footer, la pagina di destinazione esiste ma la label non è nominata correttamente.",
    redResult:
      "Il link non è nel footer o la pagina di destinazione è inesistente.",
    nonExecuted: "",
    title:
      "C.SI.2.4 - SEGNALAZIONE DISSERVIZIO - Il sito comunale deve fornire al cittadino la possibilità di segnalare un disservizio, tramite email o servizio dedicato.",
    failureTitle:
      "C.SI.2.4 - SEGNALAZIONE DISSERVIZIO - Il sito comunale deve fornire al cittadino la possibilità di segnalare un disservizio, tramite email o servizio dedicato.",
    description:
      'CONDIZIONI DI SUCCESSO: nel footer del sito è presente un link per la segnalazione di un disservizio che contenga le espressioni "disservizio" oppure "segnala disservizio" oppure "segnalazione disservizio"; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica, che il link invii ad una pagina esistente e che il testo del link contenga almeno una delle espressioni richieste, senza fare distinzione tra caratteri minuscoli o maiuscoli; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [eGovernment benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-menu-structure-match-model": {
    greenResult: "Le voci del menù sono corrette e nell'ordine giusto.",
    yellowResult:
      "L'ordine delle voci del menu è corretto ma sono presenti fino a 3 voci aggiuntive.",
    redResult:
      "Almeno una delle voci obbligatorie è assente o inesatta e/o le voci obbligatorie sono in ordine errato e/o sono presenti 8 o più voci nel menù del sito.",
    nonExecuted: "",
    title:
      "C.SI.1.6 - VOCI DI MENÙ DI PRIMO LIVELLO - Il sito comunale deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito comunale.",
    failureTitle:
      "C.SI.1.6 - VOCI DI MENÙ DI PRIMO LIVELLO - Il sito comunale deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito comunale.",
    description:
      "CONDIZIONI DI SUCCESSO: le voci del menù di primo livello del sito sono esattamente quelle indicate nel documento di architettura dell'informazione e sono nell'ordine indicato (ovvero Amministrazione, Novità, Servizi, Vivere il Comune); MODALITÀ DI VERIFICA: ricercando uno specifico attributo \"data-element\" come spiegato nella documentazione tecnica, vengono identificate le voci presenti nel menù del sito, il loro ordine e confrontate con quanto indicato nel documento di architettura dell'informazione, applicando una tolleranza di massimo 3 voci aggiuntive; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "municipality-metatag": {
    greenResult: "Tutti i metatag richiesti sono presenti e corretti.",
    yellowResult:
      "Almeno il 50% dei metatag richiesti sono presenti e corretti.",
    redResult: "Meno del 50% dei metatag richiesti sono presenti e corretti.",
    nonExecuted:
      "Non è stato possibile trovare una scheda servizio su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.",
    title:
      "R.SI.1.1 - METATAG - Nel sito comunale, le voci della scheda servizio devono presentare i metatag descritti dal modello, in base agli standard internazionali.",
    failureTitle:
      "R.SI.1.1 - METATAG - Nel sito comunale, le voci della scheda servizio devono presentare i metatag descritti dal modello, in base agli standard internazionali.",
    description:
      'CONDIZIONI DI SUCCESSO: le voci delle schede servizio presentano tutti i metatag richiesti dal modello; MODALITÀ DI VERIFICA: viene verificata la presenza e correttezza dei metatag indicati nella sezione "Dati strutturati e interoperabilità" della documentazione in una scheda servizio selezionata casualmente, ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Schema](http://www.schema.org/), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-personal-area-security": {
    greenResult: "Il certificato del sito [url] è attivo e valido.",
    yellowResult: "",
    redResult: "Il certificato del sito [url] non è attivo o valido: ",
    nonExecuted:
      "Non è stato possibile identificare l'elemento su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.",
    title:
      "C.SE.5.1 - CERTIFICATO HTTPS AREA SERVIZI PER IL CITTADINO - L'area servizi per il cittadino del sito comunale ha un certificato https valido e attivo.",
    failureTitle:
      "C.SE.5.1 - CERTIFICATO HTTPS AREA SERVIZI PER IL CITTADINO - L'area servizi per il cittadino del sito comunale ha un certificato https valido e attivo.",
    description:
      "CONDIZIONI DI SUCCESSO: l'area privata del cittadino utilizza un certificato https valido e non obsoleto secondo le raccomandazioni AgID; MODALITÀ DI VERIFICA: viene verificato che la pagina di accesso all'area privata del sito abbia un certificato https valido e attivo, ricercando uno specifico attributo \"data-element\" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Agid Raccomandazioni in merito allo standard Transport Layer Security (TLS)](https://cert-agid.gov.it/wp-content/uploads/2020/11/AgID-RACCSECTLS-01.pdf), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "municipality-legislation-privacy-is-present": {
    greenResult:
      "Il link è nel footer e invia a una pagina esistente e sicura.",
    yellowResult:
      "Il link è nel footer e invia a una pagina esistente ma non sicura.",
    redResult: "Il link non è nel footer o non invia a una pagina esistente.",
    nonExecuted: "",
    title:
      "C.SI.3.3 - INFORMATIVA PRIVACY - Il sito comunale deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
    failureTitle:
      "C.SI.3.3 - INFORMATIVA PRIVACY - Il sito comunale deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta alla privacy policy; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, che riporti a una pagina esistente e con certificato HTTPS valido e attivo, ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: GDPR Artt. 13 e 14, Reg. UE n. 679/2016, [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-second-level-pages": {
    greenResult: "Tutti i titoli sono corretti.",
    yellowResult: "Almeno il 50% dei titoli è corretto.",
    redResult: "Meno del 50% dei titoli è corretto.",
    nonExecuted:
      'Non è stato possibile condurre il test. Controlla le "Modalità di verifica" per scoprire di più.',
    title:
      "C.SI.1.7 - TITOLI DELLE PAGINE DI SECONDO LIVELLO - Nel sito comunale, i titoli delle pagine di secondo livello devono rispettare il vocabolario descritto dalla documentazione del modello di sito comunale.",
    failureTitle:
      "C.SI.1.7 - TITOLI DELLE PAGINE DI SECONDO LIVELLO - Nel sito comunale, i titoli delle pagine di secondo livello devono rispettare il vocabolario descritto dalla documentazione del modello di sito comunale.",
    description:
      'CONDIZIONI DI SUCCESSO: i titoli delle pagine di secondo livello corrispondono a quelli indicati nel documento di architettura dell\'informazione del modello Comuni; MODALITÀ DI VERIFICA: vengono confrontati i titoli delle categorie di servizi presentati nella pagina di primo livello "Servizi" con i titoli richiesti dal modello nell\'elenco Tassonomia categorie dei servizi del documento di architettura dell\'informazione, ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Tassonomia categorie dei servizi](https://docs.google.com/spreadsheets/d/1D4KbaA__xO9x_iBm08KvZASjrrFLYLKX/edit#gid=938683089), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "municipality-security": {
    greenResult: "Il certificato del sito [url] è attivo e valido.",
    yellowResult: "",
    redResult: "Il certificato del sito [url] non è attivo o valido: ",
    nonExecuted: "",
    title:
      "C.SI.5.1 - CERTIFICATO HTTPS - Il sito comunale deve avere un certificato https valido e attivo.",
    failureTitle:
      "C.SI.5.1 - CERTIFICATO HTTPS - Il sito comunale deve avere un certificato https valido e attivo.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito utilizza un certificato https valido e non obsoleto secondo le raccomandazioni AgID; MODALITÀ DI VERIFICA: viene verificato che il certificato https del sito sia valido e attivo; RIFERIMENTI TECNICI E NORMATIVI: [Agid Raccomandazioni in merito allo standard Transport Layer Security (TLS)](https://cert-agid.gov.it/wp-content/uploads/2020/11/AgID-RACCSECTLS-01.pdf).",
  },
  "municipality-servizi-structure-match-model": {
    greenResult:
      "Tutte le voci obbligatorie sono presenti e nell'ordine corretto.",
    yellowResult:
      "Fino a 2 voci obbligatorie non sono presenti o 1 voce non è nell'ordine corretto.",
    redResult:
      "Più di 2 voci obbligatorie non sono presenti o più di 1 voce non è nell'ordine corretto.",
    nonExecuted:
      "Non è stato possibile trovare una scheda servizio su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.",
    title:
      "C.SI.1.3 - SCHEDE INFORMATIVE DI SERVIZIO PER IL CITTADINO - Tutte le schede informative dei servizi per il cittadino devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
    failureTitle:
      "C.SI.1.3 - SCHEDE INFORMATIVE DI SERVIZIO PER IL CITTADINO - Tutte le schede informative dei servizi per il cittadino devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
    description:
      "CONDIZIONI DI SUCCESSO: nelle schede informative di servizio le voci indicate come obbligatorie sono presenti e sono nell'ordine corretto; MODALITÀ DI VERIFICA: viene verificato se le voci indicate come obbligatorie all'interno del documento di architettura dell'informazione sono presenti. Inoltre viene verificato se le voci obbligatorie presenti nell'indice della pagina sono nell'ordine corretto. La verifica viene effettuata su una scheda servizio casualmente selezionata, ricercando le voci indicate nella documentazione tecnica tramite specifici attributi \"data-element\"; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Content type: scheda servizio](https://docs.google.com/spreadsheets/d/1D4KbaA__xO9x_iBm08KvZASjrrFLYLKX/edit#gid=335720294dngdrFJf_Z2KNvDkMF3tKfc8/edit#gid=0), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "municipality-subdomain": {
    greenResult:
      "La pagina utilizza un sottodominio congruente al dominio del sito e fa riferimento a un dominio riservato.",
    yellowResult:
      "La pagina non utilizza un sottodominio ma il dominio utilizzato è valido.",
    redResult:
      "La pagina utilizza un sottodominio non congruente al dominio del sito o non fa riferimento a un dominio valido.",
    nonExecuted:
      "Non è stato possibile identificare l'elemento su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.",
    title:
      "C.SE.5.2 - SOTTODOMINIO ISTITUZIONALE - L'area servizi per il cittadino del sito comunale deve utilizzare un sottodominio istituzionale congruente al dominio istituzionale del sito, presente all’interno dell’Anagrafe dei domini.",
    failureTitle:
      "C.SE.5.2 - SOTTODOMINIO ISTITUZIONALE - L'area servizi per il cittadino del sito comunale deve utilizzare un sottodominio istituzionale congruente al dominio istituzionale del sito, presente all’interno dell’Anagrafe dei domini.",
    description:
      "CONDIZIONI DI SUCCESSO: l'area servizi fa riferimento a un sottodominio istituzionale valido; MODALITÀ DI VERIFICA: ricercando uno specifico attributo \"data-element\" come spiegato nella documentazione tecnica, viene verificato che il sottodominio/dominio della pagina di accesso all'area privata sia congruente al dominio utilizzato dal sito e che questo dominio sia presente nell'Elenco Nomi a Dominio Riservati per i Comuni Italiani; RIFERIMENTI TECNICI E NORMATIVI: [Elenco Nomi a Dominio Riservati Per i Comuni Italiani](https://www.nic.it/sites/default/files/docs/comuni_list.html), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "municipality-ux-ui-consistency-theme-version-check": {
    greenResult:
      "Il sito utilizza una versione idonea del tema CMS del modello.",
    yellowResult: "Il sito non sembra utilizzare il tema CMS del modello.",
    redResult: "Il sito utilizza una versione datata del tema CMS del modello.",
    nonExecuted:
      'Non è stato possibile condurre il test. Controlla le "Modalità di verifica" per scoprire di più.',
    title:
      "C.SI.1.4 - UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito comunale, deve utilizzarne la versione più recente disponibile alla data di inizio lavori.",
    failureTitle:
      "C.SI.1.4 - UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito comunale, deve utilizzarne la versione più recente disponibile alla data di inizio lavori.",
    description:
      'CONDIZIONI DI SUCCESSO: se è in uso il tema CMS del modello per i Comuni, la versione utilizzata è uguale o superiore alla 1.0; MODALITÀ DI VERIFICA: viene verificata la versione indicata nel file style.css, nel caso sia presente la chiave "Text Domain: design_comuni_italia"; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/).',
  },

  "municipality-informative-cloud-infrastructure": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "R.SI.2.1 - INFRASTRUTTURE CLOUD - Il sito comunale deve essere ospitato su infrastrutture qualificate ai sensi della normativa vigente.",
    failureTitle:
      "R.SI.2.1 - INFRASTRUTTURE CLOUD - Il sito comunale deve essere ospitato su infrastrutture qualificate ai sensi della normativa vigente.",
    description:
      "RIFERIMENTI TECNICI E NORMATIVI: per consentire un'erogazione più sicura, efficiente e scalabile del sito comunale, può essere utile considerare di impostare l'infrastruttura che lo ospita in cloud, secondo quanto descritto nella [Strategia Cloud Italia](https://cloud.italia.it/strategia-cloud-pa/).",
  },
  "municipality-informative-cookie-domain-check": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "C.SI.3.1 - COOKIE - Il sito comunale deve presentare cookie tecnici in linea con la normativa vigente.",
    failureTitle:
      "C.SI.3.1 - COOKIE - Il sito comunale deve presentare cookie tecnici in linea con la normativa vigente.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito presenta solo cookie idonei come definito dalla normativa; MODALITÀ DI VERIFICA: viene verificato che il dominio dei cookie identificati sia corrispondente al dominio del sito web; RIFERIMENTI TECNICI E NORMATIVI: [Linee guida cookie e altri strumenti di tracciamento - 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876)",
  },
  "municipality-informative-domain": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "C.SI.5.2 - DOMINIO ISTITUZIONALE - Il sito comunale deve utilizzare un dominio istituzionale presente all’interno dell’Anagrafe dei domini.",
    failureTitle:
      "C.SI.5.2 - DOMINIO ISTITUZIONALE - Il sito comunale deve utilizzare un dominio istituzionale presente all’interno dell’Anagrafe dei domini.",
    description:
      "CONDIZIONI DI SUCCESSO: il dominio istituzione del sito è valido; MODALITÀ DI VERIFICA: viene verificato che il dominio utilizzato dal sito sia presente nell'Elenco Nomi a Dominio Riservati per i Comuni Italiani; RIFERIMENTI TECNICI E NORMATIVI: [Elenco Nomi a Dominio Riservati Per i Comuni Italiani](https://www.nic.it/sites/default/files/docs/comuni_list.html).",
  },
  "municipality-informative-license-and-attribution": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "C.SI.3.4 - LICENZA E ATTRIBUZIONE - Il sito comunale deve pubblicare dati, documenti e informazioni con licenza aperta (es. CC-BY 4.0).",
    failureTitle:
      "C.SI.3.4 - LICENZA E ATTRIBUZIONE - Il sito comunale deve pubblicare dati, documenti e informazioni con licenza aperta (es. CC-BY 4.0).",
    description:
      "RIFERIMENTI TECNICI E NORMATIVI: CAD Art. 52 d.lgs. 82/2005, art. 7, comma 1, D.Lgs. n. 33/2013, d.lgs. n. 36/2006, AgID Linee guida su acquisizione e riuso di software per le pubbliche amministrazioni.",
  },
  "municipality-informative-personal-area-security": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "C.SE.5.1 - CERTIFICATO HTTPS AREA SERVIZI PER IL CITTADINO - L'area servizi per il cittadino del sito comunale ha un certificato https valido e attivo.",
    failureTitle:
      "C.SE.5.1 - CERTIFICATO HTTPS AREA SERVIZI PER IL CITTADINO - L'area servizi per il cittadino del sito comunale ha un certificato https valido e attivo.",
    description:
      "CONDIZIONI DI SUCCESSO: l'area privata del cittadino utilizza un certificato https valido e non obsoleto secondo le raccomandazioni AgID; MODALITÀ DI VERIFICA: viene verificato che la pagina di accesso all'area privata del sito abbia un certificato https valido e attivo, ricercando uno specifico attributo \"data-element\" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Agid Raccomandazioni in merito allo standard Transport Layer Security (TLS)](https://cert-agid.gov.it/wp-content/uploads/2020/11/AgID-RACCSECTLS-01.pdf), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "municipality-informative-reuse": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "R.SI.2.2 - RIUSO - Il Comune deve mettere a riuso sotto licenza aperta il software secondo le Linee Guida “acquisizione e riuso di software e riuso di software per le pubbliche amministrazioni.",
    failureTitle:
      "R.SI.2.2 - RIUSO - Il Comune deve mettere a riuso sotto licenza aperta il software secondo le Linee Guida “acquisizione e riuso di software e riuso di software per le pubbliche amministrazioni.",
    description:
      "RIFERIMENTI TECNICI E NORMATIVI: CAD: Art. 69. (Riuso delle soluzioni e standard aperti), Art. 69. (Riuso delle soluzioni e standard aperti): AgID Linee guida su acquisizione e riuso di software per le pubbliche amministrazioni.",
  },
  "municipality-informative-security": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "C.SI.5.1 - CERTIFICATO HTTPS - Il sito comunale deve avere un certificato https valido e attivo.",
    failureTitle:
      "C.SI.5.1 - CERTIFICATO HTTPS - Il sito comunale deve avere un certificato https valido e attivo.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito utilizza un certificato https valido e non obsoleto secondo le raccomandazioni AgID; MODALITÀ DI VERIFICA: viene verificato che il certificato https del sito sia valido e attivo; RIFERIMENTI TECNICI E NORMATIVI: [Agid Raccomandazioni in merito allo standard Transport Layer Security (TLS)](https://cert-agid.gov.it/wp-content/uploads/2020/11/AgID-RACCSECTLS-01.pdf).",
  },
  "municipality-informative-subdomain": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "C.SE.5.2 - SOTTODOMINIO ISTITUZIONALE - L'area servizi per il cittadino del sito comunale deve utilizzare un sottodominio istituzionale congruente al dominio istituzionale del sito, presente all’interno dell’Anagrafe dei domini.",
    failureTitle:
      "C.SE.5.2 - SOTTODOMINIO ISTITUZIONALE - L'area servizi per il cittadino del sito comunale deve utilizzare un sottodominio istituzionale congruente al dominio istituzionale del sito, presente all’interno dell’Anagrafe dei domini.",
    description:
      "CONDIZIONI DI SUCCESSO: il sottodominio istituzione del sito è valido; MODALITÀ DI VERIFICA: viene verificato che il sottodominio utilizzato nella pagina di accesso all'area privata sia congruente al dominio utilizzato dal sito e che questo sia presente nell'Elenco Nomi a Dominio Riservati per i Comuni Italiani; RIFERIMENTI TECNICI E NORMATIVI: [Elenco Nomi a Dominio Riservati Per i Comuni Italiani](https://www.nic.it/sites/default/files/docs/comuni_list.html).",
  },
  "municipality-informative-user-experience-evaluation": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "C.SI.2.6 - VALUTAZIONE DELL’ESPERIENZA D’USO, CHIAREZZA INFORMATIVA DELLA SCHEDA DI SERVIZIO - Nel caso in cui il servizio non sia erogato in digitale, il sito deve permettere la valutazione dell’utilità della scheda di servizio, come per il criterio C.SI.2.5.",
    failureTitle:
      "C.SI.2.6 - VALUTAZIONE DELL’ESPERIENZA D’USO, CHIAREZZA INFORMATIVA DELLA SCHEDA DI SERVIZIO - Nel caso in cui il servizio non sia erogato in digitale, il sito deve permettere la valutazione dell’utilità della scheda di servizio, come per il criterio C.SI.2.5.",
    description:
      "RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [eGovernment Benchmark method paper 2020-2023](https://op.europa.eu/en/publication-detail/-/publication/333fe21f-4372-11ec-89db-01aa75ed71a1).",
  },

  "school-legislation-accessibility-declaration-is-present": {
    greenResult: "Il link è nel footer e invia alla pagina corretta.",
    yellowResult: "",
    redResult:
      "Il link non è nel footer o non invia alla pagina corretta o la pagina non esiste.",
    nonExecuted: "",
    title:
      "C.SC.2.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito della scuola deve esporre la dichiarazione di accessibilità.",
    failureTitle:
      "C.SC.2.2 - DICHIARAZIONE DI ACCESSIBILITÀ - Il sito della scuola deve esporre la dichiarazione di accessibilità.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta alla dichiarazione di accessibilità di AgID, in conformità al modello e alle linee guida rese disponibile da AgID in ottemperanza alla normativa vigente in materia di accessibilità, con livelli di accessibilità contemplati nelle specifiche tecniche WCAG 2.1; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, che riporti a una pagina esistente e che sia quella contenente la dichiarazione di accessibilità (il link deve iniziare con "https://form.agid.gov.it/view/"), ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: AgID Dichiarazione di accessibilità, AgID Linee guida sull’accessibilità degli strumenti informatici, Direttiva UE n. 2102/2016, Legge 9 gennaio 2004 n. 4, Web Content Accessibility Guidelines WCAG 2.1, [Dichiarazione di accessibilità](https://www.agid.gov.it/it/design-servizi/accessibilita/dichiarazione-accessibilita), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "school-ux-ui-consistency-bootstrap-italia-double-check": {
    greenResult:
      "Il sito utilizza la libreria Bootstrap Italia in una versione idonea.",
    yellowResult: "",
    redResult:
      "Il sito non utilizza la libreria Bootstrap Italia o ne utilizza una versione datata.",
    nonExecuted: "",
    title:
      "C.SC.1.2 - LIBRERIA DI ELEMENTI DI INTERFACCIA - Il sito della scuola deve utilizzare la libreria Bootstrap Italia.",
    failureTitle:
      "C.SC.1.2 - LIBRERIA DI ELEMENTI DI INTERFACCIA - Il sito della scuola deve utilizzare la libreria Bootstrap Italia.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito usa la libreria Bootstrap Italia in una versione uguale o superiore alla 1.6; MODALITÀ DI VERIFICA: viene verificata la presenza della libreria Bootstrap Italia e la versione in uso individuando la proprietà CSS --bootstrap-italia-version all’interno del selettore :root o la variabile globale window.BOOTSTRAP_ITALIA_VERSION; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs).",
  },
  "school-controlled-vocabularies": {
    greenResult:
      "Tutti gli argomenti appartengono all’elenco di voci del modello.",
    yellowResult:
      "Almeno il 50% degli argomenti appartengono all'elenco di voci del modello.",
    redResult:
      "Meno del 50% degli argomenti appartengono alle voci del modello.",
    nonExecuted:
      "Non è stato possibile trovare gli argomenti o la pagina che li contiene. Controlla le “Modalità di verifica” per scoprire di più.",
    title:
      "R.SC.1.1 - VOCABOLARI CONTROLLATI - Il sito della scuola deve utilizzare argomenti forniti dal modello di sito scuola.",
    failureTitle:
      "R.SC.1.1 - VOCABOLARI CONTROLLATI - Il sito della scuola deve utilizzare argomenti forniti dal modello di sito scuola.",
    description:
      "CONDIZIONI DI SUCCESSO: gli argomenti utilizzati appartengono alla lista indicata all'interno del documento di architettura dell'informazione del modello scuole alla voce \"Le parole della scuola\"; MODALITÀ DI VERIFICA: gli argomenti identificati all'interno della funzione di ricerca del sito vengono confrontati con l'elenco di voci presente nel documento di architettura dell'informazione, ricercandoli usando specifici attributi \"data-element\" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Elenco degli argomenti del Modello scuole](https://docs.google.com/spreadsheets/d/1MoayTY05SE4ixtgBsfsdngdrFJf_Z2KNvDkMF3tKfc8/edit#gid=2135815526), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "school-legislation-cookie-domain-check": {
    greenResult: "Cookie idoneo.",
    yellowResult: "",
    redResult: "Cookie non idoneo.",
    nonExecuted: "",
    title:
      "C.SC.2.3 - COOKIE - Il sito della scuola deve presentare cookie tecnici in linea con la normativa vigente.",
    failureTitle:
      "C.SC.2.3 - COOKIE - Il sito della scuola deve presentare cookie tecnici in linea con la normativa vigente.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito presenta solo cookie idonei come definito dalla normativa; MODALITÀ DI VERIFICA: viene verificato che il dominio dei cookie identificati sia corrispondente al dominio del sito web; RIFERIMENTI TECNICI E NORMATIVI: [Linee guida cookie e altri strumenti di tracciamento - 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876)",
  },
  "school-ux-ui-consistency-fonts-check": {
    greenResult: "Il sito utilizza tutti i font necessari.",
    yellowResult: "Il sito utilizza il font Titillium Web ma non il font Lora.",
    redResult: "Il sito non utilizza i font del modello.",
    nonExecuted:
      "Non è stato possibile trovare una scheda servizio su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.",
    title:
      "C.SC.1.1 - COERENZA DELL'UTILIZZO DEI FONT (librerie di caratteri) - Il sito della scuola deve utilizzare i font indicati dalla documentazione del modello di sito della scuola.",
    failureTitle:
      "C.SC.1.1 - COERENZA DELL'UTILIZZO DEI FONT (librerie di caratteri) - Il sito della scuola deve utilizzare i font indicati dalla documentazione del modello di sito della scuola.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito utilizza almeno i font Titillium Web e Lora; MODALITÀ DI VERIFICA: ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica, viene verificata la presenza dei font all\'interno di una scheda servizio casualmente selezionata; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "school-menu-structure-match-model": {
    greenResult: "Le voci del menù sono corrette e nell'ordine giusto.",
    yellowResult:
      "L'ordine delle voci del menu è corretto ma sono presenti fino a 3 voci aggiuntive.",
    redResult:
      "Almeno una delle voci obbligatorie è assente o inesatta e/o le voci obbligatorie sono in ordine errato e/o sono presenti 8 o più voci nel menù del sito.",
    nonExecuted: "",
    title:
      "C.SC.1.4 - VOCI DI MENÙ DI PRIMO LIVELLO - Il sito della scuola deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito scolastico.",
    failureTitle:
      "C.SC.1.4 - VOCI DI MENÙ DI PRIMO LIVELLO - Il sito della scuola deve presentare tutte le voci di menù di primo livello, nell'esatto ordine descritto dalla documentazione del modello di sito scolastico.",
    description:
      "CONDIZIONI DI SUCCESSO: le voci del menù di primo livello del sito sono esattamente quelle indicate nel documento di architettura dell'informazione e sono nell'ordine indicato (ovvero Scuola, Servizi, Novità, Didattica); MODALITÀ DI VERIFICA: ricercando uno specifico attributo \"data-element\" come spiegato nella documentazione tecnica, vengono identificate le voci presenti nel menù del sito, il loro ordine e confrontate con quanto indicato nel documento di architettura dell'informazione, applicando una tolleranza di massimo 3 voci aggiuntive; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "school-menu-scuola-second-level-structure-match-model": {
    greenResult:
      "Almeno il 30% delle voci sono corrette e si trovano nell'ordine giusto.",
    yellowResult:
      "Almeno il 30% delle voci sono corrette ma l'ordine è sbagliato.",
    redResult: "Più del 30% delle voci sono errate.",
    nonExecuted: "",
    title:
      "C.SC.1.5 - VOCI DI MENÙ DI SECONDO LIVELLO - Il sito presenta almeno il 30% delle voci di menu di secondo livello in base a quanto descritto dal modello di sito per le scuole.",
    failureTitle:
      "C.SC.1.5 - VOCI DI MENÙ DI SECONDO LIVELLO - Il sito presenta almeno il 30% delle voci di menu di secondo livello in base a quanto descritto dal modello di sito per le scuole.",
    description:
      'CONDIZIONI DI SUCCESSO: le voci del menù di secondo livello corrispondono a quelle indicate nel documento di architettura dell\'informazione del modello scuole e sono nell\'ordine corretto; MODALITÀ DI VERIFICA: ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica, viene verificata la correttezza e l\'ordine delle voci del menù di secondo livello riferite alla voce di primo livello "Scuola"; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "school-legislation-privacy-is-present": {
    greenResult:
      "Il link è nel footer e invia a una pagina esistente e sicura.",
    yellowResult:
      "Il link è nel footer e invia a una pagina esistente ma non sicura.",
    redResult: "Il link non è nel footer o non invia a una pagina esistente.",
    nonExecuted: "",
    title:
      "C.SC.2.1 - INFORMATIVA PRIVACY - Il sito della scuola deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
    failureTitle:
      "C.SC.2.1 - INFORMATIVA PRIVACY - Il sito della scuola deve presentare l'informativa sul trattamento dei dati personali, secondo quanto previsto dalla normativa vigente.",
    description:
      'CONDIZIONI DI SUCCESSO: il sito presenta una voce nel footer che riporta alla privacy policy; MODALITÀ DI VERIFICA: viene verificata la presenza del link nel footer, che riporti a una pagina esistente e con certificato HTTPS valido e attivo, ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: GDPR Artt. 13 e 14, Reg. UE n. 679/2016, [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
  },
  "school-security": {
    greenResult: "Il certificato del sito [url] è attivo e valido.",
    yellowResult: "",
    redResult: "Il certificato del sito [url] non è attivo o valido: ",
    nonExecuted: "",
    title:
      "C.SC.3.1 - CERTIFICATO HTTPS - Il sito della scuola deve avere un certificato https valido e attivo.",
    failureTitle:
      "C.SC.3.1 - CERTIFICATO HTTPS - Il sito della scuola deve avere un certificato https valido e attivo.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito utilizza un certificato https valido e non obsoleto secondo le raccomandazioni AgID; MODALITÀ DI VERIFICA: viene verificato che il certificato https del sito sia valido e attivo; RIFERIMENTI TECNICI E NORMATIVI: [Agid Raccomandazioni in merito allo standard Transport Layer Security (TLS)](https://cert-agid.gov.it/wp-content/uploads/2020/11/AgID-RACCSECTLS-01.pdf).",
  },
  "school-servizi-structure-match-model": {
    greenResult:
      "Tutte le voci obbligatorie sono presenti e nell'ordine corretto.",
    yellowResult:
      "Fino a 2 voci obbligatorie non sono presenti o 1 voce non è nell'ordine corretto.",
    redResult:
      "Più di 2 voci obbligatorie non sono presenti o più di 1 voce non è nell'ordine corretto.",
    nonExecuted:
      "Non è stato possibile trovare una scheda servizio su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.",
    title:
      "R.SC.1.2 - SCHEDE INFORMATIVE DI SERVIZIO - Tutte le schede informative dei servizi devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
    failureTitle:
      "R.SC.1.2 - SCHEDE INFORMATIVE DI SERVIZIO - Tutte le schede informative dei servizi devono mostrare le voci segnalate come obbligatorie all'interno dell'architettura dell'informazione, nell'ordine segnalato dal modello.",
    description:
      "CONDIZIONI DI SUCCESSO: nelle schede informative di servizio le voci indicate come obbligatorie sono presenti e sono nell'ordine corretto; MODALITÀ DI VERIFICA: viene verificato se le voci indicate come obbligatorie all'interno del documento di architettura dell'informazione sono presenti. Inoltre viene verificato se le voci obbligatorie presenti nell'indice della pagina sono nell'ordine corretto. La verifica viene effettuata su una scheda servizio casualmente selezionata, ricercando le voci indicate nella documentazione tecnica tramite specifici attributi \"data-element\"; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs), [Content type: scheda servizio](https://docs.google.com/spreadsheets/d/1MoayTY05SE4ixtgBsfsdngdrFJf_Z2KNvDkMF3tKfc8/edit#gid=0), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).",
  },
  "school-ux-ui-consistency-theme-version-check": {
    greenResult:
      "Il sito utilizza una versione idonea del tema CMS del modello.",
    yellowResult: "Il sito non sembra utilizzare il tema CMS del modello.",
    redResult: "Il sito utilizza una versione datata del tema CMS del modello.",
    nonExecuted:
      'Non è stato possibile condurre il test. Controlla le "Modalità di verifica" per scoprire di più.',
    title:
      "C.SC.1.3 - UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito della scuola, deve utilizzarne la versione più recente disponibile alla data di inizio lavori.",
    failureTitle:
      "C.SC.1.3 - UTILIZZO DI TEMI PER CMS - Nel caso in cui il sito utilizzi un tema messo a disposizione nella documentazione del modello di sito della scuola, deve utilizzarne la versione più recente disponibile alla data di inizio lavori.",
    description:
      'CONDIZIONI DI SUCCESSO: se è in uso il tema CMS del modello scuole, la versione utilizzata è uguale o superiore alla 1.1; MODALITÀ DI VERIFICA: viene verificata la versione indicata nel file style.css, nel caso sia presente la chiave "Text Domain: design_scuole_italia"; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello scuole](https://docs.italia.it/italia/designers-italia/design-scuole-docs).',
  },

  "school-informative-cloud-infrastructure": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "R.SC.2.3 - INFRASTRUTTURE CLOUD - Il sito della scuola deve essere ospitato su infrastrutture qualificate ai sensi della normativa vigente.",
    failureTitle:
      "R.SC.2.3 - INFRASTRUTTURE CLOUD - Il sito della scuola deve essere ospitato su infrastrutture qualificate ai sensi della normativa vigente.",
    description:
      "RIFERIMENTI TECNICI E NORMATIVI: per consentire un'erogazione più sicura, efficiente e scalabile del sito della scuola, può essere utile considerare di impostare l'infrastruttura che lo ospita in cloud, secondo quanto descritto nella [Strategia Cloud Italia](https://cloud.italia.it/strategia-cloud-pa/).",
  },
  "school-informative-cookie-domain-check": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "C.SC.2.3 - COOKIE - Il sito della scuola deve presentare cookie tecnici in linea con la normativa vigente.",
    failureTitle:
      "C.SC.2.3 - COOKIE - Il sito della scuola deve presentare cookie tecnici in linea con la normativa vigente.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito presenta solo cookie idonei come definito dalla normativa; MODALITÀ DI VERIFICA: viene verificato che il dominio dei cookie identificati sia corrispondente al dominio del sito web; RIFERIMENTI TECNICI E NORMATIVI: [Linee guida cookie e altri strumenti di tracciamento - 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876)",
  },
  "school-informative-license-and-attribution": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "R.SC.2.2 - LICENZA E ATTRIBUZIONE - Il sito della scuola deve pubblicare dati, documenti e informazioni con licenza aperta (es. CC-BY 4.0).",
    failureTitle:
      "R.SC.2.2 - LICENZA E ATTRIBUZIONE - Il sito della scuola deve pubblicare dati, documenti e informazioni con licenza aperta (es. CC-BY 4.0).",
    description:
      "RIFERIMENTI TECNICI E NORMATIVI: CAD Art. 52 d.lgs. 82/2005, art. 7, comma 1, D.Lgs. n. 33/2013, d.lgs. n. 36/2006, AgID Linee guida su acquisizione e riuso di software per le pubbliche amministrazioni.",
  },
  "school-informative-reuse": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "R.SC.2.1 - RIUSO - La scuola deve mettere a riuso sotto licenza aperta il software secondo le Linee Guida “acquisizione e riuso di software e riuso di software per le pubbliche amministrazioni“.",
    failureTitle:
      "R.SC.2.1 - RIUSO - La scuola deve mettere a riuso sotto licenza aperta il software secondo le Linee Guida “acquisizione e riuso di software e riuso di software per le pubbliche amministrazioni“.",
    description:
      "RIFERIMENTI TECNICI E NORMATIVI: CAD: Art. 69. (Riuso delle soluzioni e standard aperti), Art. 69. (Riuso delle soluzioni e standard aperti), AgID Linee guida su acquisizione e riuso di software per le pubbliche amministrazioni.",
  },
  "school-informative-security": {
    greenResult: "",
    yellowResult: "",
    redResult: "",
    nonExecuted: "",
    title:
      "C.SC.3.1 - CERTIFICATO HTTPS - Il sito della scuola deve avere un certificato https valido e attivo.",
    failureTitle:
      "C.SC.3.1 - CERTIFICATO HTTPS - Il sito della scuola deve avere un certificato https valido e attivo.",
    description:
      "CONDIZIONI DI SUCCESSO: il sito utilizza un certificato https valido e non obsoleto secondo le raccomandazioni AgID; MODALITÀ DI VERIFICA: viene verificato che il certificato https del sito sia valido e attivo; RIFERIMENTI TECNICI E NORMATIVI: [Agid Raccomandazioni in merito allo standard Transport Layer Security (TLS)](https://cert-agid.gov.it/wp-content/uploads/2020/11/AgID-RACCSECTLS-01.pdf).",
  },
};
