"use strict";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const auditsFolder = __dirname + "/../lighthouse/audits";
const gatherersFolder = __dirname + "/../lighthouse/gatherers";

export const schoolAuditsFolder = auditsFolder + "/school";
export const municipalityAuditsFolder = auditsFolder + "/municipality";
export const commonAuditsFolder = auditsFolder + "/common";
export const schoolInformativeAuditsFolder =
  auditsFolder + "/school/informative";
export const commonInformativeAuditsFolder =
  auditsFolder + "/common/informative";
export const municipalityInformativeAuditsFolder =
  auditsFolder + "/municipality/informative";

export const schoolGatherersFolder = gatherersFolder + "/school";
export const municipalityGatherersFolder = gatherersFolder + "/municipality";
export const commonGatherersFolder = gatherersFolder + "/common";
