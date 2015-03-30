#!/usr/bin/env bash
for f in $(find sim/comm-graphs/ -name "*k"); do
  echo $f
  echo 'from,to,bytes' > $f.csv
  sed 's/ /,/g' $f >> $f.csv
done