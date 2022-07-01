"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-informative-subdomain",
      title:
        "C.SE.5.2 - SOTTODOMINIO ISTITUZIONALE - L'area servizi per il cittadino del sito comunale deve utilizzare un sottodominio istituzionale congruente al dominio istituzionale del sito, presente all’interno dell’Anagrafe dei domini.",
      failureTitle:
        "C.SE.5.2 - SOTTODOMINIO ISTITUZIONALE - L'area servizi per il cittadino del sito comunale deve utilizzare un sottodominio istituzionale congruente al dominio istituzionale del sito, presente all’interno dell’Anagrafe dei domini.",
      scoreDisplayMode: Audit.SCORING_MODES.INFORMATIVE,
      description:
       "Questo audit produce un risultato solo quando viene effettuato su un sito pubblicato online.",
      requiredArtifacts: [],
    };
  }

  static async audit(): Promise<{ score: number }> {
    return {
      score: 1
    };
  }
}

module.exports = LoadAudit;
