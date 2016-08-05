DragonView v1.0
===============

Dragonview is an interactive visual analytics tool to visualize the nodes and
links of a supercomputer that uses the dragonfly topology for its
interconnection network. It can be used to map different data such as number of
packets or bytes or stalls on the network links and job IDs or other on-node
metrics on the router or node.

### Build
* Download and install [nodejs](https://nodejs.org "Title")
* Install bower

Note: *"-g"* means global installation and on OSX must be run as sudo. You can install bower locally without the *"-g"*
```
npm install -g bower
```
* Install the libraries
```
bower install
```
### Run
```
./run
```
Open a browser and point it to localhost:8000

### Data
Each run should have two files:

##### counters.csv
Header: sg,sr,sg,dg,dr,dc,color,counter1,counter2,..

Each row describes a link: *src group, src row, src col, dest group, dest row,
dest col, link color, \[counter, ...\]*

##### jobs.csv
Header: g,r,c,n,core,jobid

##### runs.csv
Header: name,counters,jobs

One row per run including a name and paths to counters and jobs files

