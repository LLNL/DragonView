__author__ = 'yarden'

import os
import csv
import re
from sys import argv
from collections import namedtuple, defaultdict

fields = ['flits', 'stalls', 'spf']
measures = ['min', 'max', 'avg']

Key = namedtuple('Key', 'group target')

class Field:
    def __init__(self):
        self.min = None
        self.max = None
        self.total = 0
        self.n = 0

    def add(self, value):
        value = float(value)
        if value == 0:
            return

        if self.n == 0:
            self.min = self.max = value
        elif value < self.min:
            self.min = value
        elif value > self.max:
            self.max = value
        self.total += value
        self.n += 1

    def get(self, name):
        if name == 'min':
            return self.min
        if name == 'max':
            return self.max
        if name == 'avg':
            return self.total/self.n
        return None

    def values(self):
        return [self.min, self.max, self.total/self.n]


class Record:
    def __init__(self):
        self.flits = Field()
        self.stalls = Field()
        self.spf = Field()

    def add(self, link):
        self.flits.add(link['flits'])
        self.stalls.add(link['stalls'])
        self.spf.add(link['stalls/flit'])

    def get(self, name):
        if name == 'flits':
            return self.flits
        if name == 'stalls':
            return self.stalls
        if name == 'spf':
            return self.spf
        return None

    def values(self):
        return self.flits.values() + self.stalls.values() + self.spf.values()


def filename(path, counter):
    return path+'dnd_net_counters.'+str(counter)+'.csv'


def get_counter_files(path):
    files = []
    for f in os.listdir(path):
        if re.search('counters.*\.csv', f) is not None:
            files.append(f)
    files.sort()
    return files


def format(s):
    if len(s) == 1:
        return '0'+s
    return s


def process(path):
    if path[-1:] != '/':
        path += '/'
    run = os.path.split(path[:-1])[1]
    re_counter = re.compile('.*counters.*\.(\d+)\.csv')

    with open(path + 'alldata.csv', 'w') as outcsv:
        w = csv.writer(outcsv)
        header = ['run','timestep', 'color', 'group', 'dest', 'counter', 'measure', 'value']
        w.writerow(header)
        for f in os.listdir(path):
            match = re_counter.match(f)
            if match:
                timestep = match.group(1)
                records = defaultdict(Record)
                with open(path+f, 'rb') as csvfile:
                    f = csv.DictReader(csvfile)
                    for link in f:
                        color = link['color']
                        if color == 'k':
                            key = (color, format(link['sg']), 'C'+format(link['sc']))
                        elif color == 'g':
                            key = (color, format(link['sg']), 'R'+format(link['sr']))
                        else:
                            key = (color, format(link['sg']), 'G'+format(link['dg']))
                        records[key].add(link)
                for key in records:
                    entry = records[key]
                    for field in fields:
                        for measure in measures:
                            w.writerow([run, timestep, key[0], key[1], key[2], field, measure, entry.get(field).get(
                                measure)])


if len(argv) != 2:
    print 'Usage:', argv[0], '<dir>'
    exit(255)

process(argv[1])