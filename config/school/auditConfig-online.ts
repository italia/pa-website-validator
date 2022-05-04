module.exports = {
    extends: 'lighthouse:default',
    settings: {
    },

    passes: [
        {
            gatherers: [
                __dirname + '/../../gatherers' + '/school/security/certificateExpirationGatherer.js',
                __dirname + '/../../gatherers' + '/school/security/httpsIsPresentGatherer.js',
                __dirname + '/../../gatherers' + '/school/security/tlsCheckGatherer.js',
                __dirname + '/../../gatherers' + '/school/security/ipLocationGatherer.js',
                __dirname + '/../../gatherers' + '/school/security/cipherCheckGatherer.js',
                __dirname + '/../../gatherers' + '/school/security/domainNameCheckGatherer.js',

                __dirname + '/../../gatherers' + '/school/ux-ui-consistency/fontsCheckGatherer.js',
                __dirname + '/../../gatherers' + '/school/ux-ui-consistency/bootstrapCheckGatherer.js',
                __dirname + '/../../gatherers' + '/school/ux-ui-consistency/bootstrapItaliaCheckGatherer.js',
                __dirname + '/../../gatherers' + '/school/ux-ui-consistency/themeCheckGatherer.js',
                __dirname + '/../../gatherers' + '/school/ux-ui-consistency/themeVersionCheckGatherer.js',

                __dirname + '/../../gatherers' + '/school/legislation/cookieAmountCheckGatherer.js',
                __dirname + '/../../gatherers' + '/school/legislation/cookieDomainCheckGatherer.js',
                __dirname + '/../../gatherers' + '/school/legislation/accessibilityDeclarationIsPresentGatherer.js',
                __dirname + '/../../gatherers' + '/school/legislation/privacyGatherer.js',

                __dirname + '/../../gatherers' + '/school/informationArchitecture/menuGatherer.js',
                __dirname + '/../../gatherers' + '/school/informationArchitecture/menuScuolaSecondLevelGatherer.js',
                __dirname + '/../../gatherers' + '/school/informationArchitecture/serviziGatherer.js'
            ],
        },
    ],

    audits: [
        __dirname + '/../../audits' + '/school/security/certificateExpirationAudit.js',
        __dirname + '/../../audits' + '/school/security/httpsIsPresentAudit.js',
        __dirname + '/../../audits' + '/school/security/tlsCheckAudit.js',
        __dirname + '/../../audits' + '/school/security/ipLocationAudit.js',
        __dirname + '/../../audits' + '/school/security/cipherCheckAudit.js',
        __dirname + '/../../audits' + '/school/security/domainNameCheckAudit.js',

        __dirname + '/../../audits' + '/school/ux-ui-consistency/fontsCheckAudit.js',
        __dirname + '/../../audits' + '/school/ux-ui-consistency/bootstrapCheckAudit.js',
        __dirname + '/../../audits' + '/school/ux-ui-consistency/bootstrapItaliaCheckAudit.js',
        __dirname + '/../../audits' + '/school/ux-ui-consistency/themeCheckAudit.js',
        __dirname + '/../../audits' + '/school/ux-ui-consistency/themeVersionCheckAudit.js',

        __dirname + '/../../audits' + '/school/legislation/cookieAmountCheckAudit.js',
        __dirname + '/../../audits' + '/school/legislation/cookieDomainCheckAudit.js',
        __dirname + '/../../audits' + '/school/legislation/accessibilityDeclarationIsPresentAudit.js',
        __dirname + '/../../audits' + '/school/legislation/privacyAudit.js',

        __dirname + '/../../audits' + '/school/informationArchitecture/menuAudit.js',
        __dirname + '/../../audits' + '/school/informationArchitecture/menuScuolaSecondLevelAudit.js',
        __dirname + '/../../audits' + '/school/informationArchitecture/serviziAudit.js'
    ],

    categories: {
        security: {
            title: 'Test di sicurezza',
            description: 'Lista degli audit di sicurezza eseguiti',
            auditRefs: [
                { id: 'school-security-https-is-present', weight: 10 },
                { id: 'school-security-certificate-expiration', weight: 10 },
                { id: 'school-security-tls-check', weight: 10 },
                { id: 'school-security-ip-location', weight: 10 },
                { id: 'school-security-cipher-check', weight: 10 },
                { id: 'school-security-domain-name-check', weight: 10 }
            ],
        },
        uxuiconsistency: {
            title: 'Test di consistenza UX/UI',
            description: 'Lista degli audit di consistenza eseguiti',
            auditRefs: [
                { id: 'school-ux-ui-consistency-fonts-check', weight: 10 },
                { id: 'school-ux-ui-consistency-bootstrap-check', weight: 10 },
                { id: 'school-ux-ui-consistency-bootstrap-italia-check', weight: 10 },
                { id: 'school-ux-ui-consistency-theme-check', weight: 10 },
                { id: 'school-ux-ui-consistency-theme-version-check', weight: 10 }
            ],
        },
        legislation: {
            title: 'Test di normativa',
            description: 'Lista degli audit di normativa eseguiti',
            auditRefs: [
                { id: 'school-legislation-cookie-amount-check', weight: 10 },
                { id: 'school-legislation-cookie-domain-check', weight: 10 },
                { id: 'school-legislation-accessibility-declaration-is-present', weight: 10 },
                { id: 'school-legislation-privacy-is-present', weight: 10 }
            ],
        },
        informationArchitecture: {
            title: 'Test di architettura delle informazioni',
            description: 'Lista degli audit di architettura delle informazioni eseguiti',
            auditRefs: [
                { id: 'school-menu-structure-match-model', weight: 10 },
                { id: 'school-menu-scuola-second-level-structure-match-model', weight: 10 },
                { id: 'school-servizi-structure-match-model', weight: 10 }
            ],
        }
    },
}