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
  dir=$type_it-$version-$os-$arch
  mkdir "$dir"
  npm run "bundle:$type_en$build_variant"
  mv "app-valutazione-$type_it$ext" "$dir"
  cp "docs/README-$type_it.html" "$dir/README.html"
  if [ $is_win == 0 ]; then
    zip -r "$dir.zip" "$dir"
  else
    7z a -tzip "$dir.zip" "$dir"
  fi
  rm -r "$dir"
done
