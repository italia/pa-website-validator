module.exports = {
    extends: 'lighthouse:default',
    settings: {
    },

    passes: [
        {
            gatherers: [
                __dirname + '/../../gatherers' + '/municipality/security/certificateExpirationGatherer.js',
                __dirname + '/../../gatherers' + '/municipality/security/httpsIsPresentGatherer.js',
                __dirname + '/../../gatherers' + '/municipality/security/tlsCheckGatherer.js',
                __dirname + '/../../gatherers' + '/municipality/security/ipLocationGatherer.js',
                __dirname + '/../../gatherers' + '/municipality/security/cipherCheckGatherer.js',
                __dirname + '/../../gatherers' + '/municipality/security/domainNameCheckGatherer.js',

                __dirname + '/../../gatherers' + '/municipality/ux-ui-consistency/fontsCheckGatherer.js',
                __dirname + '/../../gatherers' + '/municipality/ux-ui-consistency/bootstrapCheckGatherer.js',

                __dirname + '/../../gatherers' + '/municipality/legislation/cookieAmountCheckGatherer.js',
                __dirname + '/../../gatherers' + '/municipality/legislation/cookieDomainCheckGatherer.js',
                __dirname + '/../../gatherers' + '/municipality/legislation/accessibilityDeclarationIsPresentGatherer.js',
                __dirname + '/../../gatherers' + '/municipality/legislation/privacyGatherer.js',

                __dirname + '/../../gatherers' + '/municipality/informationArchitecture/menuGatherer.js'
            ],
        },
    ],

    audits: [
        __dirname + '/../../audits' + '/municipality/security/certificateExpirationAudit.js',
        __dirname + '/../../audits' + '/municipality/security/httpsIsPresentAudit.js',
        __dirname + '/../../audits' + '/municipality/security/tlsCheckAudit.js',
        __dirname + '/../../audits' + '/municipality/security/ipLocationAudit.js',
        __dirname + '/../../audits' + '/municipality/security/cipherCheckAudit.js',
        __dirname + '/../../audits' + '/municipality/security/domainNameCheckAudit.js',

        __dirname + '/../../audits' + '/municipality/ux-ui-consistency/fontsCheckAudit.js',
        __dirname + '/../../audits' + '/municipality/ux-ui-consistency/bootstrapCheckAudit.js',

        __dirname + '/../../audits' + '/municipality/legislation/cookieAmountCheckAudit.js',
        __dirname + '/../../audits' + '/municipality/legislation/cookieDomainCheckAudit.js',
        __dirname + '/../../audits' + '/municipality/legislation/accessibilityDeclarationIsPresentAudit.js',
        __dirname + '/../../audits' + '/municipality/legislation/privacyAudit.js',

        __dirname + '/../../audits' + '/municipality/informationArchitecture/menuAudit.js'
    ],

    categories: {
        security: {
            title: 'Test di sicurezza',
            description: 'Lista degli audit di sicurezza eseguiti',
            auditRefs: [
                { id: 'municipality-security-https-is-present', weight: 10 },
                { id: 'municipality-security-certificate-expiration', weight: 10 },
                { id: 'municipality-security-tls-check', weight: 10 },
                { id: 'municipality-security-ip-location', weight: 10 },
                { id: 'municipality-security-cipher-check', weight: 10 },
                { id: 'municipality-security-domain-name-check', weight: 10 }
            ],
        },
        uxuiconsistency: {
            title: 'Test di consistenza UX/UI',
            description: 'Lista degli audit di consistenza eseguiti',
            auditRefs: [
                { id: 'municipality-ux-ui-consistency-fonts-check', weight: 10 },
                { id: 'municipality-ux-ui-consistency-bootstrap-check', weight: 10 }
            ],
        },
        legislation: {
            title: 'Test di normativa',
            description: 'Lista degli audit di normativa eseguiti',
            auditRefs: [
                { id: 'municipality-legislation-cookie-amount-check', weight: 10 },
                { id: 'municipality-legislation-cookie-domain-check', weight: 10 },
                { id: 'municipality-legislation-accessibility-declaration-is-present', weight: 10 },
                { id: 'municipality-legislation-privacy-is-present', weight: 10 }
            ],
        },
        informationArchitecture: {
            title: 'Test di architettura delle informazioni',
            description: 'Lista degli audit di architettura delle informazioni eseguiti',
            auditRefs: [
                { id: 'municipality-menu-structure-match-model', weight: 10 },
            ],
        }
    },
}