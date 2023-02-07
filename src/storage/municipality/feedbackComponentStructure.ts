export const feedbackComponentStructure = {
  component: {
    dataElement: "feedback",
    error: "Componente non trovato",
  },
  title: {
    dataElement: "feedback-title",
    text: "Quanto sono chiare le informazioni su questa pagina?",
    error: "Titolo non trovato o errato",
  },
  rate: {
    dataElement: "feedback-rate-",
    positiveThreshold: 3,
    numberOfComponents: 5,
    error: "Rating input non trovato o presente in un numero errato",
    errorAssociation:
      "Le domande di rating non sono associate al valore del rate",
  },
  positive_rating: {
    dataElement: "feedback-rating-positive",
    question: {
      dataElement: "feedback-rating-question",
      text: "Quali sono stati gli aspetti che hai preferito?",
      error: "Domanda rating positivo non trovata o errata",
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
      error: "Risposte rating positivo non trovate, errate o mancanti",
    },
    error: "Componente rating positivo non trovato",
  },
  negative_rating: {
    dataElement: "feedback-rating-negative",
    question: {
      dataElement: "feedback-rating-question",
      text: "Dove hai incontrato le maggiori difficoltà?",
      error: "Domanda rating positivo non trovata o errata",
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
      error: "Risposte rating negativo non trovate, errate o mancanti",
    },
    error: "Componente rating negativo non trovato",
  },
  input_text: {
    dataElement: "feedback-input-text",
    error: "Casella di testo mancante",
  },
};
