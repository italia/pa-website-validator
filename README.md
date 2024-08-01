# ![developers.italia](https://avatars1.githubusercontent.com/u/15377824?s=36&v=4 "developers.italia") App di valutazione dell'adesione ai modelli

#### Un applicativo desktop a supporto degli sviluppatori che aiuta a valutare la qualità dei siti istituzionali dei Comuni e delle scuole e la corrispondenza a molti dei criteri di conformità della misura 1.4.1 del PNRR Esperienza del cittadino nei servizi pubblici digitali.

Le App di valutazione sono strumenti che integrano la libreria [Lighthouse][lighthouse] ed effettuano test per la verifica della corretta adesione al [modello Comuni][modello-comuni] e al [modello scuole][modello-scuole] di Designers Italia.

[Scopri di più sulle App di valutazione][docs-app-valutazione].

## Funzionalità

- Possibilità di lanciare l'auditing su un sito web online o in locale.
- Possibilità di utilizzare il pacchetto come dipendenza global eseguendolo come cli-application.
- Possibilità di integrare il pacchetto come dipendenza NPM in progetti terzi.

## Test del modello Scuole

| Test                                                                  | Descrizione                                                                                                                                                                                                                              |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Criteri di conformità                                                 | Vengono mostrati i risultati degli audit relativi ai [criteri di conformità del modello scuole][verifica-scuole].                                                                                                                        |
| Raccomandazioni progettuali                                           | Vengono mostrati i risultati degli audit relativi alle [raccomandazioni progettuali del modello scuole][verifica-scuole].                                                                                                                |
| Test aggiuntivi                                                       | Vengono mostrati i risultati di test standard forniti da lighthouse. Non sono rilevanti in termini di raggiungimento dei criteri di conformità, ma rappresentano comunque indicazioni utili a valutare eventuali miglioramenti del sito. |
| Raccomandazione progettuale "R.SC.3.1 - Velocità e tempi di risposta" | Viene mostrato il risultato del test relativo alla raccomandazione progettuale "R.SC.3.1 - Velocità e tempi di risposta" per il sito scolastico.                                                                                         |

## Test del modello Comuni

| Test                                                                              | Descrizione                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pacchetto Cittadino Informato: criterio "C.SI.4.1 - Velocità e tempi di risposta" | Viene mostrato il risultato del test relativo al criterio "C.SI.4.1 - Velocità e tempi di risposta" per il sito comunale.                                                                                                                |
| Pacchetto Cittadino Informato: criteri di conformità                              | Vengono mostrati i risultati degli audit relativi ai [criteri di conformità per il sito comunale][verifica-comuni].                                                                                                                      |
| Pacchetto Cittadino Attivo: criteri di conformità                                 | Vengono mostrati i risultati degli audit relativi ai [criteri di conformità per i servizi digitali comunali][verifica-comuni].                                                                                                           |
| Pacchetto Cittadino Informato: raccomandazioni progettuali                        | Vengono mostrati i risultati degli audit relativi alle [raccomandazioni progettuali per il sito comunale][verifica-comuni].                                                                                                              |
| Test aggiuntivi                                                                   | Vengono mostrati i risultati di test standard forniti da lighthouse. Non sono rilevanti in termini di raggiungimento dei criteri di conformità, ma rappresentano comunque indicazioni utili a valutare eventuali miglioramenti del sito. |

## Report e messaggi in console

L'applicazione genera un report in stile Lighthouse del risultato della valutazione, che viene mostrato nel browser. Inoltre nella console dove è stato lanciato il comando vengono mostrati in tempo reale dei messaggi relativi agli audit che l'applicazione sta conducendo in quel momento, inclusi messaggi di errore; in particolare, per ogni pagina che viene caricata appariranno messaggi del tipo:

```console
...
https://esempio.scuola.edu.it/novita/ 200
https://esempio.scuola.edu.it/didattica/ 200
...
```

che indicano il risultato del caricamento della pagina in questione ([200 = successo][codici-http]). Quest'informazione può essere usata per fare debug di un sito o dell'applicazione stessa.

## Tecnologie

PA Website Validator utilizza le seguenti tecnologie

- [Node.js] - Javascript runtime
- [npm] - Gestore di pacchetti
- [Lighthouse] - Libreria principale estesa per l'esecuzione degli audit
- [Typescript] - Linguaggio di programmazione fortemente tipizzato che si basa su JavaScript

## Requirements

PA Website Validator necessita [Node.js](https://nodejs.org/it/) v18+ (LTS), [npm] e [Google Chrome](https://www.google.com/chrome/).

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

## Installazione locale

Per l'installazione locale, una volta clonato il repository, eseguire:

```console
cd pa-website-validator
npm install
```

La directory `dist` sarà popolata con l’output del processo di build.

Utilizzo:

```console
node dist --type <type> --destination <folder> --report <report_name> --website <url> --scope <local|online> --view
```

Esempio:

```console
node dist --type school --destination ~/pa-italia-crawler-reports --report myreport --website https://www.ismonnet.edu.it/ --scope online --view --accuracy all
```

## Installazione globale

Una volta effettuata l’installazione globale sarà possibile usare il comando `pa-website-validator` dal terminale, senza dover entrare nella directory clonata. Questa è la procedura per installare il comando globalmente:

```console
cd pa-website-validator
npm install
npm install -g --install-links
```

**NB**: Potrebbe essere necessario riavviare la shell/terminale per la propagazione del comando e la pulizia della cache npm:

```console
npm cache clean
```

Utilizzo:

```console
pa-website-validator --type <type> --destination <folder> --report <report_name> --website <url> --scope <local|online> --view
```

Esempio:

```console
pa-website-validator --type school --destination ~/pa-italia-crawler-reports --report myreport --website https://www.ismonnet.edu.it/ --scope online --view --accuracy all
```

## Opzioni comando

| Parametro Comando | Descrizione                            | Obbligatorio | Possibili valori                  | Default     |
| ----------------- | -------------------------------------- | ------------ | --------------------------------- | ----------- |
| - -help           | Mostra la mappa comando                | ❌           |                                   |             |
| - -version        | Versione del pacchetto                 | ❌           |                                   |             |
| - -type           | Tipologia di crawler da lanciare       | ✅           | "municipality" "school"           |             |
| - -destination    | Folder dove salvare la reportistica    | ✅           |                                   |             |
| - -report         | Nome da assegnare al report            | ✅           |                                   |             |
| - -website        | Url sito web da analizzare             | ✅           |                                   |             |
| - -scope          | Scope di esecuzione                    | ❌           | "local" "online"                  | "online"    |
| - -view           | Visualizzazione istantanea report      | ❌           |                                   |             |
| - -accuracy       | Definisce la morbosità della scansione | ✅           | "min", "suggested", "high", "all" | "suggested" |

Note:

- `--type` indica quale tipologia di sito web viene passato da ispezionare (comunale o scolastico).

- `--scope` indica la tipologia di audit da eseguire:

  - `local` se il tool è lanciato su un sito web in ambiente locale: esegue tutti gli audit che lavorano sulla struttura del sito ispezionato e mostra dei messaggi informativi per alcuni audit che non producono risultati se eseguiti in un ambiente locale.
  - `online` esegue tutti gli audit disponibili.

- `--view` se passato al comando alla fine dell'auditing lancia un'istanza di chrome che mostra automaticamente la reportistica generata.
- `--accuracy` indica la precisione della scansione, definita come il numero di pagina analizzate:
  - `all` la scansione è effettuata su tutte le pagine disponibili.

[lighthouse]: https://www.npmjs.com/package/lighthouse
[node.js]: http://nodejs.org
[npm]: https://www.npmjs.com/
[typescript]: https://www.typescriptlang.org/
[yargs-url]: https://github.com/yargs/yargs
[lighthouse-url]: https://github.com/GoogleChrome/lighthouse
[puppeteer-url]: https://github.com/puppeteer/puppeteer
[cheerio-url]: https://github.com/cheeriojs/cheerio
[jsdom-url]: https://github.com/jsdom/jsdom
[geoip-url]: https://github.com/geoip-lite/node-geoip
[get-ssl-certificate-url]: https://github.com/johncrisostomo/get-ssl-certificate
[modello-comuni]: https://designers.italia.it/modello/comuni
[modello-scuole]: https://designers.italia.it/modello/scuole
[docs-app-valutazione]: https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs
[verifica-scuole]: https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/it/versione-attuale/requisiti-e-modalita-verifica-scuole.html
[verifica-comuni]: https://docs.italia.it/italia/designers-italia/app-valutazione-modelli-docs/it/versione-attuale/requisiti-e-modalita-verifica-comuni.html
[codici-http]: https://it.wikipedia.org/wiki/Codici_di_stato_HTTP
