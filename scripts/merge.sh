#!/bin/bash
  
source ./env.sh
HERE=$(pwd)
cd /tmp/translations

for dir in $(ls -d */);do
  cd $dir
  node ${HERE}/src/merged-translation.js --jsonpath $(pwd) > "../translations-$(basename $dir).json"
  cd -
done

