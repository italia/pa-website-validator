Fill a file with expected test results with the format shown in `expected-results.example.csv`; the header contains the comma-separated list of audits to check. Then run:

```shell-session
npx tsc -p tsconfig.test.json
node test --type school --expected test/school-expected-result.csv
```
