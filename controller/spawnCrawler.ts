import { spawn } from "child_process"

// @ts-ignore
import * as fs from "fs"

const run = async (website: string, type: string, scope: string, destination: string, reportName: string) => {
    let configPath = __dirname + `/config/${type}/auditConfig-${scope}.js`

    fs.access(destination, function(error) {
        if (error) {
            console.log("[WARNING] Directory does not exist..")
            fs.mkdirSync(destination, { recursive: true })
            console.log("[INFO] Directory created at: " + destination)
        }
    })

    const savePath = destination + '/' + reportName

    return spawn(`node ${__dirname}/node_modules/lighthouse/lighthouse-cli/index.js --locale it --config-path=${configPath} --chrome-flags="--headless" --output json --output html --output-path ${savePath} ${website} `, {
        shell: true
    })
}

export { run }