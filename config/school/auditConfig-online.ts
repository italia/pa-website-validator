import { schoolGatherersFolder } from "../configFolderingConstants"
import { schoolAuditsFolder } from "../configFolderingConstants"

import { commonGatherersFolder } from "../configFolderingConstants"
import { commonAuditsFolder } from "../configFolderingConstants"

module.exports = {
    extends: 'lighthouse:default',
    settings: {
    },

    passes: [
        {
            gatherers: [
                schoolGatherersFolder + '/security/domainNameCheckGatherer.js',

                schoolGatherersFolder + '/ux-ui-consistency/fontsCheckGatherer.js',
                schoolGatherersFolder + '/ux-ui-consistency/bootstrapCheckGatherer.js',
                schoolGatherersFolder + '/ux-ui-consistency/bootstrapItaliaWPCheckGatherer.js',
                schoolGatherersFolder + '/ux-ui-consistency/bootstrapItaliaCheckGatherer.js',
                schoolGatherersFolder + '/ux-ui-consistency/themeCheckGatherer.js',
                schoolGatherersFolder + '/ux-ui-consistency/themeVersionCheckGatherer.js',

                schoolGatherersFolder + '/legislation/accessibilityDeclarationIsPresentGatherer.js',
                schoolGatherersFolder + '/legislation/privacyGatherer.js',

                schoolGatherersFolder + '/informationArchitecture/menuGatherer.js',
                schoolGatherersFolder + '/informationArchitecture/menuScuolaSecondLevelGatherer.js',
                schoolGatherersFolder + '/informationArchitecture/serviziGatherer.js',
                schoolGatherersFolder + '/informationArchitecture/controlledVocabulariesGatherer.js',

                commonGatherersFolder + '/legislation/cookieAmountCheckGatherer.js',
                commonGatherersFolder + '/legislation/cookieDomainCheckGatherer.js',

                commonGatherersFolder + '/security/certificateExpirationGatherer.js',
                commonGatherersFolder + '/security/httpsIsPresentGatherer.js',
                commonGatherersFolder + '/security/tlsCheckGatherer.js',
                commonGatherersFolder + '/security/ipLocationGatherer.js',
                commonGatherersFolder + '/security/cipherCheckGatherer.js'

            ],
        },
    ],

    audits: [
        schoolAuditsFolder + '/security/domainNameCheckAudit.js',

        schoolAuditsFolder + '/ux-ui-consistency/fontsCheckAudit.js',
        schoolAuditsFolder + '/ux-ui-consistency/bootstrapCheckAudit.js',
        schoolAuditsFolder + '/ux-ui-consistency/bootstrapItaliaDoubleCheckAudit.js',
        schoolAuditsFolder + '/ux-ui-consistency/themeCheckAudit.js',
        schoolAuditsFolder + '/ux-ui-consistency/themeVersionCheckAudit.js',

        schoolAuditsFolder + '/legislation/accessibilityDeclarationIsPresentAudit.js',
        schoolAuditsFolder + '/legislation/privacyAudit.js',

        schoolAuditsFolder + '/informationArchitecture/menuAudit.js',
        schoolAuditsFolder + '/informationArchitecture/menuScuolaSecondLevelAudit.js',
        schoolAuditsFolder + '/informationArchitecture/serviziAudit.js',
        schoolAuditsFolder + '/informationArchitecture/controlledVocabulariesAudit.js',

        commonAuditsFolder + '/legislation/cookieAmountCheckAudit.js',
        commonAuditsFolder + '/legislation/cookieDomainCheckAudit.js',

        commonAuditsFolder + '/security/certificateExpirationAudit.js',
        commonAuditsFolder + '/security/httpsIsPresentAudit.js',
        commonAuditsFolder + '/security/tlsCheckAudit.js',
        commonAuditsFolder + '/security/ipLocationAudit.js',
        commonAuditsFolder + '/security/cipherCheckAudit.js'
    ],

    categories: {
        security: {
            title: 'Test di sicurezza',
            description: 'Lista degli audit di sicurezza eseguiti',
            auditRefs: [
                { id: 'school-security-domain-name-check', weight: 10 },

                { id: 'common-security-https-is-present', weight: 10 },
                { id: 'common-security-certificate-expiration', weight: 10 },
                { id: 'common-security-tls-check', weight: 10 },
                { id: 'common-security-ip-location', weight: 10 },
                { id: 'common-security-cipher-check', weight: 10 }
            ],
        },
        uxuiconsistency: {
            title: 'Test di consistenza UX/UI',
            description: 'Lista degli audit di consistenza eseguiti',
            auditRefs: [
                { id: 'school-ux-ui-consistency-fonts-check', weight: 10 },
                { id: 'school-ux-ui-consistency-bootstrap-check', weight: 10 },
                { id: 'school-ux-ui-consistency-bootstrap-italia-double-check', weight: 10 },
                { id: 'school-ux-ui-consistency-theme-check', weight: 10 },
                { id: 'school-ux-ui-consistency-theme-version-check', weight: 10 }
            ],
        },
        legislation: {
            title: 'Test di normativa',
            description: 'Lista degli audit di normativa eseguiti',
            auditRefs: [
                { id: 'school-legislation-accessibility-declaration-is-present', weight: 10 },
                { id: 'school-legislation-privacy-is-present', weight: 10 },

                { id: 'common-legislation-cookie-amount-check', weight: 10 },
                { id: 'common-legislation-cookie-domain-check', weight: 10 }
            ],
        },
        informationArchitecture: {
            title: 'Test di architettura delle informazioni',
            description: 'Lista degli audit di architettura delle informazioni eseguiti',
            auditRefs: [
                { id: 'school-menu-structure-match-model', weight: 10 },
                { id: 'school-menu-scuola-second-level-structure-match-model', weight: 10 },
                { id: 'school-servizi-structure-match-model', weight: 10 },
                { id: 'school-controlled-vocabularies', weight: 10 }
            ],
        }
    },
}