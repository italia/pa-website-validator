export const feedbackComponentStructure = {
  component: {
    dataElement: "feedback",
    missingError: "Componente non trovato",
  },
  title: {
    dataElement: "feedback-title",
    text: "Quanto sono chiare le informazioni su questa pagina?",
    missingError: "Titolo non trovato",
    error: "Titolo errato",
  },
  rate: {
    dataElement: "feedback-rate-",
    positiveThreshold: 3,
    numberOfComponents: 5,
    missingError: "Rating inputs non trovati",
    error: "Rating inputs presenti in un numero errato",
    errorAssociation:
      "Le domande di rating non sono associate al valore del rate inputs",
  },
  positive_rating: {
    dataElement: "feedback-rating-positive",
    question: {
      dataElement: "feedback-rating-question",
      text: "Quali sono stati gli aspetti che hai preferito?",
      missingError: "Domanda rating positivo non trovata",
      error: "Domanda rating positivo errata",
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
      missingError: "Risposte rating positivo non trovate",
      error: "Risposte rating positivo non corrette",
    },
    missingError: "Componente rating positivo non trovato",
  },
  negative_rating: {
    dataElement: "feedback-rating-negative",
    question: {
      dataElement: "feedback-rating-question",
      text: "Dove hai incontrato le maggiori difficoltà?",
      missingError: "Domanda rating negativo non trovata",
      error: "Domanda rating negativo errata",
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
      missingError: "Risposte rating negativo non trovate",
      error: "Risposte rating negativo non corrette",
    },
    missingError: "Componente rating negativo non trovato",
  },
  input_text: {
    dataElement: "feedback-input-text",
    missingError: "Casella di testo mancante",
  },
};
