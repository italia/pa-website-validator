import dateFormat from "dateformat";
import inquirer from "inquirer";
import { homedir } from "os";

import { run, logLevels } from "./controller/launchLighthouse.js";

const type = process.argv[2];

const typeIT = type === "school" ? "scuola" : "comune";

const urlSchoolMsg =
  "Inserisci la URL della pagina principale (homepage) del sito web della scuola includendo il protocollo (http:// o https://):";
const urlMunicipalityMsg =
  "Inserisci la URL della pagina principale (homepage) del sito web del Comune includendo il protocollo (http:// o https://):";

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
          name: "Ambiente locale (sito in fase di sviluppo, es. di URL: http://localhost:8080)",
          value: "local",
        },
        {
          name: `Ambiente di produzione (sito online e pubblico, es. di URL: https://${typeIT}.it)`,
          value: "online",
        },
      ],
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
    `report-${hostname}-${dateFormat(currentDate, "UTC:yyyymmdd'T'HHMMss'Z'")}`,
    true
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
