#!/bin/bash
echo name,counters,jobs > runs.csv

for f in $(ls -r sim/simulations/single/2dstencil/); do
  name=`echo $f | sed 's/-/./'`
  counters=$(ls -r sim/simulations/single/2dstencil/$f/*.csv)
  echo $f,$counters,sim/simulations/single/placements/$name.csv >> runs.csv
done

for f in $(ls -d edison/*/standard); do
  echo `gsed 's/^[^:]*: \([0-9]*\).*size: \([0-9]*\).*/\2-\1/' $f/catalog.yaml | head -1`,$f/dnd_net_counters.csv,$f/dnd_jobs.csv >> runs.csv;
 done

