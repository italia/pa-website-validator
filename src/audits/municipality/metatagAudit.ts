"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { loadPageData } from "../../utils/utils";
import {
  getRandomThirdLevelPagesUrl,
  getPrimaryPageUrl,
} from "../../utils/municipality/utils";
import { CheerioAPI } from "cheerio";
import { ValidatorResult } from "jsonschema";
import * as jsonschema from "jsonschema";
import { auditDictionary } from "../../storage/auditDictionary";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";
import { primaryMenuItems } from "../../storage/municipality/menuItems";

const Audit = lighthouse.Audit;

const auditId = "municipality-metatag";
const auditData = auditDictionary[auditId];

const accuracy = process.env["accuracy"] ?? "suggested";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const auditVariables = auditScanVariables[accuracy][auditId];

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

    const titleSubHeadings = ["JSON valido", "Metatag non presenti o errati"];
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
        subItemsHeading: { key: "inspected_page", itemType: "url" },
      },
      {
        key: "title_valid_json",
        itemType: "text",
        text: "",
        subItemsHeading: {
          key: "valid_json",
          itemType: "text",
        },
      },
      {
        key: "title_missing_keys",
        itemType: "text",
        text: "",
        subItemsHeading: {
          key: "missing_keys",
          itemType: "text",
        },
      },
    ];

    const randomServices: string[] = await getRandomThirdLevelPagesUrl(
      url,
      await getPrimaryPageUrl(url, primaryMenuItems.services.data_element),
      `[data-element="${primaryMenuItems.services.third_item_data_element}"]`,
      auditVariables.numberOfServicesToBeScanned
    );

    if (randomServices.length === 0) {
      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: auditData.nonExecuted,
            },
          ]
        ),
      };
    }

    const correctItems = [];
    const toleranceItems = [];
    const wrongItems = [];

    let score = 1;

    for (const randomService of randomServices) {
      const item = {
        inspected_page: randomService,
        valid_json: "No",
        missing_keys: "",
      };

      const $: CheerioAPI = await loadPageData(randomService);
      const metatagElement = $('[data-element="metatag"]');
      const metatagJSON = metatagElement.html() ?? "";

      if (!metatagJSON) {
        return {
          score: 0,
          details: Audit.makeTableDetails(
            [{ key: "result", itemType: "text", text: "Risultato" }],
            [
              {
                result: auditData.nonExecuted,
              },
            ]
          ),
        };
      }

      let parsedMetatagJSON = {};
      try {
        parsedMetatagJSON = JSON.parse(metatagJSON.toString());
      } catch (e) {
        if (score > 0) {
          score = 0;
        }
        wrongItems.push(item);
        continue;
      }

      item.valid_json = "Sì";

      const result: ValidatorResult = jsonschema.validate(
        parsedMetatagJSON,
        metatadaJSONStructure
      );
      if (result.errors.length <= 0) {
        correctItems.push(item);
      } else {
        const missingJSONVoices = await getMissingVoices(result);

        const missingVoicesAmountPercentage = parseInt(
          ((missingJSONVoices.length / totalJSONVoices) * 100).toFixed(0)
        );
        item.missing_keys = missingJSONVoices.join(", ");

        if (missingVoicesAmountPercentage >= 50) {
          if (score > 0) {
            score = 0;
          }
          wrongItems.push(item);
        } else {
          if (score > 0.5) {
            score = 0.5;
          }
          toleranceItems.push(item);
        }
      }
    }

    const results = [];
    switch (score) {
      case 1:
        results.push({
          result: auditData.greenResult,
        });
        break;
      case 0.5:
        results.push({
          result: auditData.yellowResult,
        });
        break;
      case 0:
        results.push({
          result: auditData.redResult,
        });
        break;
    }

    results.push({});

    if (wrongItems.length > 0) {
      results.push({
        result: auditData.subItem.redResult,
        title_valid_json: titleSubHeadings[0],
        title_missing_keys: titleSubHeadings[1],
      });

      for (const item of wrongItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    if (toleranceItems.length > 0) {
      results.push({
        result: auditData.subItem.yellowResult,
        title_valid_json: titleSubHeadings[0],
        title_missing_keys: titleSubHeadings[1],
      });

      for (const item of toleranceItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    if (correctItems.length > 0) {
      results.push({
        result: auditData.subItem.greenResult,
        title_valid_json: titleSubHeadings[0],
        title_missing_keys: titleSubHeadings[1],
      });

      for (const item of correctItems) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }

      results.push({});
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, results),
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
