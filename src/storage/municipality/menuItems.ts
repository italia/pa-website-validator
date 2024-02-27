export const primaryMenuItems = {
  management: {
    label: "AMMINISTRAZIONE",
    name: "Amministrazione",
    regExp: /^Amministrazione$/i,
    data_element: "management",
    secondary_item_data_element: ["management-category-link"],
    dictionary: [
      "aree amministrative",
      "documenti e dati",
      "enti e fondazioni",
      "organi di governo",
      "personale amministrativo",
      "politici",
      "uffici",
    ],
  },
  news: {
    label: "NOVITÀ",
    name: "Novità",
    regExp: /^Novità$/i,
    data_element: "news",
    secondary_item_data_element: ["news-category-link"],
    dictionary: ["avvisi", "comunicati", "notizie"],
  },
  services: {
    label: "SERVIZI",
    name: "Servizi",
    regExp: /^Servizi$/i,
    data_element: "all-services",
    secondary_item_data_element: ["service-category-link"],
    third_item_data_element: "service-link",
    dictionary: [
      "educazione e formazione",
      "salute, benessere e assistenza",
      "vita lavorativa",
      "mobilità e trasporti",
      "catasto e urbanistica",
      "anagrafe e stato civile",
      "turismo",
      "giustizia e sicurezza pubblica",
      "tributi, finanze e contravvenzioni",
      "cultura e tempo libero",
      "ambiente",
      "imprese e commercio",
      "autorizzazioni",
      "appalti pubblici",
      "agricoltura e pesca",
      "agricoltura, caccia e pesca",
    ],
  },
  live: {
    label: "VIVERE IL COMUNE",
    name: "Vivere [nome del Comune]",
    regExp: /^Vivere /i,
    data_element: "live",
    secondary_item_data_element: [
      //don't change the order
      "live-button-locations",
      "live-button-events",
    ],
    third_item_data_element: "event-link",
    dictionary: ["luoghi", "eventi"],
  },
};

export const customPrimaryMenuItemsDataElement = "custom-submenu";
export const customSecondaryMenuItemsDataElement = "custom-category-link";
