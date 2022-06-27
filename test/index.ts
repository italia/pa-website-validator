#!/usr/bin/env node

import { promises } from "fs";
import Papa from "papaparse";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { logLevels, run } from "../controller/launchLighthouse.js";

const parser = yargs(hideBin(process.argv))
  .usage("Usage: $0 --type <type> --expected <file>")
  .option("type", {
    choices: ["municipality", "school"],
    demandOption: true,
    describe: "Type of audits",
    type: "string",
  })
  .option("expected", {
    demandOption: true,
    describe: "Path to file containing expected outputs",
    type: "string",
  });

try {
  const args = await parser.argv;
  const fileContent = await promises.readFile(args.expected, {
    encoding: "utf8",
  });
  const expected = Papa.parse<Record<string, string> & { URL: string }>(
    fileContent,
    { header: true }
  );

  for await (const line of expected.data) {
    const url = line.URL;
    console.log(url);

    const output = await run(
      url,
      args.type,
      "online",
      logLevels.display_none,
      false,
      "",
      ""
    );
    const jsonReport = output.data.jsonReport;
    if (!jsonReport) {
      throw new Error("No JSON report");
    }
    const report = JSON.parse(output.data.jsonReport);
    for (const key in line) {
      if (key !== "URL") {
        const score = report.audits[key].score;
        const expected = Number(line[key]);

        if (expected === score) {
          console.log(`${key}: PASSED`);
        } else {
          console.log(`${key}: FAILED (expected ${expected}, got ${score})`);
        }
      }
    }
  }
} catch (e) {
  console.error(e);
  process.exit(1);
}
