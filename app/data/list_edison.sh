#!/usr/bin/env bash
for f in $(ls -d edison/*/standard); do
  echo '{'`sed 's/^[^:]*: \([0-9]*\).*size: \([0-9]*\).*/\2-\1/' $f/catalog.yaml | head -1`'}',$f/dnd_net_counters.csv,$f/dnd_jobs.csv >> runs.csv;
done
