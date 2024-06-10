#!/bin/bash
  
#gpt-3.5-turbo
#gpt-4

source ./env.sh
HERE=$(pwd)

mkdir -p /tmp/translations/English
mkdir -p /tmp/translations/French

cd /tmp/translations/English
lang=French

for f in $(ls *.json);do
  echo "Translating english version [$f]"
  node ${HERE}/src/generate-translations.js --filename "/tmp/translations/English/$f" --model "gpt-4" --lang "$lang" --no-clobber
done

mv /tmp/translations/English/*-French.json /tmp/translations/French/
