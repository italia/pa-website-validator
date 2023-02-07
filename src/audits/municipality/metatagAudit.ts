"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { loadPageData } from "../../utils/utils";
import {
  getRandomThirdLevelPagesUrl,
  getServicePageUrl,
} from "../../utils/municipality/utils";
import { CheerioAPI } from "cheerio";
import { ValidatorResult } from "jsonschema";
import * as jsonschema from "jsonschema";
import { auditDictionary } from "../../storage/auditDictionary";

const Audit = lighthouse.Audit;

const auditId = "municipality-metatag";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const yellowResult = auditData.yellowResult;
const redResult = auditData.redResult;
const notExecuted = auditData.nonExecuted;

const totalJSONVoices = 10;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
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

    const randomServices: string[] = await getRandomThirdLevelPagesUrl(
      url,
      await getServicePageUrl(url),
      '[data-element="service-link"]'
    );

    if (randomServices.length === 0) {
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

    const randomServiceToBeScanned: string = randomServices[0];

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
              result: notExecuted,
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
    return x.replace("instance.", "").replace(/[0-9]/g, "");
  });
};
