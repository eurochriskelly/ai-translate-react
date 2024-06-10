#!/bin/bash
  
#gpt-3.5-turbo
#gpt-4

source ./env.sh
HERE=$(pwd)
cd ../gaelic-cup-planner/src/frontend
mkdir -p /tmp/translations

for f in $(find . -name "index.jsx");do
  echo "Extracting strings for react file [$f]" 
  # get the prefix
  node ${HERE}/src/extract-lang-strings.js --filename $f --model "gpt-4" --no-clobber
done


