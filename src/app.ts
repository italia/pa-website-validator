import dateFormat from "dateformat";
import inquirer from "inquirer";
import { homedir } from "os";

// This module needs to be imported before importing Puppeteer
import "./setPuppeteerCacheDir.js";

import { run, logLevels } from "./controller/launchLighthouse.js";

const type = process.argv[2];

const typeIT = type === "school" ? "scuola" : "comune";

const urlSchoolMsg =
  "Inserisci la URL della pagina principale (homepage) del sito web della scuola includendo il protocollo (http:// o https://):";
const urlMunicipalityMsg =
  "Inserisci la URL della pagina principale (homepage) del sito web del Comune includendo il protocollo (http:// o https://):";

const version = "2.8.3"; // x-release-please-version

console.log();
console.log();

try {
  const { url }: { url: string } = await inquirer.prompt([
    {
      message: type === "school" ? urlSchoolMsg : urlMunicipalityMsg,
      name: "url",
      validate: (input: string) =>
        input.match(/https?:\/\//) ? true : "URL non valido",
    },
  ]);

  console.log();

  const { scope }: { scope: "local" | "online" } = await inquirer.prompt([
    {
      message:
        "In quale ambiente si trova il sito su cui vuoi condurre l'analisi?",
      name: "scope",
      type: "list",
      choices: [
        {
          name: `Ambiente di produzione (sito online e pubblico, es. di URL: https://${typeIT}.it)`,
          value: "online",
        },
        {
          name: "Ambiente locale (sito in fase di sviluppo, es. di URL: http://localhost:8080)",
          value: "local",
        },
      ],
    },
  ]);

  console.log();

  const { accuracy }: { accuracy: "all" | "custom" | "suggested" } =
    await inquirer.prompt([
      {
        message: "Seleziona quanto vuoi che sia accurata l'analisi:",
        name: "accuracy",
        type: "list",
        choices: [
          {
            name: "Approfondita (richiede più tempo)",
            value: "all",
          },
          {
            name: "Personalizzata (permette di selezionare quante schede servizio analizzare)",
            value: "custom",
          },
          {
            name: "Veloce (analizza un numero inferiore di pagine per ogni tipo)",
            value: "suggested",
          },
        ],
      },
    ]);

  const { numberOfServicePages }: { numberOfServicePages?: number } =
    await inquirer.prompt([
      {
        message: "Indica il numero di schede servizio da analizzare:",
        name: "numberOfServicePages",
        type: "number",
        when: () => accuracy === "custom",
      },
    ]);

  console.log();
  const currentDate = new Date();
  const hostname = new URL(url).hostname;
  const dest = homedir();
  await run(
    url,
    type,
    scope,
    logLevels.display_info,
    true,
    dest,
    `report-${hostname}-${dateFormat(
      currentDate,
      "UTC:yyyymmdd'T'HHMMss'Z'"
    )}-v${version}`,
    true,
    accuracy === "custom" ? "all" : accuracy,
    undefined,
    numberOfServicePages
  );

  console.log();
  console.log();
  console.log(
    "[--L'analisi è terminata. Il report si aprirà automaticamente nel tuo browser--]"
  );
  console.log(
    `Se non dovesse aprirsi, una copia HTML e JSON del report è stata salvata nella cartella ${dest}}`
  );
} catch (e) {
  console.error(e);
  process.exit(1);
}
