import os
from sys import argv

try:
    from SimpleHTTPServer import SimpleHTTPRequestHandler as Handler
    from SocketServer import TCPServer as Server
except ImportError:
    from http.server import SimpleHTTPRequestHandler as Handler
    from http.server import HTTPServer as Server

PORT = int(os.getenv('DRAGONVIEW_PORT', 8000))

DATA_DIR = 'sim'
if len(argv) == 2:
    DATA_DIR = argv[1]
#if DATA_DIR[-1:] != '/':
#    DATA_DIR += '/'

DATA_DIR = '/data/'+DATA_DIR


class MyHandler(Handler):
    def do_GET(self):
        print 'PATH: ', self.path[:5]
        if self.path[:5] == '/data':
            print 'path:', self.path
            self.path = DATA_DIR + self.path[5:]
            print 'new path:', self.path
        Handler.do_GET(self)

httpd = Server(("", PORT), MyHandler)
print 'Port %i \nDATA %s' % (PORT, DATA_DIR)
httpd.serve_forever()