export const primaryMenuItems = {
  management: {
    name: "Amministrazione",
    regExp: /^Amministrazione$/i,
    data_element: "management",
    secondary_item_data_element: "management-category-link",
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
    name: "Novità",
    regExp: /^Novità$/i,
    data_element: "news",
    secondary_item_data_element: "news-category-link",
    dictionary: ["avviso", "comunicato stampa", "news"],
  },
  services: {
    name: "Servizi",
    regExp: /^Servizi$/i,
    data_element: "all-services",
    secondary_item_data_element: "service-category-link",
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
    ],
  },
  live: {
    name: "Vivere [nome del Comune]",
    regExp: /^Vivere /i,
    data_element: "live",
    secondary_item_data_element: "live-category-link",
    dictionary: [""],
  },
};

export const secondaryMenuItems = {};

export const customPrimaryMenuItemsDataElement = "custom-submenu-";
export const customSecondaryMenuItemsDataElement = "custom-category-link";
