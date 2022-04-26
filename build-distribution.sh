#!/bin/bash

cp -rp ./package.json ./distribution &&
cp -rp ./package-lock.json ./distribution &&
cp -rp ./storage ./distribution &&
cp -rp ./README-distribution.md ./distribution/README.md &&
cp -rp ./.gitignore ./distribution/.gitignore &&
(cd ./distribution && npm install --production)