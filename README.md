# Dragongly Visualization

Visualizing network performance counters of a dragonfly architecture on a supercomputer


### Instalation
* Download and install [nodejs](https://nodejs.org "Title")
* Install bower
Note: '-g' means global installation and on osx must be run as sudo. You can install bower locally without the '-g'
```
  $ npm install -g bower
```
* Install the libraries
```
  $ bower install
```

### Data
Each run should have two file:
####counters.csv (header:sg,sr,sg,dg,dr,dc,color,counter1,counter2,..)
Each row describes a link: *src group, src row, src col, dest group, dest row, dest col, link color, \[counter, ...\]*

####jobs.csv (header: g,r,c,n,core,jobid)

#### runs.csv (header: name,counters,jobs)
One row per run including a name and paths to counters and jobs files

### Running
Start a local server

  $ ./run

Open a browser and point it to localhost:8888
