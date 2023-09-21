"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { loadPageData } from "../../utils/utils";
import { getPages } from "../../utils/municipality/utils";
import { CheerioAPI } from "cheerio";
import { ValidatorResult } from "jsonschema";
import * as jsonschema from "jsonschema";
import { auditDictionary } from "../../storage/auditDictionary";
import { auditScanVariables } from "../../storage/municipality/auditScanVariables";
import {
  errorHandling,
  notExecutedErrorMessage,
} from "../../config/commonAuditsParts";
import { DataElementError } from "../../utils/DataElementError";

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
  ): Promise<LH.Audit.ProductBase> {
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

    let pagesToBeAnalyzed = [];
    try {
      pagesToBeAnalyzed = await getPages(url, [
        {
          type: "services",
          numberOfPages: auditVariables.numberOfServicesToBeScanned,
        },
      ]);
    } catch (ex) {
      if (!(ex instanceof DataElementError)) {
        throw ex;
      }

      return {
        score: 0,
        details: Audit.makeTableDetails(
          [{ key: "result", itemType: "text", text: "Risultato" }],
          [
            {
              result: notExecutedErrorMessage.replace("<LIST>", ex.message),
            },
          ]
        ),
      };
    }

    const correctItems = [];
    const toleranceItems = [];
    const wrongItems = [];

    let score = 1;

    const pagesInError = [];
    let $: CheerioAPI = await loadPageData(url);

    for (const pageToBeAnalyzed of pagesToBeAnalyzed) {
      const item = {
        inspected_page: pageToBeAnalyzed,
        valid_json: "No",
        missing_keys: "",
      };

      try {
        $ = await loadPageData(pageToBeAnalyzed);
      } catch (ex) {
        if (!(ex instanceof Error)) {
          throw ex;
        }

        let errorMessage = ex.message;
        errorMessage = errorMessage.substring(
          errorMessage.indexOf('"') + 1,
          errorMessage.lastIndexOf('"')
        );

        pagesInError.push({
          inspected_page: pageToBeAnalyzed,
          in_index: errorMessage,
        });
        continue;
      }
      const metatagElement = $('[data-element="metatag"]');
      const metatagJSON = metatagElement.html() ?? "";

      if (!metatagJSON) {
        return {
          score: 0,
          details: Audit.makeTableDetails(
            [{ key: "result", itemType: "text", text: "Risultato" }],
            [
              {
                result: notExecutedErrorMessage.replace("<LIST>", "`metatag"),
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
    if (pagesInError.length > 0) {
      results.push({
        result: errorHandling.errorMessage,
      });

      results.push({});

      results.push({
        result: errorHandling.errorColumnTitles[0],
        title_valid_json: errorHandling.errorColumnTitles[1],
        title_missing_keys: "",
      });

      for (const item of pagesInError) {
        results.push({
          subItems: {
            type: "subitems",
            items: [item],
          },
        });
      }
    } else {
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
      errorMessage: pagesInError.length > 0 ? errorHandling.popupMessage : "",
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
        audienceType: { type: "string", minLength: 1 },
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
