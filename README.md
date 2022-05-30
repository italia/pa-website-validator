# ![developers.italia](https://avatars1.githubusercontent.com/u/15377824?s=36&v=4 "developers.italia") PA Website Validator

#### _Il crawler di validazione della pubblica amministrazione_

PA Website validator è un tool che integra la libreria [Lightouse][lighthouse] esponendo test custom per la validazione dei siti web di scuole & comuni.

## Funzionalità

- Possibilità di utilizzare il pacchetto come dipendenza global eseguendolo come cli-application.
- Possibilità di integrare il pacchetto come dipendenza NPM in progetti terzi.
- Possibilità di lanciare l'auditing su un sito web online o in locale.

## Test eseguiti

| Test                            | Descrizione                                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Performance                     | Test nativo di Lighthouse per la valutazione delle performances                                                                                              |
| Accessibility                   | Test nativo di Lighthouse per evidenziare opportunità di miglioramento dell'accessibilità del sito web                                                       |
| Best Practise                   | Test nativo di Lighthouse per la verifica dell'utilizzo di alcune best practise nel codice                                                                   |
| SEO                             | Test nativo di Lighthouse per verificare che il sito web stia seguendo i consigli di base per l'ottimizzazione dei motori di ricerca                         |
| Sicurezza                       | Serie di test custom per controllare i parametri di sicurezza: informazioni sull'HTTPS, sul TLS e localizzazione                                             |
| Consistenza UX/UI               | Serie di test custom per controllare il rispetto della UX/UI: controlla i font, la versione di bootstrap e che venga utilizzato il tema corretto             |
| Normativa                       | Serie di test custom per controllare la presenza della Privacy Policy, della Dichiarazione di Accessibilità e che vengano rispettate le normative sui cookie |
| Architettura delle informazioni | Serie di test custom per controllare la consistenza dell'architettura delle informazioni (ad es: corretta formattazione dei menù)                            |

## Tecnologie

PA Website Validator utilizza le seguenti tecnologie

- [Node.js] - Javascript runtime
- [npm] - Gestore di pacchetti
- [Lighthouse] - Libreria principale estesa per l'esecuzione degli audit
- [Typescript] - Linguaggio di programmazione fortemente tipizzato che si basa su JavaScript

## Build

Per l'installazione in locale partendo dalla repository effettuare prima la build del pacchetto:

```sh
cd pa-website-validator
npm install
npm run build
```

## Installazione

PA Website Validator necessita [Node.js](https://nodejs.org/it/) v16+ (LTS), [npm] e [Google Chrome](https://www.google.com/chrome/).

Installazione locale:

```sh
cd pa-website-validator/distribution
npm install
npm install -g ./
```

NB: Potrebbe essere necessario riavviare la shell/terminale per la propagazione del comando e la pulizia della cache npm:

```sh
npm cache clean
```

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

## Utilizzo

Comando:

```bash
pa-website-validator --type <type> --destination <folder> --report <report_name> --website <url> --scope <local|online|local-information-architecture|online-information-architecture[online]> --view <yes|no[no]>
```

Esempio:

```bash
pa-website-validator --type school --destination ~/pa-italia-crawler-reports --report myreport --website https://www.ismonnet.edu.it/ --scope online --view yes
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
| - -view | Visualizzazione istantanea report | ❌ | "Yes", "No" | "No" |

> `--type` indica quale tipologia di sito web viene passato da ispezionare (comunale o scolastico).
> `--scope` indica la tipologia di audit da eseguire:

- `local` se il tool è lanciato su un sito web hostato in locale: esegue solo alcuni audit specifici.
- `online` esegue tutti gli audit disponibili.
  > `--view` se impostato su `Yes` alla fine dell'auditing lancia un'istanza di chrome che mostra automaticamente la reportistica generata.

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
