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
        prompt.start();
        prompt.get([{
                name: 'service',
                description: 'New Service Name',
                type: 'string',
                default: service,
            }, {
                name: 'port',
                description: 'New Service Port',
                type: 'number',
                default: '3000',
            }, {
                name: 'script',
                description: 'New Service Script',
                type: 'string',
                default: 'Server.js',
            }, {
                name: 'user',
                description: 'New Service User',
                type: 'string',
                default: 'nobody',
            }, {
                name: 'bin',
                description: 'New Service Interpretter',
                type: 'string',
                default: 'node',
            },

        ], function(e, result) {
            dir = '/service/' + result.service;
            mkdirp(dir, function(err) {
                if (err && (err.code == 'EACCES' || err.code == 'ENOENT')) {
                    console.log(cls.red('Failure to create directory ' + dir));
                    process.exit();
                } else if (err) throw err;
                setTimeout(function() {
                    mkdirp(dir + '/log/main', function(err) {
                        var run = '#!/bin/sh\n' +
                            'export PORT="' + result.port + '"\n' +
                            'export USER="' + result.user + '"\n' +
                            'export BIN="' + result.bin + '"\n' +
                            'export SCRIPT="' + result.script + '"\n' +
                            'cd ' + dir + '\n' +
                            'exec setuidgid ${USER} ${BIN} ./${SCRIPT} 2>&1';
                        var log = '#!/bin/sh\n' +
                            'export RUN_AS="root"\n' +
                            'mkdir ./main 2>/dev/null\n' +
                            'exec setuidgid ${RUN_AS} multilog t ./main\n';
                        var bin = '#!/usr/bin/env node\n' +
                            'var fs = require(\'fs\');\nconsole.log(\'Testing...\');\nsetTimeout(function(){}, 5000);\n';
                        fs.writeFileSync(dir + '/run', run, {
                            mode: '0755'
                        });
                        fs.writeFileSync(dir + '/' + result.script, bin, {
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