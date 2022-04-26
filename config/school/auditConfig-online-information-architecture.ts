module.exports = {
    extends: 'lighthouse:default',
    settings: {
    },

    passes: [
        {
            gatherers: [
                __dirname + '/../../gatherers' + '/school/informationArchitecture/contentTypeGatherer.js'
            ],
        },
    ],

    audits: [
        __dirname + '/../../audits' + '/school/informationArchitecture/contentTypeAudit.js'
    ],

    categories: {
        informationArchitecture: {
            title: 'Test di architettura delle informazioni',
            description: 'Lista degli audit di architettura delle informazioni eseguiti',
            auditRefs: [
                { id: 'school-content-type-structure-match-model', weight: 10 },
            ],
        }
    },
}