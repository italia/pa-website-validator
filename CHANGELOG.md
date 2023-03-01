# Changelog

## [2.0.0](https://github.com/italia/pa-website-validator/compare/v1.2.0-pre.1...v2.0.0) (2023-03-01)


### Bug Fixes

* **app:** change option description ([ffeccec](https://github.com/italia/pa-website-validator/commit/ffeccecebcb0b257e615e0e38d68cb282f86eb7d))
* **app:** change option text ([5b309d3](https://github.com/italia/pa-website-validator/commit/5b309d3f5e2ef0f7a52fcbf66ab51ace81427ca7))
* **app:** change order of options ([6550e15](https://github.com/italia/pa-website-validator/commit/6550e151a5c21aa15c24e0b6b75c304b89916739))
* audit non eseguito se non viene trovata almeno una voce per sotto menù ([4f38ee1](https://github.com/italia/pa-website-validator/commit/4f38ee17d4bd8adda2f1023ebc0dab8cc127440d))
* **C.SI.2.1:** remove breadcrumb check ([3715139](https://github.com/italia/pa-website-validator/commit/371513985c9f9cb50ed89aee5e8441423a5cddac))
* cambiamento itemType a url per link di destinazione ([eb4b694](https://github.com/italia/pa-website-validator/commit/eb4b694f572cfbfc48c27c72445fc2af81bd7a39))
* gestione eccezione https.request ([66670f8](https://github.com/italia/pa-website-validator/commit/66670f82bc73ea869b9b3d85f10c2e876cd0f345))
* logica inizializzazione audit ([1d0665c](https://github.com/italia/pa-website-validator/commit/1d0665c50e87abb560d0d62a9edc8bef2492e7e8))
* modifica scrittura risultati ([43a4fad](https://github.com/italia/pa-website-validator/commit/43a4fadce6994454c64381343e111a88d8b5e231))
* static checks ([7d5995a](https://github.com/italia/pa-website-validator/commit/7d5995a02a5e651e09d4364fc7633fa8c1eb97a2))


### Miscellaneous Chores

* release 2.0.0 ([c279585](https://github.com/italia/pa-website-validator/commit/c279585e01f3d193db4f0921247765b132ca517c))

## [1.2.0-pre.1](https://github.com/italia/pa-website-validator/compare/v1.1.0...v1.2.0-pre.1) (2023-02-28)


### Features

* aggiornamento label audit servizi comuni & scuole ([c5a36dc](https://github.com/italia/pa-website-validator/commit/c5a36dcbaae8059e4abb84903191edab630f4cf1))
* aggiornamento label audits ([eb417b5](https://github.com/italia/pa-website-validator/commit/eb417b5ae4cdb5e4fc94c51f54b092dee5fa4ee0))
* aggiunta colonne aggiuntive ad audit contatti ([42759a5](https://github.com/italia/pa-website-validator/commit/42759a5fa303115c83e04cb926f0e5037c33f3ea))
* aggiunta controllo pagine di prenotazione apputamenti per audit di cookies e bootstrap ([792dfa4](https://github.com/italia/pa-website-validator/commit/792dfa405ad5ec48c7618e17ca9635084c32105c))
* **app:** add selection of accuracy level ([b9d9c14](https://github.com/italia/pa-website-validator/commit/b9d9c14fa91183e5296b70ff8b5538f158ca82f3))
* audit CSC13 ([5883c80](https://github.com/italia/pa-website-validator/commit/5883c800c636bfac0d0fc1d8239e03848148e07a))
* audit CSI21 ([2290d68](https://github.com/italia/pa-website-validator/commit/2290d6820b91e73d73e134fbc5db5cb5f64cf2f0))
* audit CSI25 ([6c7498c](https://github.com/italia/pa-website-validator/commit/6c7498c2c96685c7c3897376f9655f9941b8b2cb))
* audit CSI34 ([30686fe](https://github.com/italia/pa-website-validator/commit/30686fe404a18eced681fa141ad07095eb9ec1d2))
* audit CSI34 con data-elements ([364181f](https://github.com/italia/pa-website-validator/commit/364181f97c9e7e725a0d84e0f8b5941f1a353003))
* audit informativi in audit standard ([3eae28f](https://github.com/italia/pa-website-validator/commit/3eae28fabd045473b770c4a65b03550e550d9cb1))
* audit RSI11 ([22b5d09](https://github.com/italia/pa-website-validator/commit/22b5d0906915a7d5cc5fbe5caf9f7ddeefd99613))
* audit servizi scuole ([cfe960f](https://github.com/italia/pa-website-validator/commit/cfe960f89273ec9a21075f34936c6414c4fd7881))
* audit servizi scuole su servizi multipli con caricamento da pager ([bfc2d87](https://github.com/italia/pa-website-validator/commit/bfc2d87ce0740f30c86e6f6bb6fc44d5a1f9005b))
* audit servizi sui comuni - scansione servizi multipli ([71d33d9](https://github.com/italia/pa-website-validator/commit/71d33d914b93f78aebb05621e5d7280c5e813199))
* audit/CSC11 ([562fa56](https://github.com/italia/pa-website-validator/commit/562fa56445222ccd2d4593f1f5660c9774dc25dc))
* audit/CSC31 ([94dabd0](https://github.com/italia/pa-website-validator/commit/94dabd05252920183ecc20896308f2397873d0d8))
* audit/CSI22 ([db265b1](https://github.com/italia/pa-website-validator/commit/db265b1cc88efb47eaab93c5d483fc224ad15a95))
* audit/CSI24 ([eacf8a3](https://github.com/italia/pa-website-validator/commit/eacf8a385b76941fa97706b734c1cf484d0c0462))
* audit/CSI52 ([d4f704a](https://github.com/italia/pa-website-validator/commit/d4f704ae9e8375be5ce3bbb916ac47fbe8c123db))
* check cookies per pagine di eventi ([1496ffd](https://github.com/italia/pa-website-validator/commit/1496ffdd554ca76559d9e084453435bc4fd17dba))
* configurazioni per accuratezza scansioni ([af174fd](https://github.com/italia/pa-website-validator/commit/af174fd866aeb5c9c628c499341d915e7686546f))
* controllo di almno 3 caratteri in ogni testo di servizi ([4325a5a](https://github.com/italia/pa-website-validator/commit/4325a5a4ba6d8b1bcc45df1aa7a4afe6711d3909))
* controllo presenza componente contatti in pagina per audit assistenza contatti ([63c8942](https://github.com/italia/pa-website-validator/commit/63c89427f518758c8ead1d65090dd89efc7f03d1))
* error voices for second level pages ([927fa3f](https://github.com/italia/pa-website-validator/commit/927fa3f1cb87e5288422b0cb63927811493d720c))
* inizio nuove features audits ([c2b297d](https://github.com/italia/pa-website-validator/commit/c2b297d27f4201c7f5230318b4746fe77ad7cc7b))
* label release 3 ([b727c0d](https://github.com/italia/pa-website-validator/commit/b727c0d5172200960347e0e0041789b839a436cb))
* logica caricamento pagine di scuole ([0cff764](https://github.com/italia/pa-website-validator/commit/0cff76426509066858e9b05de0b59f3273657354))
* modifica label audit di comuni ([a259e0c](https://github.com/italia/pa-website-validator/commit/a259e0ca64a1039778aace6495a072d6d3fe4d58))
* modifica logica di controllo del componenete di feedback ([90e0588](https://github.com/italia/pa-website-validator/commit/90e0588336ba4172af96faef1723c03ec075a456))
* modifica logica di fallimento audit se data-element non trovati ([1ffe394](https://github.com/italia/pa-website-validator/commit/1ffe39424ac6b383723e26d2d4e60546439832a6))
* modifica messaggi dei cluster ([18ce09a](https://github.com/italia/pa-website-validator/commit/18ce09a29db1561246be83b674acf5b9c9ba6f94))
* modifiche audit licenza e attribuzione, dichiarazione accessibilità e disservizio ([f320ca0](https://github.com/italia/pa-website-validator/commit/f320ca0aaa558baa47e27bdaed1b7a41041c6a8f))
* modifiche del 30 01 ([e9f033d](https://github.com/italia/pa-website-validator/commit/e9f033dfcf6a63119698140050709fa86e4251b0))
* nuova visualizzazione risultati per audit bootstrap ([200f32b](https://github.com/italia/pa-website-validator/commit/200f32bbf472c59c63bb89643bb977ebc46a9f8b))
* refactory file di utils ([60e02e6](https://github.com/italia/pa-website-validator/commit/60e02e66ea84dc8f38857657188fe24edf790fcc))
* refactory risultati audit servizi scuole ([ae5b69f](https://github.com/italia/pa-website-validator/commit/ae5b69f45a0f5eb8cb281e0ef73d406195de444f))
* refactory risultati per audit cookie municipality ([5527b21](https://github.com/italia/pa-website-validator/commit/5527b21bc542d64fb24fdad83550a0f8313704ad))
* refactory scrittura risultati per audit bootstrap comuni ([53d0407](https://github.com/italia/pa-website-validator/commit/53d0407de84a9a3b21614f5905c5b407afcfab9c))
* refactory scrittura risultati per audit cookie scuole ([0434560](https://github.com/italia/pa-website-validator/commit/0434560613408bc796b63ef835422ecddeb6bf5f))
* refactory scrittura risultati per audit servizi comuni ([6bfe56e](https://github.com/italia/pa-website-validator/commit/6bfe56ef504faedb99c96e56c0a7025357c7d622))
* ricerca dei data-element per i menu dei servizi ([baaf1d6](https://github.com/italia/pa-website-validator/commit/baaf1d670e17f8068853f17720b48ab0a786b5c7))
* riscrittura risultati per audit bootstrap e link delle pagine analizzate come url ([bc1302d](https://github.com/italia/pa-website-validator/commit/bc1302d7a98776adb68cb33d632be6e52ffeb0a7))
* scansione per tutti gli elementi in pagina ([5f3a526](https://github.com/italia/pa-website-validator/commit/5f3a52646c7fafa1f22c41ea5b9c84a7d993442c))
* scuole voci di secondo livello ([f9fa51e](https://github.com/italia/pa-website-validator/commit/f9fa51eb0565aa088b2b63aa2386e529e685f88b))


### Bug Fixes

* add missing entries to EuroVoc ([7379780](https://github.com/italia/pa-website-validator/commit/7379780ee5c18e4618a61e0f9c077739f536c8f6))
* aggiornamento label per audit scuole ([0abfaac](https://github.com/italia/pa-website-validator/commit/0abfaacdcc40b365f6d2fb661997cdb85be7a6e5))
* audit accessibilità ([af9d4be](https://github.com/italia/pa-website-validator/commit/af9d4be0d615b60a94c8ddd6d88cb6709a485c7a))
* build url negli url di servizi ([5422303](https://github.com/italia/pa-website-validator/commit/5422303b7ff57de1a06e4c930ae34e0e35125a87))
* caricamento pagine custom ([c633a23](https://github.com/italia/pa-website-validator/commit/c633a234ea32d3b27ae1c2913ed01498c86ac725))
* caricamento pagine di prenotazione appuntamenti dalla pagina di primo livello servizi, bugfix ([97cb585](https://github.com/italia/pa-website-validator/commit/97cb585ecf0a3cb380d817c8f669a97237aba07e))
* condizione gialla per vocabolari controllati ([0ebac69](https://github.com/italia/pa-website-validator/commit/0ebac69f931713dcc5d2db98f5418eaebb6673cd))
* config audit per comuni ([d3f9c9d](https://github.com/italia/pa-website-validator/commit/d3f9c9d2832e4849f79e480b18d40b079e1c66a2))
* css classes ([0eb9e11](https://github.com/italia/pa-website-validator/commit/0eb9e1174be7fc9e7c4f67af0e61c538a2761eba))
* fix messaggi errati audit ([515769a](https://github.com/italia/pa-website-validator/commit/515769afb19c8b15e60126ed5bb02c6226807905))
* fix minori ([43f5471](https://github.com/italia/pa-website-validator/commit/43f5471ac4b94daa2e3466011008ec93b416229c))
* fix sui messaggi di errore ([8935bad](https://github.com/italia/pa-website-validator/commit/8935badec2e6a26a431e397f1dc2b35eacde80fe))
* label ([fe41535](https://github.com/italia/pa-website-validator/commit/fe415350e5524553f172118b269b1fc70ca246e1))
* look for `&lt;a&gt;` tags instead of `<li>` in C.SC.1.5 ([95cadba](https://github.com/italia/pa-website-validator/commit/95cadba143b64712cdb4e3680ab24b4832b516a3))
* messaggio rosso audit di cookies ([1389ad1](https://github.com/italia/pa-website-validator/commit/1389ad128a51bd0844ae5022b89068dded3d0f69))
* messaggio rosso audit licenza e attribuzione e static checks ([2e1ca63](https://github.com/italia/pa-website-validator/commit/2e1ca636b4993e26c121f4ae35d79c1653cd6f05))
* minor ([cb6bf73](https://github.com/italia/pa-website-validator/commit/cb6bf730c34f7daf91a9f27b757427429a0c112b))
* minor fix ([09c59db](https://github.com/italia/pa-website-validator/commit/09c59dbe02260003fe382dfed9aada5dd7ba8ba7))
* modifica della scrittura dei risultati per audit appuntamenti ([24ebf64](https://github.com/italia/pa-website-validator/commit/24ebf6470d2a5e514bcf45516667939d3a0f5f4a))
* modifica di accuracy da max to high, modifica del valore del suggested a 5 pagine, aggiornamento readme, set di accuracy dentro il metodo run ([5e0b720](https://github.com/italia/pa-website-validator/commit/5e0b720192644c7c5bccbbd3f0d8ed61a59343dd))
* modifica messaggi di errore per audits dello strumento di valutazione ([e7278ad](https://github.com/italia/pa-website-validator/commit/e7278adbc8085c53bda2f01cca8071c1fade1d59))
* modifica messaggio di errore per audit di accessibilità per comuni ([ef91c0d](https://github.com/italia/pa-website-validator/commit/ef91c0d55c97d0f1c00811e5864b912a0baab625))
* modificata la descrizione ([1469402](https://github.com/italia/pa-website-validator/commit/14694020a8ceadfae4def65363cab7f9defe0f8f))
* modifiche di caricamento delle pagine di terzo livello per eventi ([8b666d1](https://github.com/italia/pa-website-validator/commit/8b666d1d0167fc76bdfacd8166fbef3b01bef808))
* modifiche labels ([7580332](https://github.com/italia/pa-website-validator/commit/7580332dbf04c87b9ba466d48190eb616df8d066))
* non esecuzione per audit menu primo livello scuole ([3dd50f9](https://github.com/italia/pa-website-validator/commit/3dd50f95b380e9c6c0842d9a7ee5138732301d4f))
* ordinamento risultato, colonna si nasconde se non ci sono risultati, label per menu secondo livello ([62da1a1](https://github.com/italia/pa-website-validator/commit/62da1a1fdb81743de32e3d05139c82cd2a7402b0))
* rimozione campo 'Elemento controllato' in audit CMS ([643f7ff](https://github.com/italia/pa-website-validator/commit/643f7ffdb33883fd0c8dc31da6df68962c0ba32c))
* rinominazione metodi di utils ([7c401c4](https://github.com/italia/pa-website-validator/commit/7c401c49e2ab816a20002a7e2dd8ed7331272760))
* show correct failure message in C.SI.2.1 ([7ad4bf8](https://github.com/italia/pa-website-validator/commit/7ad4bf8e21608cee7b0c5663f1f7969a7792e4c3))
* sistemazione configurazioni e static checks ([52cc3d3](https://github.com/italia/pa-website-validator/commit/52cc3d3c1b599108d3e32c8200385a6ab4e6b2c0))
* static checks ([9c7e0e0](https://github.com/italia/pa-website-validator/commit/9c7e0e0bf0517d05b11ec55158376c86cc70935a))
* static checks ([e4dae58](https://github.com/italia/pa-website-validator/commit/e4dae58bcedcbda677d39ad0a9183dfa518a36e2))
* static checks ([3bef635](https://github.com/italia/pa-website-validator/commit/3bef63539d783c5c5284007ae382d2680dbe3135))
* static checks ([4cf9015](https://github.com/italia/pa-website-validator/commit/4cf901571416cde273c9e57c222b2ae53a7b1b72))
* static checks ([17740eb](https://github.com/italia/pa-website-validator/commit/17740eb725ee2849ceeee73abf11e7ef94647db5))
* static checks ([d95e00b](https://github.com/italia/pa-website-validator/commit/d95e00beff0def4030852e302151ed5ecb1d7aab))
* static checks e refactoring codice ([f08591f](https://github.com/italia/pa-website-validator/commit/f08591f4ccb0484ca9bbf3367f6e560ba6178b84))
* update C.SI.1.4 audit description ([ca20a9e](https://github.com/italia/pa-website-validator/commit/ca20a9e50ee690c4bdd042aec9cad88da539ee1d))
* voci di secondo livello per comuni ([e702141](https://github.com/italia/pa-website-validator/commit/e702141c01b902b00fca0f6f313376dba8d48af0))


### Miscellaneous Chores

* merge work on new features ([f745703](https://github.com/italia/pa-website-validator/commit/f745703516f15e2a05c3be1c7438bc5acd7cbbee))

## [1.1.0](https://github.com/italia/pa-website-validator/compare/v1.0.13...v1.1.0) (2022-12-07)


### Features

* cache loadPageData ([#71](https://github.com/italia/pa-website-validator/issues/71)) ([b72b188](https://github.com/italia/pa-website-validator/commit/b72b1886ce7a7ab81069adf7d7d0f411d945a555))
* verify fonts on all headers and paragraphs ([1cebac3](https://github.com/italia/pa-website-validator/commit/1cebac39fb255064c2597625a3213d0fda05cf70))


### Bug Fixes

* calculation of the 30% of the schools' second level menu items ([177008a](https://github.com/italia/pa-website-validator/commit/177008a6edb7d55ffffab0c24b6813d582902ae3))
* change percentage calculation in C.SC.1.5 ([#128](https://github.com/italia/pa-website-validator/issues/128)) ([c0ce054](https://github.com/italia/pa-website-validator/commit/c0ce054871eec4b907ce25d8cb3d7bbbeb1f5b30))
* check full CSS comment header in CMS theme version audit ([34e4822](https://github.com/italia/pa-website-validator/commit/34e482228bc33bf88fa652613d41a0b3e8926c40))
* don’t count header in C.SC.1.5 ([a45f981](https://github.com/italia/pa-website-validator/commit/a45f9810ad10ab6e6cd5f740f062b958f309fb79))
* remove C.SE.5.1 and C.SE.5.2 ([c0ce054](https://github.com/italia/pa-website-validator/commit/c0ce054871eec4b907ce25d8cb3d7bbbeb1f5b30))
* remove item position check in C.SC.1.5 ([c0ce054](https://github.com/italia/pa-website-validator/commit/c0ce054871eec4b907ce25d8cb3d7bbbeb1f5b30))
* typos in domain list ([188843c](https://github.com/italia/pa-website-validator/commit/188843c7e75740dad985769be4b6d56619816019))
* update audit messages ([d00a07a](https://github.com/italia/pa-website-validator/commit/d00a07a4343749faac9e253ff72c500fa9edab79))
* wait until page is completely loaded ([6756449](https://github.com/italia/pa-website-validator/commit/6756449240c89a4976bfd8dcf7e2f61f9b322788))

## [1.0.13](https://github.com/italia/pa-website-validator/compare/v1.0.12...v1.0.13) (2022-11-11)


### Bug Fixes

* modifica prelievo url di scansione da origin a href ([10da2ea](https://github.com/italia/pa-website-validator/commit/10da2ea2625162bd7bfdddfbd2ae87c2e9032bab))

## [1.0.12](https://github.com/italia/pa-website-validator/compare/v1.0.11...v1.0.12) (2022-11-10)


### Bug Fixes

* aggiunto user-agent header versione tema comuni ([585d7db](https://github.com/italia/pa-website-validator/commit/585d7dba3f8adb97afc24dfcf158304cac998236))
* C.SI.1.3 “Categoria del servizio” ([799b6f8](https://github.com/italia/pa-website-validator/commit/799b6f811e533abe78e95da9a6f99512c359121a))
* fix hostname in verifica esistenza url ([359f9a3](https://github.com/italia/pa-website-validator/commit/359f9a37e0f7b6492749dc4ebde083fc679b5735))
* integrazione Axios per verifica esistenza url ([f0fbde5](https://github.com/italia/pa-website-validator/commit/f0fbde5a9bb5c729959aab201ec09082ac447778))

## [1.0.11](https://github.com/italia/pa-website-validator/compare/v1.0.10...v1.0.11) (2022-11-10)


### Bug Fixes

* aggiunto header user-agent nelle request per retrieve CSS ([a8ca690](https://github.com/italia/pa-website-validator/commit/a8ca690922a8abc74caa5e4b41d92c063d1d1490))
* C.SC.1.5 “I luoghi” ([b17f4e7](https://github.com/italia/pa-website-validator/commit/b17f4e7ad711e8120286a64a3faf1619c443b76a))
* C.SC.1.5 “Le persone” ([19e3a25](https://github.com/italia/pa-website-validator/commit/19e3a25183d89f846640d981e9dc2030d9e0e098))
* C.SC.1.5 order ([35a4e63](https://github.com/italia/pa-website-validator/commit/35a4e63e5e48d9785c9d49266343638c0f8bd0bf))
* C.SI.1.6 “Vivere [nome del Comune]” ([f9d169b](https://github.com/italia/pa-website-validator/commit/f9d169b42a41899c0b1b9edeac88755c06e19edf))
* C.SI.2.1 warning becomes a failure ([b63bba0](https://github.com/italia/pa-website-validator/commit/b63bba04275a315610cc8066e4d14d553b7b807e))
* C.SI.2.4 allow “mailto:” ([b9b7ccc](https://github.com/italia/pa-website-validator/commit/b9b7ccc93da7a0f35dc4b691f18f9c07bef33b0d))
* follow redirects ([16bc98a](https://github.com/italia/pa-website-validator/commit/16bc98aad0bf407f91306d906193e1faa00c3208))
* report if no CMS theme is used ([c86d92a](https://github.com/italia/pa-website-validator/commit/c86d92a7856a5b70824bf2dce3313c664e4567ac))
* show name of detected CMS ([8bb45b6](https://github.com/italia/pa-website-validator/commit/8bb45b67957dc8051124f5ff54bea0943c02a771))
* suite di cifratura aggiornati con standardName ([9b98564](https://github.com/italia/pa-website-validator/commit/9b98564e1d18980c547ab29a5f67392366f8bd68))
