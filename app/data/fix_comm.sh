#!/usr/bin/env bash
for f in $(find edison/comm-graphs/); do
  echo $f
  echo 'from,to,bytes' > $f.csv
  sed 's/ /,/g' $f >> $f.csv
done