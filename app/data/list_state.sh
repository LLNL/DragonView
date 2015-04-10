#!/bin/bash

root=state

echo name,counters,jobs > runs-"$root".csv

path=$root/single
for d in $(ls $root/single); do
  for f in $(ls -r $root/single/$d/*.csv); do
    filename=`echo $f | sed 's/.*links-//' | sed 's/\.csv//'`
   # name=`echo "$f" | sed 's/-\([0-9][0-9]k\)/- \1/'`
    jobs=$root/placements/single/$filename
    echo $d/$filename,$f,$jobs >> runs-"$root".csv
  done
done



