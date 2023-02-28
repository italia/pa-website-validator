export const feedbackComponentStructure = {
  component: {
    dataElement: "feedback",
    missingError: "Componenete di valutazione non trovato",
  },
  title: {
    dataElement: "feedback-title",
    text: "Quanto sono chiare le informazioni su questa pagina?",
    missingError: "Domanda iniziale non trovata",
    error: "Domanda iniziale errata",
  },
  rate: {
    dataElement: "feedback-rate-",
    positiveThreshold: 3,
    numberOfComponents: 5,
    missingError: "Scala di valutazione non trovata",
    error: "Scala di valutazione errata",
    errorAssociation:
      "Le domande di follow up non sono associate ai valori corretti",
  },
  positive_rating: {
    dataElement: "feedback-rating-positive",
    question: {
      dataElement: "feedback-rating-question",
      text: "Quali sono stati gli aspetti che hai preferito?",
      missingError: "Domanda positiva di follow up non trovata",
      error: "Domanda positiva di follow up errata",
    },
    answers: {
      dataElement: "feedback-rating-answer",
      texts: [
        "Le indicazioni erano chiare",
        "Le indicazioni erano complete",
        "Capivo sempre che stavo procedendo correttamente",
        "Non ho avuto problemi tecnici",
        "Altro",
      ],
      missingError:
        "Le risposte alla domanda positiva di follow up non sono state trovate",
      error:
        "Le risposte alla domanda positiva di follow up sono errate o mancanti",
    },
    missingError:
      "Il componente che contiene la domanda positiva di follow up e le risposte non è stato trovato",
  },
  negative_rating: {
    dataElement: "feedback-rating-negative",
    question: {
      dataElement: "feedback-rating-question",
      text: "Dove hai incontrato le maggiori difficoltà?",
      missingError: "Domanda negativa di follow up non trovata",
      error: "Domanda negativa di follow up errata",
    },
    answers: {
      dataElement: "feedback-rating-answer",
      texts: [
        "A volte le indicazioni non erano chiare",
        "A volte le indicazioni non erano complete",
        "A volte non capivo se stavo procedendo correttamente",
        "Ho avuto problemi tecnici",
        "Altro",
      ],
      missingError:
        "Le risposte alla domanda negativa di follow up non sono state trovate",
      error:
        "Le risposte alla domanda negativa di follow up sono errate o mancanti",
    },
    missingError:
      "Il componente che contiene la domanda negativa di follow up e le risposte non è stato trovato",
  },
  input_text: {
    dataElement: "feedback-input-text",
    missingError: "Campo di testo libero mancante",
  },
};
