#!/usr/bin/env node

import { run, logLevels } from "./controller/launchLighthouse.js";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const parser = yargs(hideBin(process.argv))
  .usage(
    "Usage: --type <type> --destination <folder> --report <report_name> --website <url> --scope <scope>"
  )
  .option("type", {
    describe: "Crawler to run",
    type: "string",
    demandOption: true,
    choices: ["municipality", "school"],
  })
  .option("destination", {
    describe: "Path where to save the report",
    type: "string",
    demandOption: true,
  })
  .option("report", {
    describe: "Name of the result report",
    type: "string",
    demandOption: true,
  })
  .option("website", {
    describe: "Website where to run the crawler",
    type: "string",
    demandOption: true,
  })
  .option("scope", {
    describe: "Execution scope",
    type: "string",
    demandOption: true,
    default: "online",
    choices: ["local", "online"],
  })
  .option("view", {
    describe: "View report after scan",
    type: "string",
    demandOption: false,
  })
  .option("accuracy", {
    describe:
      "Indicates the precision with which scanning is done: the greater the precision the greater the number of pages scanned",
    type: "string",
    demandOption: true,
    default: "suggested",
    choices: ["min", "suggested", "max"],
  });

try {
  const args = await parser.argv;

  if (!existsSync(args.destination)) {
    console.log("[WARNING] Directory does not exist..");
    await mkdir(args.destination, { recursive: true });
    console.log("[INFO] Directory created at: " + args.destination);
  }

  process.env["accuracy"] = args.accuracy;

  const result = await run(
    args.website,
    args.type,
    args.scope,
    logLevels.display_info,
    true,
    args.destination,
    args.report,
    "view" in args
  );

  console.log("[INFO] Status result:", result.status);
  console.log("[INFO] HTML report file:", result.data.htmlResultPath);
  console.log("[INFO] JSON report file:", result.data.jsonResultPath);
} catch (e) {
  console.error(e);
  process.exit(1);
}
