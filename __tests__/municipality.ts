/*
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
*/

import { logLevels, run } from "../dist/controller/launchLighthouse.js";

/*
const __dirname = dirname(fileURLToPath(import.meta.url));
const fastify = Fastify();

type ExpectedLocalEntry = [
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
    number,
    number,
    number,
    number
  ]
];

const expectedLocal: Array<ExpectedLocalEntry> = [
  ["master", [1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0.5, 0]],
];
*/

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
  [
    "https://www.comune.bergamo.it",
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 1, 0, 1, 0, 0],
  ],
];

const localAudits = [
  "municipality-menu-structure-match-model",
  "municipality-second-level-pages",
  "municipality-ux-ui-consistency-bootstrap-italia-double-check",
  "municipality-legislation-accessibility-declaration-is-present",
  "municipality-legislation-privacy-is-present",
  "municipality-faq-is-present",
  "municipality-inefficiency-report",
  "municipality-ux-ui-consistency-fonts-check",
  "municipality-booking-appointment-check",
  "municipality-controlled-vocabularies",
  "municipality-contacts-assistency",
  "municipality-feedback-element",
  "municipality-servizi-structure-match-model",
  "municipality-ux-ui-consistency-theme-version-check",
  "municipality-metatag",
] as const;

const extraAudits = [
  "municipality-legislation-cookie-domain-check",
  "municipality-domain",
  "municipality-security",
  "common-security-ip-location",
  "municipality-personal-area-security",
  "municipality-subdomain",
] as const;

const onlineAudits = [...localAudits, ...extraAudits] as const;

const localDescriptions = [
  "Menu structure",
  "Second level pages",
  "Bootstrap Italia",
  "Accessibility declaration",
  "Privacy policy",
  "FAQ",
  "Inefficiency report",
  "Fonts",
  "Booking appointment",
  "Vocabularies",
  "Contacts",
  "Feedback",
  "Services",
  "WordPress theme version",
  "Metatag",
] as const;

const extraDescriptions = [
  "Cookies",
  "Domain",
  "Security",
  "IP location",
  "Personal area security",
  "Municipality subdomain",
] as const;

const onlineDescriptions = [
  ...localDescriptions,
  ...extraDescriptions,
] as const;

//type LocalAudits = typeof localAudits[number];
type OnlineAudits = typeof onlineAudits[number];
//type LocalDescriptions = typeof localDescriptions[number];
type OnlineDescriptions = typeof onlineDescriptions[number];

/*
const expandExpectedLocal = (line: ExpectedLocalEntry[1]) =>
  localAudits.map((e, ix): [LocalDescriptions, LocalAudits, number] => [
    localDescriptions[ix],
    e,
    line[ix],
  ]);
*/

const expandExpectedOnline = (line: ExpectedOnlineEntry[1]) =>
  onlineAudits.map((e, ix): [OnlineDescriptions, OnlineAudits, number] => [
    onlineDescriptions[ix],
    e,
    line[ix],
  ]);

/*
describe.each(expectedLocal)("Local: %s", (url, expectedResults) => {
  let report: { audits: Record<string, Record<string, unknown>> };

  beforeAll(async () => {
    fastify.register(fastifyStatic, {
      index: "scuole-home.html",
      root: join(__dirname, "schools", url),
    });

    await fastify.listen({ port: 8080 });

    const output = await run(
      "http://localhost:8080",
      "municipality",
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
    ["Cookies", "municipality-informative-cookie-domain-check"],
    ["Domain", "municipality-informative-domain"],
    ["Security", "municipality-informative-security"],
    ["IP location", "common-informative-ip-location"],
    ["Reuse", "municipality-informative-reuse"],
    ["License", "municipality-informative-license-and-attribution"],
    ["Cloud", "municipality-informative-cloud-infrastructure"],
    ["UX evaluation", "municipality-informative-user-experience-evaluation"],
  ])("%s", (_, audit) => {
    expect(report.audits[audit].score).toBe(null);
  });
});
*/

describe.each(expectedOnline)("Online: %s", (url, expectedResults) => {
  let report: { audits: Record<string, Record<string, unknown>> };

  beforeAll(async () => {
    const output = await run(
      url,
      "municipality",
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
    ["Reuse", "municipality-informative-reuse"],
    ["License", "municipality-informative-license-and-attribution"],
    ["Cloud", "municipality-informative-cloud-infrastructure"],
    ["UX evaluation", "municipality-informative-user-experience-evaluation"],
  ])("%s", (_, audit) => {
    expect(report.audits[audit].score).toBe(null);
  });
});
