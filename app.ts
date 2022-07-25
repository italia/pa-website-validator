import inquirer from "inquirer";

import { run, logLevels } from "./controller/launchLighthouse.js";

const type = process.argv[2];

try {
  const { url, scope }: { url: string; scope: "local" | "online" } =
    await inquirer.prompt([
      {
        message: "URL da scansionare?",
        name: "url",
        validate: (input: string) =>
          input.match(/https?:\/\//) ? true : "URL non valido",
      },
      {
        message: "In quale ambiente stai convalidando il tuo sito?",
        name: "scope",
        type: "list",
        choices: [
          {
            name: "Ambiente locale (es. http://localhost:8080)",
            value: "local",
          },
          {
            name: "Ambiente di produzione (es. https://example.com)",
            value: "online",
          },
        ],
      },
    ]);

  const result = await run(
    url,
    type,
    scope,
    logLevels.display_info,
    true,
    process.cwd(),
    "report",
    true
  );

  console.log("[INFO] Status result:", result.status);
  console.log("[INFO] HTML report file:", result.data.htmlResultPath);
  console.log("[INFO] JSON report file:", result.data.jsonResultPath);
} catch (e) {
  console.error(e);
  process.exit(1);
}
