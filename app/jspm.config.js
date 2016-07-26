SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "github:": "jspm_packages/github/",
    "dragonview/": "src/"
  },
  browserConfig: {
    "baseURL": "/"
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.12"
    }
  },
  transpiler: "plugin-babel",
  packages: {
    "dragonview": {
      "main": "app.js",
      "format": "esm",
      "meta": {
        "*.js": {
          "loader": "plugin-babel"
        }
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  map: {
    "assert": "github:jspm/nodelibs-assert@0.2.0-alpha",
    "buffer": "github:jspm/nodelibs-buffer@0.2.0-alpha",
    "child_process": "github:jspm/nodelibs-child_process@0.2.0-alpha",
    "constants": "github:jspm/nodelibs-constants@0.2.0-alpha",
    "crypto": "github:jspm/nodelibs-crypto@0.2.0-alpha",
    "d3": "npm:d3@4.1.1",
    "dgram": "github:jspm/nodelibs-dgram@0.2.0-alpha",
    "dns": "github:jspm/nodelibs-dns@0.2.0-alpha",
    "ecc-jsbn": "npm:ecc-jsbn@0.1.1",
    "events": "github:jspm/nodelibs-events@0.2.0-alpha",
    "fs": "github:jspm/nodelibs-fs@0.2.0-alpha",
    "html": "github:Hypercubed/systemjs-plugin-html@0.0.8",
    "http": "github:jspm/nodelibs-http@0.2.0-alpha",
    "https": "github:jspm/nodelibs-https@0.2.0-alpha",
    "jodid25519": "npm:jodid25519@1.0.2",
    "jsbn": "npm:jsbn@0.1.0",
    "lockr": "github:tsironis/lockr@0.8.4",
    "net": "github:jspm/nodelibs-net@0.2.0-alpha",
    "os": "github:jspm/nodelibs-os@0.2.0-alpha",
    "path": "github:jspm/nodelibs-path@0.2.0-alpha",
    "process": "github:jspm/nodelibs-process@0.2.0-alpha",
    "punycode": "github:jspm/nodelibs-punycode@0.2.0-alpha",
    "querystring": "github:jspm/nodelibs-querystring@0.2.0-alpha",
    "stream": "github:jspm/nodelibs-stream@0.2.0-alpha",
    "string_decoder": "github:jspm/nodelibs-string_decoder@0.2.0-alpha",
    "text": "github:systemjs/plugin-text@0.0.8",
    "timers": "github:jspm/nodelibs-timers@0.2.0-alpha",
    "tls": "github:jspm/nodelibs-tls@0.2.0-alpha",
    "tsironis/lockr": "github:tsironis/lockr@0.8.4",
    "tty": "github:jspm/nodelibs-tty@0.2.0-alpha",
    "tweetnacl": "npm:tweetnacl@0.13.3",
    "url": "github:jspm/nodelibs-url@0.2.0-alpha",
    "util": "github:jspm/nodelibs-util@0.2.0-alpha",
    "vm": "github:jspm/nodelibs-vm@0.2.0-alpha",
    "zlib": "github:jspm/nodelibs-zlib@0.2.0-alpha"
  },
  packages: {
    "npm:d3@4.1.1": {
      "map": {
        "d3-array": "npm:d3-array@1.0.0",
        "d3-axis": "npm:d3-axis@1.0.0",
        "d3-hierarchy": "npm:d3-hierarchy@1.0.0",
        "d3-request": "npm:d3-request@1.0.1",
        "d3-timer": "npm:d3-timer@1.0.1",
        "d3-time-format": "npm:d3-time-format@2.0.0",
        "d3-collection": "npm:d3-collection@1.0.0",
        "d3-dsv": "npm:d3-dsv@1.0.0",
        "d3-queue": "npm:d3-queue@3.0.1",
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "d3-brush": "npm:d3-brush@1.0.1",
        "d3-chord": "npm:d3-chord@1.0.0",
        "d3-path": "npm:d3-path@1.0.0",
        "d3-color": "npm:d3-color@1.0.0",
        "d3-ease": "npm:d3-ease@1.0.0",
        "d3-voronoi": "npm:d3-voronoi@1.0.1",
        "d3-quadtree": "npm:d3-quadtree@1.0.0",
        "d3-polygon": "npm:d3-polygon@1.0.0",
        "d3-random": "npm:d3-random@1.0.0",
        "d3-interpolate": "npm:d3-interpolate@1.1.0",
        "d3-shape": "npm:d3-shape@1.0.0",
        "d3-format": "npm:d3-format@1.0.0",
        "d3-drag": "npm:d3-drag@1.0.0",
        "d3-force": "npm:d3-force@1.0.0",
        "d3-zoom": "npm:d3-zoom@1.0.2",
        "d3-geo": "npm:d3-geo@1.1.1",
        "d3-time": "npm:d3-time@1.0.0",
        "d3-scale": "npm:d3-scale@1.0.1",
        "d3-selection": "npm:d3-selection@1.0.0",
        "d3-transition": "npm:d3-transition@1.0.0"
      }
    },
    "npm:d3-request@1.0.1": {
      "map": {
        "d3-collection": "npm:d3-collection@1.0.0",
        "d3-dsv": "npm:d3-dsv@1.0.0",
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "xmlhttprequest": "npm:xmlhttprequest@1.8.0"
      }
    },
    "npm:d3-time-format@2.0.0": {
      "map": {
        "d3-time": "npm:d3-time@1.0.0"
      }
    },
    "npm:d3-brush@1.0.1": {
      "map": {
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "d3-drag": "npm:d3-drag@1.0.0",
        "d3-interpolate": "npm:d3-interpolate@1.1.0",
        "d3-selection": "npm:d3-selection@1.0.0",
        "d3-transition": "npm:d3-transition@1.0.0"
      }
    },
    "npm:d3-chord@1.0.0": {
      "map": {
        "d3-array": "npm:d3-array@1.0.0",
        "d3-path": "npm:d3-path@1.0.0"
      }
    },
    "npm:d3-shape@1.0.0": {
      "map": {
        "d3-path": "npm:d3-path@1.0.0"
      }
    },
    "npm:d3-force@1.0.0": {
      "map": {
        "d3-collection": "npm:d3-collection@1.0.0",
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "d3-quadtree": "npm:d3-quadtree@1.0.0",
        "d3-timer": "npm:d3-timer@1.0.1"
      }
    },
    "npm:d3-interpolate@1.1.0": {
      "map": {
        "d3-color": "npm:d3-color@1.0.0"
      }
    },
    "npm:d3-drag@1.0.0": {
      "map": {
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "d3-selection": "npm:d3-selection@1.0.0"
      }
    },
    "npm:d3-zoom@1.0.2": {
      "map": {
        "d3-selection": "npm:d3-selection@1.0.0",
        "d3-transition": "npm:d3-transition@1.0.0",
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "d3-drag": "npm:d3-drag@1.0.0",
        "d3-interpolate": "npm:d3-interpolate@1.1.0"
      }
    },
    "npm:d3-geo@1.1.1": {
      "map": {
        "d3-array": "npm:d3-array@1.0.0"
      }
    },
    "npm:d3-dsv@1.0.0": {
      "map": {
        "rw": "npm:rw@1.3.2"
      }
    },
    "npm:d3-scale@1.0.1": {
      "map": {
        "d3-array": "npm:d3-array@1.0.0",
        "d3-collection": "npm:d3-collection@1.0.0",
        "d3-color": "npm:d3-color@1.0.0",
        "d3-format": "npm:d3-format@1.0.0",
        "d3-interpolate": "npm:d3-interpolate@1.1.0",
        "d3-time": "npm:d3-time@1.0.0",
        "d3-time-format": "npm:d3-time-format@2.0.0"
      }
    },
    "npm:d3-transition@1.0.0": {
      "map": {
        "d3-color": "npm:d3-color@1.0.0",
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "d3-ease": "npm:d3-ease@1.0.0",
        "d3-interpolate": "npm:d3-interpolate@1.1.0",
        "d3-selection": "npm:d3-selection@1.0.0",
        "d3-timer": "npm:d3-timer@1.0.1"
      }
    },
    "github:jspm/nodelibs-buffer@0.2.0-alpha": {
      "map": {
        "buffer-browserify": "npm:buffer@4.7.1"
      }
    },
    "github:jspm/nodelibs-url@0.2.0-alpha": {
      "map": {
        "url-browserify": "npm:url@0.11.0"
      }
    },
    "npm:buffer@4.7.1": {
      "map": {
        "base64-js": "npm:base64-js@1.1.2",
        "isarray": "npm:isarray@1.0.0",
        "ieee754": "npm:ieee754@1.1.6"
      }
    },
    "github:jspm/nodelibs-http@0.2.0-alpha": {
      "map": {
        "http-browserify": "npm:stream-http@2.3.0"
      }
    },
    "npm:url@0.11.0": {
      "map": {
        "punycode": "npm:punycode@1.3.2",
        "querystring": "npm:querystring@0.2.0"
      }
    },
    "npm:stream-http@2.3.0": {
      "map": {
        "xtend": "npm:xtend@4.0.1",
        "readable-stream": "npm:readable-stream@2.1.4",
        "inherits": "npm:inherits@2.0.1",
        "to-arraybuffer": "npm:to-arraybuffer@1.0.1",
        "builtin-status-codes": "npm:builtin-status-codes@2.0.0"
      }
    },
    "npm:readable-stream@2.1.4": {
      "map": {
        "isarray": "npm:isarray@1.0.0",
        "inherits": "npm:inherits@2.0.1",
        "process-nextick-args": "npm:process-nextick-args@1.0.7",
        "string_decoder": "npm:string_decoder@0.10.31",
        "util-deprecate": "npm:util-deprecate@1.0.2",
        "buffer-shims": "npm:buffer-shims@1.0.0",
        "core-util-is": "npm:core-util-is@1.0.2"
      }
    },
    "npm:ecc-jsbn@0.1.1": {
      "map": {
        "jsbn": "npm:jsbn@0.1.0"
      }
    },
    "npm:jodid25519@1.0.2": {
      "map": {
        "jsbn": "npm:jsbn@0.1.0"
      }
    },
    "github:jspm/nodelibs-string_decoder@0.2.0-alpha": {
      "map": {
        "string_decoder-browserify": "npm:string_decoder@0.10.31"
      }
    },
    "github:jspm/nodelibs-crypto@0.2.0-alpha": {
      "map": {
        "crypto-browserify": "npm:crypto-browserify@3.11.0"
      }
    },
    "npm:crypto-browserify@3.11.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "browserify-cipher": "npm:browserify-cipher@1.0.0",
        "browserify-sign": "npm:browserify-sign@4.0.0",
        "create-ecdh": "npm:create-ecdh@4.0.0",
        "diffie-hellman": "npm:diffie-hellman@5.0.2",
        "public-encrypt": "npm:public-encrypt@4.0.0",
        "create-hmac": "npm:create-hmac@1.1.4",
        "create-hash": "npm:create-hash@1.1.2",
        "pbkdf2": "npm:pbkdf2@3.0.4",
        "randombytes": "npm:randombytes@2.0.3"
      }
    },
    "github:jspm/nodelibs-stream@0.2.0-alpha": {
      "map": {
        "stream-browserify": "npm:stream-browserify@2.0.1"
      }
    },
    "npm:stream-browserify@2.0.1": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "readable-stream": "npm:readable-stream@2.1.4"
      }
    },
    "npm:browserify-sign@4.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "create-hmac": "npm:create-hmac@1.1.4",
        "inherits": "npm:inherits@2.0.1",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "parse-asn1": "npm:parse-asn1@5.0.0",
        "bn.js": "npm:bn.js@4.11.5",
        "elliptic": "npm:elliptic@6.3.1"
      }
    },
    "npm:public-encrypt@4.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "randombytes": "npm:randombytes@2.0.3",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "parse-asn1": "npm:parse-asn1@5.0.0",
        "bn.js": "npm:bn.js@4.11.5"
      }
    },
    "npm:create-hmac@1.1.4": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:diffie-hellman@5.0.2": {
      "map": {
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.5",
        "miller-rabin": "npm:miller-rabin@4.0.0"
      }
    },
    "github:jspm/nodelibs-os@0.2.0-alpha": {
      "map": {
        "os-browserify": "npm:os-browserify@0.2.1"
      }
    },
    "npm:create-hash@1.1.2": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "cipher-base": "npm:cipher-base@1.0.2",
        "sha.js": "npm:sha.js@2.4.5",
        "ripemd160": "npm:ripemd160@1.0.1"
      }
    },
    "npm:pbkdf2@3.0.4": {
      "map": {
        "create-hmac": "npm:create-hmac@1.1.4"
      }
    },
    "npm:browserify-cipher@1.0.0": {
      "map": {
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "browserify-des": "npm:browserify-des@1.0.0",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0"
      }
    },
    "npm:browserify-aes@1.0.6": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "create-hash": "npm:create-hash@1.1.2",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "cipher-base": "npm:cipher-base@1.0.2",
        "buffer-xor": "npm:buffer-xor@1.0.3"
      }
    },
    "npm:browserify-des@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "cipher-base": "npm:cipher-base@1.0.2",
        "des.js": "npm:des.js@1.0.0"
      }
    },
    "npm:browserify-rsa@4.0.1": {
      "map": {
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.5"
      }
    },
    "npm:create-ecdh@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.5",
        "elliptic": "npm:elliptic@6.3.1"
      }
    },
    "npm:parse-asn1@5.0.0": {
      "map": {
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "create-hash": "npm:create-hash@1.1.2",
        "pbkdf2": "npm:pbkdf2@3.0.4",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "asn1.js": "npm:asn1.js@4.8.0"
      }
    },
    "npm:evp_bytestokey@1.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "github:jspm/nodelibs-zlib@0.2.0-alpha": {
      "map": {
        "zlib-browserify": "npm:browserify-zlib@0.1.4"
      }
    },
    "npm:elliptic@6.3.1": {
      "map": {
        "bn.js": "npm:bn.js@4.11.5",
        "inherits": "npm:inherits@2.0.1",
        "brorand": "npm:brorand@1.0.5",
        "hash.js": "npm:hash.js@1.0.3"
      }
    },
    "npm:sha.js@2.4.5": {
      "map": {
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:cipher-base@1.0.2": {
      "map": {
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:miller-rabin@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.5",
        "brorand": "npm:brorand@1.0.5"
      }
    },
    "npm:browserify-zlib@0.1.4": {
      "map": {
        "readable-stream": "npm:readable-stream@2.1.4",
        "pako": "npm:pako@0.2.9"
      }
    },
    "npm:des.js@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:hash.js@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:asn1.js@4.8.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "bn.js": "npm:bn.js@4.11.5",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "github:jspm/nodelibs-punycode@0.2.0-alpha": {
      "map": {
        "punycode-browserify": "npm:punycode@1.4.1"
      }
    },
    "github:jspm/nodelibs-timers@0.2.0-alpha": {
      "map": {
        "timers-browserify": "npm:timers-browserify@1.4.2"
      }
    },
    "npm:timers-browserify@1.4.2": {
      "map": {
        "process": "npm:process@0.11.5"
      }
    },
    "github:Hypercubed/systemjs-plugin-html@0.0.8": {
      "map": {
        "webcomponentsjs": "github:webcomponents/webcomponentsjs@0.7.22"
      }
    }
  }
});
