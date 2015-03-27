#!/bin/bash
echo name,counters,jobs > runs.csv
path=sim/simulations/single
for d in $(ls -r $path); do
  if [ "$d" != 'placements' ]; then
    for f in $(ls -r $path/$d); do
      jobs=$path/placements/`echo $f | sed 's/-/./'`.csv
      counters=$(ls $path/$d/$f/*.csv)
      echo $d/$f,$counters,$jobs >> runs.csv
    done
  fi
done

for f in $(ls -d edison/*/standard); do
  echo edi/`sed 's/^[^:]*: \([0-9]*\).*size: \([0-9]*\).*/\2-\1/' $f/catalog.yaml | head -1`,$f/dnd_net_counters.csv,$f/dnd_jobs.csv >> runs.csv;
done

