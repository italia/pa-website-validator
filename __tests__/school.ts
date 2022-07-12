import { logLevels, run } from "../dist/controller/launchLighthouse.js";

type ExpectedEntry = [
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

const expected: Array<ExpectedEntry> = [
  [
    "https://www.ismonnet.edu.it",
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  ],
];

const audits = [
  "school-ux-ui-consistency-fonts-check",
  "school-ux-ui-consistency-bootstrap-italia-double-check",
  "school-ux-ui-consistency-theme-version-check",
  "school-menu-structure-match-model",
  "school-menu-scuola-second-level-structure-match-model",
  "school-legislation-privacy-is-present",
  "school-legislation-accessibility-declaration-is-present",
  "school-legislation-cookie-domain-check",
  "school-security",
  "common-security-ip-location",
  "school-controlled-vocabularies",
  "school-servizi-structure-match-model",
  "school-informative-reuse",
  "school-informative-license-and-attribution",
  "school-informative-cloud-infrastructure",
] as const;

const descriptions = [
  "Fonts",
  "Bootstrap Italia",
  "WordPress theme version",
  "First level menu",
  "Second level menu",
  "Privacy policy",
  "Accessibility declaration",
  "Cookies",
  "Security",
  "IP location",
  "Vocabularies",
  "Services",
  "Resue",
  "License",
  "Cloud",
] as const;

type Audits = typeof audits[number];
type Descriptions = typeof descriptions[number];

const expandExpected = (line: ExpectedEntry[1]) =>
  audits.map((e, ix): [Descriptions, Audits, number] => [
    descriptions[ix],
    e,
    line[ix],
  ]);

describe.each(expected)("%s", (url, expectedResults) => {
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

  test.each(expandExpected(expectedResults))("%s", (_, audit, expected) => {
    expect(report.audits[audit].score).toBe(expected);
  });
});
