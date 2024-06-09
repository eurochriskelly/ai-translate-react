#!/bin/bash

source ./env.sh
node src/extract-lang-strings.js --filename test/sample.jsx

if [ -f "test/sample.jsx.json" ];then
  cat test/sample.jsx.json
else
  echo "could not file json file"
fi

