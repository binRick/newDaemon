#!/usr/bin/env node

var mkdirp = require('mkdirp'),
    cls = require('cli-color'),
    fs = require('fs'),
    service = process.argv[2] || 'none',
    dir = '/service/' + service,
    daemontools = require('daemontools');
var prompt = require('prompt');


daemontools.svstat(dir, function(err, stats) {
    if (err && err.code == 'ENOENT') {
        //        console.log(cls.yellow('Attempting Service Install to ' + dir + '. ok?'));
        prompt.start();

        prompt.get([{
            description: 'New Service Name',
            type: 'string',
            default: service,
        }, ], function(e, result) {
            mkdirp(dir, function(err) {
                if (err && (err.code == 'EACCES' || err.code == 'ENOENT')) {
                    console.log(cls.red('Failure to create directory ' + dir));
                    process.exit();
                } else if (err) throw err;
                setTimeout(function() {
                    mkdirp(dir + '/log/main', function(err) {
                        var run = '#!/bin/sh\n' +
                            'export PORT="3000"\n' +
                            'export USER="nobody"\n' +
                            'export SCRIPT="./Server.js"\n' +
                            'cd ' + dir + '\n' +
                            'exec setuidgid ${USER} ${SCRIPT} 2>&1';
                        var log = '#!/bin/sh\n' +
                            'export RUN_AS="root"\n' +
                            'mkdir ./main 2>/dev/null\n' +
                            'exec setuidgid ${RUN_AS} multilog t ./main\n';
                        var bin = '#!/usr/bin/env node\n' +
                            'var fs = require(\'fs\');\nconsole.log(\'Testing...\');';
                        fs.writeFileSync(dir + '/run', run, {
                            mode: '0755'
                        });
                        fs.writeFileSync(dir + '/Server.js', bin, {
                            mode: '0755'
                        });
                        fs.writeFileSync(dir + '/log/run', log, {
                            mode: '0755'
                        });
                        console.log(cls.green('Installed to ' + dir + '\n\n'));
                    });
                }, 250);
            });
        });
    } else {
        console.log(stats);
    }
});
