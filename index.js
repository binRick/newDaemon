#!/usr/bin/env node

var mkdirp = require('mkdirp'),
    cls = require('cli-color'),
    fs = require('fs'),
    service = process.argv[2] || 'none',
    dir = '/service/' + service,
    daemontools = require('daemontools');
daemontools.svstat(dir, function(err, stats) {
    if (err && err.code == 'ENOENT') {
        console.log(cls.yellow('Attempting Service Install'));
        mkdirp(dir + '/log/main', function(err) {
            if (err) console.error(err);
            var run = '#!/bin/sh' +
                'export PORT=3000' +
                'export USER=nobody' +
                'cd ' + dir + '' +
                'exec setugidlimit ${USER} node ./Server.js 2>&1';
            var log = '#!/bin/sh' +
                'export RUN_AS="nobody"' +
                'mkdir ./main 2>/dev/null' +
                'exec setuidgid ${RUN_AS} multilog t ./main';
            fs.writeFileSync(dir + '/run', run, {
                mode: '0755'
            });
            fs.writeFileSync(dir + '/log/run', run, {
                mode: '0755'
            });
            console.log(cls.green('Installed to ' + dir + '\n\n'));
        });
    } else {
        console.log(stats);
    }
});