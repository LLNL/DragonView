#!/bin/bash
find links/ -name "*.csv" | sed \
  -e 's/\(.*\/\)\([^\/]*\)/pushd \1; ln -s \2 \2Z; popd/'  \
  -e 's/links-\([^\.]*\)[^ ]*\(\-.\)\.csvZ/links-\1\2.csv/' \
  -e 's/links-\([^\.]*\)[^ ]*\.csvZ/links-\1.csv/' \
  -e 's/ \([^\.]*\)[^ ]*\(\-.\).csvZ/ \1\2.csv/' \
  -e 's/ \([^\.]*\)[^ ]*.csvZ/ \1.csv/'  > l

source l;
rm l
