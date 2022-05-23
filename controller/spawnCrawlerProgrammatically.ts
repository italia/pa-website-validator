import * as fs from "fs"
import * as chromeLauncher from "chrome-launcher"

//@ts-ignore
import lighthouse from "lighthouse"

const run = async (website: string, type: string, scope: string, destination: string, reportName: string) => {
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']})
    const options = {logLevel: 'info', output: 'html', port: chrome.port}
    const runnerResult = await lighthouse(website, options)

    const reportHtml = runnerResult.report

    fs.access(destination, function (error) {
        if (error) {
            console.log("[WARNING] Directory does not exist..")
            fs.mkdirSync(destination, {recursive: true})
            console.log("[INFO] Directory created at: " + destination)
        }
    })

    fs.writeFileSync(destination + '/' + reportName, reportHtml)

    await chrome.kill()
}

export { run }