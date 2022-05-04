module.exports = {
    extends: 'lighthouse:default',
    settings: {
    },

    passes: [
        {
            gatherers: [
                __dirname + '/../../gatherers' + '/municipality/ux-ui-consistency/fontsCheckGatherer.js',
                __dirname + '/../../gatherers' + '/municipality/ux-ui-consistency/bootstrapCheckGatherer.js',

                __dirname + '/../../gatherers' + '/municipality/legislation/accessibilityDeclarationIsPresentGatherer.js',
                __dirname + '/../../gatherers' + '/municipality/legislation/privacyGatherer.js',

                __dirname + '/../../gatherers' + '/municipality/informationArchitecture/menuGatherer.js'
            ],
        },
    ],

    audits: [
        __dirname + '/../../audits' + '/municipality/ux-ui-consistency/fontsCheckAudit.js',
        __dirname + '/../../audits' + '/municipality/ux-ui-consistency/bootstrapCheckAudit.js',

        __dirname + '/../../audits' + '/municipality/legislation/accessibilityDeclarationIsPresentAudit.js',
        __dirname + '/../../audits' + '/municipality/legislation/privacyAudit.js',

        __dirname + '/../../audits' + '/municipality/informationArchitecture/menuAudit.js'
    ],

    categories: {
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