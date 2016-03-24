__author__ = 'yarden'

import os
import re
import csv
from sys import argv
from collections import namedtuple
import yaml

from utils.eyaml import eyaml_load

NodeCoord = namedtuple('NodeCoord', 'group row col node')

MPI_PATTERN = '.*\.mpiP'
PROC_PATTERN = 'xtdb2proc'
QSTAT_PATTERN = 'qstat.*before'
NETTILE_PATTERN = 'networktiles.yaml'
PROCTILE_PATTERN = 'proctiles.yaml'

COUNTERS_OUT = 'dnd_net_counters.csv'
JOBS_OUT = 'dnd_jobs.csv'

jobid = None
mpirank = []
nodes = {}
topology = {}
dir_name = None

edison_pattern = re.compile('l(\d)(\d).(\d+):(\d+):(\d+)')


def dump(path):
    global jobid, files, mpirank, nodes, topology, dir_name

    jobid = None
    mpirank = []
    nodes = {}
    topology = {}

    dir_name = path
    print path
    files = os.listdir(dir_name)
    # sig = os.path.basename(dir_name)
    # if string.digits.find(sig[0]) == -1:
    #     sig = os.path.basename(os.path.dirname(dir_name))

    load_topology()
    jobid = parse_job()
    parse_mpi()
    parse_proc()
    parse_net()
    parse_qstat()
    write_jobs()


def parse(field):
    m = edison_pattern.search(field)
    if m is None:
        return None
    return int(m.group(3)),  int(m.group(4)), int(m.group(5)), int(m.group(1))*8+int(m.group(2))


def load_topology():
    with open('assets/interconnect.txt') as r:
        for line in r:
            fields = line.strip().split()
            color = fields[1][0] if fields[1] != 'black' else 'k'
            if color != 'p' and fields[3] != 'unused':
                sg, sr, sc, sp = parse(fields[0])
                dg, dr, dc, dp = parse(fields[3])
                topology[(sg, sr, sc, sp)] = (dg, dr, dc, color)


def find_file(pattern):
    for filename in files:
        if re.match(pattern, filename):
            return local(filename)
    raise IOError('file not found: '+pattern)


def local(name):
    return os.path.join(dir_name, name)


def find_line(f, text):
    while True:
        line = f.readline()
        if line == '':
            raise IOError('reached EOF while searching for '+text)
        if line.startswith(text):
            return line


def physical_to_logical(row, col, cage, slot, cpu):
    return NodeCoord(row*4+col/2, cage+(col % 2)*3, slot, cpu)


def mpirank_to_router(rank):
        (g, r, c, n) = nodes[mpirank[rank]][1]
        return g, r, c


# def parse_job():
#     filename = find_file(NETTILE_PATTERN)
#     ignore, meta, net = eyaml_load(filename)
#     job = meta['jobid']
#     job = job[:job.index('.')]
#     return job

def parse_job():
    filename = find_file(NETTILE_PATTERN)
    with open(filename, 'r') as f:
        loader = yaml.SafeLoader(f)
        key = loader.get_data()
        meta = loader.get_data()
        job = meta[0]['jobid']
        job = job[:job.index('.')]
        return job

def parse_mpi():
    with open(find_file(MPI_PATTERN), 'r') as f:
        # parse mpi tasks
        line = find_line(f, '@ MPI Task Assignment')
        while line.startswith('@ MPI Task Assignment'):
            rank, nid = line[line.index(':') + 1:].strip().split(' ')
            mpirank.append(str(int(nid[3:])))
            line = f.readline()


def parse_qstat():
    # jobs = []
    with open(find_file(QSTAT_PATTERN), 'r') as f:
        for i in range(5):
            next(f)

        status = None
        jid = None
        for line in f:
            line = line.strip()
            if not line.startswith('+'):
                fields = line.split()

                status = fields[9]
                if status is 'R':
                    jid = fields[0][:fields[0].index('.')]
                    job = (jid, fields[3], int(fields[5]))
                    # jobs.append(job)
                    parse_node_list(fields[11], jid)
            elif status is 'R':
                # a continuation line
                parse_node_list(line, jid)

    # return sorted(jobs, key=lambda j: j.count, reverse=True)


def parse_node_list(line, jid):
    fields = line.split('+')
    for pair in fields:
        if pair is not '':
            nid = pair.split('/')[0]
            node = nodes[nid]
            if node[3] == '':
                nodes[nid] = (node[0], node[1], node[2], jid)


def parse_proc():
    with open(find_file(PROC_PATTERN), 'r') as f:
        for i in range(7):
            next(f)

        for line in f:
            fields = line.strip().split(',')

            node = int(fields[0].split('=')[1])
            slot = int(fields[1].split('=')[1])
            cage = int(fields[2].split('=')[1])
            col = int(fields[4].split('=')[1])
            row = int(fields[5].split('=')[1])

            # print (row,col,cage,slot, node), 'g:', row*4+col/2
            status = fields[11].split('=')[1].split('\'')[1]
            # node_type = fields[12].split('=')[1].split('\'')[1]
            node_id = fields[14].split('=')[1]

            nodes[node_id] = (node_id, physical_to_logical(row, col, cage, slot, node), status, '')


counters_mapping = [
    ['flits', None],
    ['stalls', None],
    ['stalls/flit', None],
    ['flits_vc_0',  'INQ_PRF_INCOMING_FLIT_VC0'],
    ['flits_vc_1',  'INQ_PRF_INCOMING_FLIT_VC1'],
    ['flits_vc_2',  'INQ_PRF_INCOMING_FLIT_VC2'],
    ['flits_vc_3',  'INQ_PRF_INCOMING_FLIT_VC3'],
    ['flits_vc_4',  'INQ_PRF_INCOMING_FLIT_VC4'],
    ['flits_vc_5',  'INQ_PRF_INCOMING_FLIT_VC5'],
    ['flits_vc_6',  'INQ_PRF_INCOMING_FLIT_VC6'],
    ['flits_vc_7',  'INQ_PRF_INCOMING_FLIT_VC7'],
    ['stalls_vc_0', 'INQ_PRF_INCOMING_PKT_VC0_FILTER_FLIT0_CNT'],
    ['stalls_vc_1', 'INQ_PRF_INCOMING_PKT_VC1_FILTER_FLIT1_CNT'],
    ['stalls_vc_2', 'INQ_PRF_INCOMING_PKT_VC2_FILTER_FLIT2_CNT'],
    ['stalls_vc_3', 'INQ_PRF_INCOMING_PKT_VC3_FILTER_FLIT3_CNT'],
    ['stalls_vc_4', 'INQ_PRF_INCOMING_PKT_VC4_FILTER_FLIT4_CNT'],
    ['stalls_vc_5', 'INQ_PRF_INCOMING_PKT_VC5_FILTER_FLIT5_CNT'],
    ['stalls_vc_6', 'INQ_PRF_INCOMING_PKT_VC6_FILTER_FLIT6_CNT'],
    ['stalls_vc_7', 'INQ_PRF_INCOMING_PKT_VC7_FILTER_FLIT7_CNT'],
    ['stalls/flit_0', None],
    ['stalls/flit_1', None],
    ['stalls/flit_2', None],
    ['stalls/flit_3', None],
    ['stalls/flit_4', None],
    ['stalls/flit_5', None],
    ['stalls/flit_6', None],
    ['stalls/flit_7', None]
]


def convert_counters(counters, indices):
    values = [counters[i] if i is not None else 0 for i in indices]
    values[0] = sum(values[3:11])
    values[1] = sum(values[11:19])
    values[2] = float(values[1])/values[0]
    for i in range(8):
        values[19+i] = float(values[11+i])/values[3+i] if values[3+i] > 0 else 0
    return values


def parse_net():
    try:
        filename = find_file(NETTILE_PATTERN)

        ignore, meta, net = eyaml_load(filename)
        net = net.reshape(len(net)/40, 40)

        header = ['sg', 'sr', 'sc', 'dg', 'dr', 'dc', 'color']
        # header.extend(list(net.dtype.names)[3:])
        header.extend([x[0] for x in counters_mapping])

        names = list(net.dtype.names)[3:]
        indices = [names.index(x[1]) if x[1] is not None else None for x in counters_mapping]

        with open(local(COUNTERS_OUT), 'w') as f:
            writer = csv.writer(f)
            writer.writerow(header)
            routers = set()
            i = 0
            for j in range(net.shape[0]):
                rank = net[j][0][0]
                rid = mpirank_to_router(rank)
                if rid not in routers:
                    routers.add(rid)
                    g, r, c = rid
                    for p in range(40):
                        key = (g, r, c, p)
                        # ignore empty counters (all 0) for non-existing links
                        if key in topology:
                            dg, dr, dc, color = topology[key]
                            row = [g, r, c, dg, dr, dc, color]
                            row.extend(convert_counters(list(net[j][p])[3:], indices))
                            writer.writerow(row)
    except IOError:
        print dir_name, 'missing tile files'


def write_jobs():
    map = {}
    with open(local(JOBS_OUT), 'w') as f:
        w = csv.writer(f)
        w.writerow(['g', 'r', 'c', 'n', 'job'])
        for i in mpirank:
            nid, coord, status, jid = nodes[i]
            if coord not in map:
                map[coord] = True
                g, r, c, n = coord
                w.writerow([g, r, c, n, jid])


# process dir
if len(argv) != 2:
    print 'Usage: ', argv[0], '<dir>'
    exit(255)

src = argv[1]
dirs = [os.path.join(src, d, 'standard') for d in os.listdir(src)]
[dump(d) for d in dirs]

