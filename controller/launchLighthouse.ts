"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import lighthouse from "lighthouse";

import * as fs from "fs";
import open from "open";
import puppeteer from "puppeteer";

import schoolOnlineConfig from "../config/school/auditConfig-online.js";
import schoolLocalConfig from "../config/school/auditConfig-local.js";
import municipalityOnlineConfig from "../config/municipality/auditConfig-online.js";
import municipalityLocalConfig from "../config/municipality/auditConfig-local.js";

import { RunnerResult } from "lighthouse/types/externs";

export const logLevels = {
  display_none: "silent",
  display_error: "error",
  display_info: "info",
  display_verbose: "verbose",
};

const run = async (
  website: string,
  type: string,
  scope: string,
  logLevel: string = logLevels.display_none,
  saveFile = true,
  destination: string,
  reportName: string,
  view = false
) => {
  //L'oggetto chrome non è incluso nel try-catch in modo tale che la sua istanza venga killata anche in caso di eccezione lanciata da altri processi
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
  });

  try {
    let loadConfig;
    if (type === "school" && scope === "local") {
      loadConfig = schoolLocalConfig;
    } else if (type === "school" && scope === "online") {
      loadConfig = schoolOnlineConfig;
    } else if (type === "municipality" && scope === "local") {
      loadConfig = municipalityLocalConfig;
    } else if (type === "municipality" && scope === "online") {
      loadConfig = municipalityOnlineConfig;
    } else {
      throw new Error("Wrong type or scope passe - No config to load");
    }

    const options = {
      logLevel: logLevel,
      output: ["html", "json"],
      port: new URL(browser.wsEndpoint()).port,
      locale: "it",
    };
    const runnerResult: RunnerResult = await lighthouse(
      website,
      options,
      loadConfig
    );

    if (runnerResult.report.length != 2) {
      throw new Error("Missing JSON or HTML report");
    }

    const reportHtml: string = runnerResult.report[0];
    const reportJSON: string = runnerResult.report[1];

    await browser.close();

    if (!saveFile) {
      return {
        status: true,
        data: {
          htmlReport: reportHtml,
          jsonReport: reportJSON,
        },
      };
    }

    if (!fs.existsSync(destination)) {
      console.log("[WARNING] Directory does not exist..");
      fs.mkdirSync(destination, { recursive: true });
      console.log("[INFO] Directory created at: " + destination);
    }

    const htmlPath: string = destination + "/" + reportName + ".html";
    const jsonPath: string = destination + "/" + reportName + ".json";
    fs.writeFileSync(htmlPath, reportHtml);
    fs.writeFileSync(jsonPath, reportJSON);

    if (view) {
      await open(htmlPath);
    }

    return {
      status: true,
      data: {
        htmlResultPath: htmlPath,
        jsonResultPath: jsonPath,
      },
    };
  } catch (ex) {
    await browser.close();

    console.log("Launch lighthouse exception: ", ex);

    return {
      status: false,
      data: {
        exception: ex,
      },
    };
  }
};

export { run };
