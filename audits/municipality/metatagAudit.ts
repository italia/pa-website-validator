"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import {
  getRandomMunicipalityServiceUrl,
  loadPageData,
} from "../../utils/utils";
import { CheerioAPI } from "cheerio";
import { ValidatorResult } from "jsonschema";
import * as jsonschema from "jsonschema";

const Audit = lighthouse.Audit;

const greenResult = "Tutti i metatag richiesti sono presenti e corretti.";
const yellowResult =
  "Almeno il 50% dei metatag richiesti sono presenti e corretti.";
const redResult =
  "Meno del 50% dei metatag richiesti sono presenti e corretti.";
const notExecuted =
  "Non è stato possibile trovare una scheda servizio su cui condurre il test. Controlla le “Modalità di verifica” per scoprire di più.";
const totalJSONVoices = 10;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-metatag",
      title:
        "R.SI.1.1 - METATAG - Nel sito comunale, le voci della scheda servizio devono presentare i metatag descritti dal modello, in base agli standard internazionali.",
      failureTitle:
        "R.SI.1.1 - METATAG - Nel sito comunale, le voci della scheda servizio devono presentare i metatag descritti dal modello, in base agli standard internazionali.",
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      description:
        'CONDIZIONI DI SUCCESSO: le voci delle schede servizio presentano tutti i metatag richiesti dal modello; MODALITÀ DI VERIFICA: viene verificata la presenza e correttezza dei metatag indicati nella sezione "Dati strutturati e interoperabilità" della documentazione in una scheda servizio selezionata casualmente, ricercando uno specifico attributo "data-element" come spiegato nella documentazione tecnica; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/), [Schema](http://www.schema.org/), [Documentazione tecnica](https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/).',
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;
    let score = 0;

    const headings = [
      { key: "result", itemType: "text", text: "Risultato" },
      {
        key: "inspected_page",
        itemType: "text",
        text: "Scheda servizio ispezionata",
      },
      {
        key: "missing_keys",
        itemType: "text",
        text: "Metatag non presenti o errati",
      },
    ];

    const item = [
      {
        result: redResult,
        inspected_page: "",
        missing_keys: "",
      },
    ];

    const randomServiceToBeScanned: string =
      await getRandomMunicipalityServiceUrl(url);

    if (!randomServiceToBeScanned) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: notExecuted,
            },
          ]
        ),
      };
    }

    item[0].inspected_page = randomServiceToBeScanned;
    const $: CheerioAPI = await loadPageData(randomServiceToBeScanned);
    const metatagElement = $('[data-element="metatag"]');
    const metatagJSON = metatagElement.html() ?? "";

    if (!metatagJSON) {
      return {
        score: 0,
        details: Audit.makeTableDetails(headings, item),
      };
    }

    let parsedMetatagJSON = {};
    try {
      parsedMetatagJSON = JSON.parse(metatagJSON.toString());
    } catch (e) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: notExecuted + " JSON non valido.",
            },
          ]
        ),
      };
    }

    const result: ValidatorResult = jsonschema.validate(
      parsedMetatagJSON,
      metatadaJSONStructure
    );
    if (result.errors.length <= 0) {
      score = 1;
      item[0].result = greenResult;
    } else {
      const missingJSONVoices = await getMissingVoices(result);

      const missingVoicesAmountPercentage = parseInt(
        ((missingJSONVoices.length / totalJSONVoices) * 100).toFixed(0)
      );

      if (missingVoicesAmountPercentage >= 50) {
        score = 0;
        item[0].result = redResult;
      } else {
        score = 0.5;
        item[0].result = yellowResult;
      }

      item[0].missing_keys = missingJSONVoices.join(", ");
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, item),
    };
  }
}

module.exports = LoadAudit;

const metatadaJSONStructure = {
  type: "object",

  properties: {
    name: { type: "string", minLength: 1 },
    serviceType: { type: "string", minLength: 1 },
    serviceOperator: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
      },

      required: ["name"],
    },
    areaServed: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
      },

      required: ["name"],
    },
    audience: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
      },

      required: ["name"],
    },
    availableChannel: {
      type: "object",
      properties: {
        serviceUrl: { type: "string", minLength: 1 },
        serviceLocation: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1 },
            address: {
              type: "object",
              properties: {
                streetAddress: { type: "string", minLength: 1 },
                postalCode: { type: "string", minLength: 1 },
                addressLocality: { type: "string", minLength: 1 },
              },

              required: ["streetAddress", "postalCode", "addressLocality"],
            },
          },

          required: ["name", "address"],
        },
      },

      required: ["serviceUrl", "serviceLocation"],
    },
  },

  required: [
    "name",
    "serviceType",
    "serviceOperator",
    "areaServed",
    "audience",
    "availableChannel",
  ],
};

const getMissingVoices = async (result: ValidatorResult) => {
  let voices: string[] = [];

  for (const error of result.errors) {
    voices.push(error.property + "." + error.argument);

    if (error.argument === "availableChannel") {
      voices.splice(-1);
      voices = [
        ...voices,
        ...[
          "instance.availableChannel.serviceUrl",
          "instance.availableChannel.serviceLocation.name",
          "instance.availableChannel.serviceLocation.address.streetAddress",
          "instance.availableChannel.serviceLocation.address.postalCode",
          "instance.availableChannel.serviceLocation.address.addressLocality",
        ],
      ];
    } else if (error.argument === "serviceLocation") {
      voices.splice(-1);
      voices = [
        ...voices,
        ...[
          "instance.availableChannel.serviceLocation.name",
          "instance.availableChannel.serviceLocation.address.streetAddress",
          "instance.availableChannel.serviceLocation.address.postalCode",
          "instance.availableChannel.serviceLocation.address.addressLocality",
        ],
      ];
    } else if (error.argument === "address") {
      voices.splice(-1);
      voices = [
        ...voices,
        ...[
          "instance.availableChannel.serviceLocation.address.streetAdress",
          "instance.availableChannel.serviceLocation.address.postalCode",
          "instance.availableChannel.serviceLocation.address.addressLocality",
        ],
      ];
    }
  }

  return voices.map(function (x) {
    return x.replace("instance.", "").replace(/[0-9]/g, "").slice(0, -1);
  });
};
