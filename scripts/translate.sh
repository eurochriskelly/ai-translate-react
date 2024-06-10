#!/bin/bash
  
#gpt-3.5-turbo
#gpt-4

source ./env.sh
HERE=$(pwd)

cd /tmp/translations/

for f in $(ls *.json);do
  echo "Translating english version [$f]"
  node ${HERE}/src/generate-translations.js --filename "/tmp/translations/$f" --model "gpt-4" --lang "French" --no-clobber
done
