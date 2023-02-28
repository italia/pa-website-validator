import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { logLevels, run } from "../dist/controller/launchLighthouse.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

type ExpectedLocalEntry = [
  string,
  [number, number, number, number, number, number, number, number, number]
];

const expectedLocal: Array<ExpectedLocalEntry> = [
  [
    "272423cfaecf27dd4848e1c5543b6dc380e97430",
    [1, 1, 0.5, 1, 0.5, 0, 0, 1, 0.5],
  ],
];

type ExpectedOnlineEntry = [
  string,
  [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ]
];

const expectedOnline: Array<ExpectedOnlineEntry> = [
  ["https://www.ismonnet.edu.it", [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1]],
];

const localAudits = [
  "school-ux-ui-consistency-fonts-check",
  "school-ux-ui-consistency-bootstrap-italia-double-check",
  "school-ux-ui-consistency-theme-version-check",
  "school-menu-structure-match-model",
  "school-menu-scuola-second-level-structure-match-model",
  "school-legislation-privacy-is-present",
  "school-legislation-accessibility-declaration-is-present",
  "school-controlled-vocabularies",
  "school-servizi-structure-match-model",
] as const;

const extraAudits = [
  "school-legislation-cookie-domain-check",
  "school-security",
  "common-security-ip-location",
] as const;

const onlineAudits = [...localAudits, ...extraAudits] as const;

const localDescriptions = [
  "Fonts",
  "Bootstrap Italia",
  "WordPress theme version",
  "First level menu",
  "Second level menu",
  "Privacy policy",
  "Accessibility declaration",
  "Vocabularies",
  "Services",
] as const;

const extraDescriptions = ["Cookies", "Security", "IP location"] as const;

const onlineDescriptions = [
  ...localDescriptions,
  ...extraDescriptions,
] as const;

type LocalAudits = typeof localAudits[number];
type OnlineAudits = typeof onlineAudits[number];
type LocalDescriptions = typeof localDescriptions[number];
type OnlineDescriptions = typeof onlineDescriptions[number];

const expandExpectedLocal = (line: ExpectedLocalEntry[1]) =>
  localAudits.map((e, ix): [LocalDescriptions, LocalAudits, number] => [
    localDescriptions[ix],
    e,
    line[ix],
  ]);

const expandExpectedOnline = (line: ExpectedOnlineEntry[1]) =>
  onlineAudits.map((e, ix): [OnlineDescriptions, OnlineAudits, number] => [
    onlineDescriptions[ix],
    e,
    line[ix],
  ]);

describe.each<[...ExpectedLocalEntry, number]>(
  expectedLocal.map((e, i) => [...e, i])
)("Local: %s", (url, expectedResults, i) => {
  let report: { audits: Record<string, Record<string, unknown>> };
  const fastify = Fastify();

  beforeAll(async () => {
    fastify.register(fastifyStatic, {
      index: "scuole-home.html",
      root: join(__dirname, "schools", url),
    });

    const port = 9000 + i;

    await fastify.listen({ port });

    const output = await run(
      `http://localhost:${port}`,
      "school",
      "local",
      logLevels.display_none,
      false,
      "",
      ""
    );
    const jsonReport = output.data.jsonReport;
    if (!jsonReport) {
      throw new Error("No JSON report");
    }
    report = JSON.parse(output.data.jsonReport);
  });

  afterAll(async () => fastify.close());

  test.each(expandExpectedLocal(expectedResults))(
    "%s",
    (_, audit, expected) => {
      expect(report.audits[audit].score).toBe(expected);
    }
  );

  test.each([
    ["Cookies", "school-informative-cookie-domain-check"],
    ["Security", "school-informative-security"],
    ["IP location", "common-informative-ip-location"],
    ["Reuse", "school-informative-reuse"],
    ["License", "school-license-and-attribution"],
    ["Cloud", "school-informative-cloud-infrastructure"],
  ])("%s", (_, audit) => {
    expect(report.audits[audit].score).toBe(null);
  });
});

describe.each(expectedOnline)("Online: %s", (url, expectedResults) => {
  let report: { audits: Record<string, Record<string, unknown>> };

  beforeAll(async () => {
    const output = await run(
      url,
      "school",
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
    report = JSON.parse(output.data.jsonReport);
  });

  test.each(expandExpectedOnline(expectedResults))(
    "%s",
    (_, audit, expected) => {
      expect(report.audits[audit].score).toBe(expected);
    }
  );

  test.each([
    ["Reuse", "school-informative-reuse"],
    ["License", "school-license-and-attribution"],
    ["Cloud", "school-informative-cloud-infrastructure"],
  ])("%s", (_, audit) => {
    expect(report.audits[audit].score).toBe(null);
  });
});
