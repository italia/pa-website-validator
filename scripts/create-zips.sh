#!/usr/bin/env bash

set -e

version=$1
os=$2
arch=$3

declare -A types=(
  [municipality]=comuni
  [school]=scuole
)

if [ "$os" == "Windows" ]; then
  ext=".exe"
else
  ext=""
fi

for type in "${!types[@]}"; do
  dir=${types[$type]}-$version-$os-$arch
  mkdir "$dir"
  npm run "bundle:$type"
  mv "app-valutazione-${types[$type]}$ext" "$dir"
  cp "README-${types[$type]}.md" "$dir/README.md"
  zip -r "$dir.zip" "$dir"
  rm -r "$dir"
done
