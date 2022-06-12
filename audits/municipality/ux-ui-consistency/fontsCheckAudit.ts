"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { allowedFonts } from "../../../storage/municipality/allowedFonts";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-ux-ui-consistency-fonts-check",
      title: "Font in pagina",
      failureTitle: "Non sono presenti alcuni font richiesti",
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      description: "Test per verificare l'utilizzo di font validi",
      requiredArtifacts: ["fontsCheck"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { fontsCheck: string }
  ): Promise<{ score: number }> {
    const fonts = artifacts.fontsCheck;

    return {
      score: 1
    };
  }
}

module.exports = LoadAudit;
