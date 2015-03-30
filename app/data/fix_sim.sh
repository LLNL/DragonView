#!/usr/bin/env bash

dir=sim/simulations/single/placements
for f in $(ls $dir); do
  cat header  > $dir/$f.csv
  sed 's/ /,/g' $dir/$f >> $dir/$f.csv
done