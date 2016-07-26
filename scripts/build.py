__author__ = 'yarden'

import os
import re
import csv
from sys import argv, maxsize
from collections import namedtuple, defaultdict
import sqlite3

TIMESTEP_PATTERN = re.compile('.*\.(\d+).csv')

NAME = 'Edison'
N_GROUPS = 15
N_ROWS = 6
N_COLS = 16
N_NODES = 4

config = [
    ('name', NAME),
    ('groups', N_GROUPS),
    ('rows', N_ROWS),
    ('cols', N_COLS),
    ('nodes', N_NODES)
]


links = {}
links_loaded = False
init_counters = False


def link_id_generator():
    n = 0
    while True:
        yield n
        n += 1

create_id = link_id_generator()


def get_link(line):
    key = tuple([int(x) for x in line[:6]])
    if links.has_key(key):
        link = links[key]
    else:
        link = (create_id.next(), line[6]) + key
        links[key] = link
    return link


def node_id(a):
    g = int(a[0])
    r = int(a[1])
    c = int(a[2])
    n = int(a[3])
    return ((g * N_ROWS + r) * N_COLS + c) * N_NODES + n


def is_job_file(name):
    return name.startswith('dnd_job')


def is_counter_file(name):
    return name.startswith('dnd_net_counters')


def get_timestep(name):
    return int(TIMESTEP_PATTERN.match(name).group(1))


def create_counters_table(header):
    names = [col.replace('/', '_per_') for col in header[7:]]
    cmd = '''create table counters (
        run_id integer,
        timestep integer,
        link_id integer
        '''
    for name in names:
        cmd +=  ', %s real' % name
    cmd += ')'
    c = conn.cursor()
    c.execute(cmd)

    c.execute('create table counters_names (name text)')
    c.executemany('insert into counters_names values (?)', [(name,) for name in names])
    conn.commit()


def load_counters(filename, run, timestep):
    global init_counters

    cmd = 'insert into counters values (?, ?, ?'
    c = conn.cursor()
    with open(filename, 'rb') as csvfile:
        f = csv.reader(csvfile)
        header = f.next()
        if init_counters:
            create_counters_table(header)
            init_counters = False

        for col in range(7, len(header)):
            cmd += ',?'
        cmd += ')'

        for line in f:
            link = get_link(line)
            counters = [run, timestep, link[0]] + line[7:]
            c.execute(cmd, counters)
    conn.commit()


def create_run_id(name):
    c = conn.cursor()
    c.execute('insert into runs values(null, ?, 0, 0)', [name])
    c.execute('select id from runs where name = ?', [name])
    return c.fetchone()[0]


def load_runs(runs):
    global start, end

    c = conn.cursor()
    for run in runs:
        name = os.path.basename(run)
        run_id = create_run_id(name)
        start = maxsize
        end = -1
        for name in os.listdir(run):
            filename = os.path.join(run, name)
            if is_job_file(name):
                t = get_timestep(name)
                load_job(filename, run_id, t)
            elif is_counter_file(name):
                t = get_timestep(name)
                load_counters(filename, run_id, t)
            else:
                continue
            if t < start:
                start = t
            if t > end:
                end = t
        c.execute('update runs set start=?, end=? where id = ?', (start, end, run_id))
    conn.commit()


def load_job(filename, run, timestep):
    c = conn.cursor()
    with open(filename, 'rb') as csvfile:
        f = csv.reader(csvfile)
        f.next()  # skip header
        for line in f:
            c.execute('insert into jobs values (?, ?, ?, ?)', (run, timestep, line[4], node_id(line[:4])))
    conn.commit()


def create_db(attrs):
    c = conn.cursor()

    c.execute('create table machine (attr text, value text)')
    c.executemany('insert into machine values (?, ?)', attrs)

    c.execute('create table runs (id integer primary key, name text, start integer, end integer)')

    c.execute('''create table links (
        id integer,
        type text,
        sg integer, sr integer, sc integer,
        dg integer, dr integer, dc integer)''')

    c.execute('''create table jobs (
        run_id integer,
        timestep integer,
        job_id text,
        node_id int)''')

    # c.execute('''create table counters (
    #         run_id text,
    #         timestep integer,
    #         link_id integer,
    #         name text,
    #         value real)
    #         ''')
    conn.commit()


def create_indices():
    c = conn.cursor()
    # c.execute('create index if not exists counters_run_idx on counters (run)')
    # c.execute('create index if not exists counters_run_timestep_idx on counters (run, timestep)')
    conn.commit()


def load_links():
    c = conn.cursor()
    c.execute('select * from links')
    for link in c.fetchall():
        links[link[2:]] = link


def save_links():
    c = conn.cursor()
    for key, link in links.items():
        c.execute('insert into links values (?, ?, ?, ?, ?, ?, ?, ?)', link)
    conn.commit()

# Main
if len(argv) < 3:
    print 'Usage:', argv[0], '<sqlite_file> <runs>'
    exit(255)

filename = argv[1]

exists = os.path.exists(filename)

if exists:
    os.remove(filename)
    exists = False


conn = sqlite3.connect(filename)

if not exists:
    create_db(config)
    init_counters = True
else:
    load_links()

load_runs(argv[2:])
if not exists:
    save_links()

create_indices()
conn.close()




