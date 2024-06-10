#!/bin/bash

source ./env.sh
HERE=$(pwd)
cd ../gaelic-cup-planner/src/frontend
mkdir -p /tmp/translations

for f in $(find . -name "index.jsx");do
  # get the prefix
  node ${HERE}/src/extract-lang-strings.js --filename $f 
done
exit 0


if [ -f "test/sample.jsx.json" ];then
  cat test/sample.jsx.json
else
  echo "could not file json file"
fi

