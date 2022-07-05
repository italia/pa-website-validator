# ![developers.italia](https://avatars1.githubusercontent.com/u/15377824?s=36&v=4 "developers.italia") PA Website Validator

#### _Il crawler di validazione della pubblica amministrazione_

PA Website validator è un tool che integra la libreria [Lightouse][lighthouse] esponendo test custom per la validazione dei siti web di scuole & comuni.

## Funzionalità

- Possibilità di utilizzare il pacchetto come dipendenza global eseguendolo come cli-application.
- Possibilità di integrare il pacchetto come dipendenza NPM in progetti terzi.
- Possibilità di lanciare l'auditing su un sito web online o in locale.

## Scuole - Test eseguiti

| Test                                                      | Descrizione                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Criteri di conformità                                     | Vengono mostrati i risultati degli audit, relativi ad alcuni dei criteri di conformità, in riferimento all'[Allegato 2 dell'Avviso 1.4.1](https://areariservata.padigitale2026.gov.it/Pa_digitale2026_dettagli_avviso?id=a017Q00000dk82wQAA#allegati).                                                                                                                                                                                                                                                                                                                                                      |
| Raccomandazioni progettuali                               | Vengono mostrati i risultati degli audit, relativi ad alcune delle raccomandazioni progettuali, in riferimento all'[Allegato 2 dell'Avviso 1.4.1](https://areariservata.padigitale2026.gov.it/Pa_digitale2026_dettagli_avviso?id=a017Q00000dk82wQAA#allegati).                                                                                                                                                                                                                                                                                                                                              |
| Test aggiuntivi                                           | Vengono mostrati i risultati di test aggiuntivi di Lighthouse utili a facilitare le attività di sviluppo e garantire un buon risultato.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Raccomandazioni progettuali: Velocità e tempi di risposta | Nel caso in cui il sito presenti livelli di prestazioni (media pesata di 6 metriche standard) inferiori a 50 secondo quanto calcolato e verificato tramite le librerie Lighthouse, la scuola deve pubblicare sul sito un “Piano di miglioramento del sito” che mostri, per ciascuna delle 6 metriche che impatta negativamente le prestazioni, le azioni future di miglioramento e le relative tempistiche di realizzazione attese; RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Scuole.](https://docs.italia.it/italia/designers-italia/design-scuole-docs/it/v2022.1/index.html) |

## Comuni - Test eseguiti

| Test                                                                   | Descrizione                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pacchetto Cittadino Informato: criteri di conformità                   | Vengono mostrati i risultati degli audit, relativi ad alcuni dei criteri di conformità del Pacchetto Cittadino Informato, in riferimento all'[allegato 2 dell'Avviso 1.4.1](https://areariservata.padigitale2026.gov.it/Pa_digitale2026_dettagli_avviso?id=a017Q00000dk829QAA#allegati).                                                                                                                                                                                                                                                                                              |
| Pacchetto Cittadino Attivo: criteri di conformità                      | Vengono mostrati i risultati degli audit, relativi ad alcuni dei criteri di conformità del Pacchetto Cittadino Attivo, in riferimento all'[allegato 2 dell'Avviso 1.4.1](https://www.nic.it/sites/default/files/docs/comuni_list.html).                                                                                                                                                                                                                                                                                                                                               |
| Raccomandazioni progettuali e test aggiuntivi                          | Vengono mostrati i risultati degli audit, relativi ad alcune delle raccomandazioni progettuali del Pacchetto Cittadino Informato, in riferimento all'[allegato 2 dell'Avviso 1.4.1](https://areariservata.padigitale2026.gov.it/Pa_digitale2026_dettagli_avviso?id=a017Q00000dk829QAA#allegati). A questi sono aggiunti ulteriori test per facilitare le attività di sviluppo e garantire un buon risultato.                                                                                                                                                                          |
| Pacchetto Cittadino Informato: C.SI.4.1 - Velocità e tempi di risposta | Nel caso in cui il sito presenti livelli di prestazioni (media pesata di 6 metriche standard) inferiori a 50 secondo quanto calcolato e verificato tramite le librerie Lighthouse, il Comune deve pubblicare sul sito un “Piano di miglioramento del sito” che mostri, per ciascuna delle 6 metriche che impatta negativamente le prestazioni, le azioni future di miglioramento e le relative tempistiche di realizzazione attese. RIFERIMENTI TECNICI E NORMATIVI: [Docs Italia, documentazione Modello Comuni](https://docs.italia.it/italia/designers-italia/design-comuni-docs/) |

## Tecnologie

PA Website Validator utilizza le seguenti tecnologie

- [Node.js] - Javascript runtime
- [npm] - Gestore di pacchetti
- [Lighthouse] - Libreria principale estesa per l'esecuzione degli audit
- [Typescript] - Linguaggio di programmazione fortemente tipizzato che si basa su JavaScript

## Requirements

PA Website Validator necessita [Node.js](https://nodejs.org/it/) v16+ (LTS), [npm] e [Google Chrome](https://www.google.com/chrome/).

## Plugins

PA Website validator utilizza le seguenti dipendenze esterne principali

| Plugin              | Repository                        |
| ------------------- | --------------------------------- |
| Lighthouse          | [GitHub][lighthouse-url]          |
| Yargs               | [GitHub][yargs-url]               |
| Puppeteer           | [GitHub][puppeteer-url]           |
| Cheerio             | [GitHub][cheerio-url]             |
| JSDOM               | [GitHub][jsdom-url]               |
| Geo Ip              | [GitHub][geoip-url]               |
| Get SSL Certificate | [GitHub][get-ssl-certificate-url] |

## Installazione tramite build

Per l'installazione tramite build, partire dalla repository ed effettuare il clone, poi:

```sh
cd pa-website-validator
npm install
npm run prepare
```

Viene generata la folder "dist", utilizzo:

```sh
node dist --type <type> --destination <folder> --report <report_name> --website <url> --scope <local|online [online]> --view
```

Esempio:

```bash
node dist --type school --destination ~/pa-italia-crawler-reports --report myreport --website https://www.ismonnet.edu.it/ --scope online --view
```

## Installazione globale

Per l'installazione in locale partendo dalla repository effettuare il clone, poi:

```sh
cd pa-website-validator
npm install
npm install -g ./
```

NB: Potrebbe essere necessario riavviare la shell/terminale per la propagazione del comando e la pulizia della cache npm:

```sh
npm cache clean
```

## Utilizzo

Comando:

```bash
pa-website-validator --type <type> --destination <folder> --report <report_name> --website <url> --scope <local|online [online]> --view
```

Esempio:

```bash
pa-website-validator --type school --destination ~/pa-italia-crawler-reports --report myreport --website https://www.ismonnet.edu.it/ --scope online --view
```

Mappa opzioni comando
| Parametro Comando | Descrizione | Obbligatorio | Possibili valori | Default
| ------ | ------ | ------ | ------ | ------ |
| - -help | Mostra la mappa comando | ❌ | |
| - -version | Versione del pacchetto | ❌ | |
| - -type | Tipologia di crawler da lanciare | ✅ | "municipality""school"| |
| - -detination | Folder dove salvare la reportistica | ✅ |
| - -report | Nome da assegnare al report | ✅ | |
| - -website | Url sito web da analizzare | ✅ | |
| - -scope | Scope di esecuzione | ❌ | "local" "online" | "online" |
| - -view | Visualizzazione istantanea report | ❌ |

> `--type` indica quale tipologia di sito web viene passato da ispezionare (comunale o scolastico).

> `--scope` indica la tipologia di audit da eseguire:

- `local` se il tool è lanciato su un sito web hostato in locale: esegue tutti gli audit che lavorano sulla struttura del sito ispezionato e mostra dei messaggi informativi per alcuni audit che non producono risultati se eseguiti in un ambiente locale.
- `online` esegue tutti gli audit disponibili.

> `--view` se passato al comandoalla fine dell'auditing lancia un'istanza di chrome che mostra automaticamente la reportistica generata.

[lighthouse]: https://www.npmjs.com/package/lighthouse
[node.js]: http://nodejs.org
[npm]: https://www.npmjs.com/
[typescript]: https://www.typescriptlang.org/
[repository]: https://github.com/italia/pa-website-validator/
[yargs-url]: https://github.com/yargs/yargs
[lighthouse-url]: https://github.com/GoogleChrome/lighthouse
[puppeteer-url]: https://github.com/puppeteer/puppeteer
[cheerio-url]: https://github.com/cheeriojs/cheerio
[jsdom-url]: https://github.com/jsdom/jsdom
[geoip-url]: https://github.com/geoip-lite/node-geoip
[get-ssl-certificate-url]: https://github.com/johncrisostomo/get-ssl-certificate
