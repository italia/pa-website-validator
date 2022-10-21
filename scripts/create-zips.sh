#!/usr/bin/env bash

set -e

version=$(jq -r .version package.json)
os=$1
arch=$2

types_en=(
  municipality
  school
)

types_it=(
  comuni
  scuole
)

if [ "$os" == "Windows" ]; then
  build_variant=":windows"
  ext=".exe"
  is_win=1
else
  build_variant=""
  ext=""
  is_win=0
fi

for i in 0 1; do
  type_en=${types_en[$i]}
  type_it=${types_it[$i]}
  exe_filename=app-valutazione-$type_it$ext
  readme_filename=README.html
  zip_filename=$type_it-$version-$os-$arch.zip
  npm run "bundle:$type_en$build_variant"
  cp "docs/README-$type_it-$os.html" $readme_filename
  if [ $is_win == 0 ]; then
    zip "$zip_filename" "$exe_filename" $readme_filename
  else
    7z a -tzip "$zip_filename" "$exe_filename" $readme_filename
  fi
  rm "$exe_filename" $readme_filename
done
