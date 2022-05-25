#!/usr/bin/env node

import { run, logLevels } from "./controller/launchLighthouse"
import * as fs from "fs"
import yargs from "yargs"

const crawelerCommand = yargs
    .usage("Usage: --type <type> --destination <folder> --report <report_name> --website <url> --scope <scope>")
    .option("type", { describe: "Crawler to run", type: "string", demandOption: true , choices: ['municipality', 'school']})
    .option("destination", { describe: "Path where to save the report", type: "string", demandOption: true })
    .option("report", { describe: "Name of the result report", type: "string", demandOption: true })
    .option("website", { describe: "Website where to run the crawler", type: "string", demandOption: true })
    .option("scope", { describe: "Execution scope", type: "string", demandOption: true , default: "online", choices: ['local', 'online']})
    .parseSync();

if (!fs.existsSync(crawelerCommand.destination)){
    console.log("[WARNING] Directory does not exist..")
    fs.mkdirSync(crawelerCommand.destination, {recursive: true})
    console.log("[INFO] Directory created at: " + crawelerCommand.destination)
}

Promise.resolve(run(crawelerCommand.website, crawelerCommand.type, crawelerCommand.scope, crawelerCommand.destination, crawelerCommand.report, logLevels.display_info)).then((result) => {
    console.log('[INFO] Status result:', result.status)
    console.log('[INFO] HTML report file:', result.data.htmlResultPath)
    console.log('[INFO] JSON report file:', result.data.jsonResultPath)
})