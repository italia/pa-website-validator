#!/usr/bin/env node

const yargs = require("yargs")
const { spawn } = require('child_process')
const fs = require("fs")

const crawelerCommand = yargs
    .usage("Usage: --type <type> --destination <folder> --report <report_name> --website <url> --scope <scope> --view <view>")
    .option("type", { describe: "Crawler to run", type: "string", demandOption: true , choices: ['municipality', 'school']})
    .option("destination", { describe: "Path where to save the report", type: "string", demandOption: true })
    .option("report", { describe: "Name of the result report", type: "string", demandOption: true })
    .option("website", { describe: "Website where to run the crawler", type: "string", demandOption: true })
    .option("scope", { describe: "Execution scope", type: "string", demandOption: true , default: "online", choices: ['local', 'online', 'local-information-architecture', 'online-information-architecture']})
    .option("view", { describe: "Autolaunch reports in browser", type: "string", demandOption: true , default: "no", choices: ['yes', 'no']})
    .argv;

let configPath = __dirname + `/config/${crawelerCommand.type}/auditConfig-${crawelerCommand.scope}.js`

console.log('[INFO] Loaded config: ' + configPath)

fs.access(crawelerCommand.destination, function(error) {
    if (error) {
        console.log("[WARNING] Directory does not exist..")
        fs.mkdirSync(crawelerCommand.destination)
        console.log("[INFO] Directory created at: " + crawelerCommand.destination)
    }
})

savePath = crawelerCommand.destination + '/' + crawelerCommand.report

const view = crawelerCommand.view === 'yes' ? '--view' : ''
console.log('[INFO] Try to execute: ' + `node ${__dirname}/node_modules/lighthouse/lighthouse-cli/index.js --config-path=${configPath} --chrome-flags="--headless" --output json --output html --output-path ${savePath} ${crawelerCommand.website} ${view}`)
const child = spawn(`node ${__dirname}/node_modules/lighthouse/lighthouse-cli/index.js --config-path=${configPath} --chrome-flags="--headless" --output json --output html --output-path ${savePath} ${crawelerCommand.website} ${view}`, {
    shell: true
});

child.stderr.on('data', (data) => {
    process.stdout.write('[INFO]: ' + data);
});

child.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
});