#!/usr/bin/env node

var fs = require('fs');

var daemontools = require('daemontools');

daemontools.svstat('/service/nginx', function(err, stats) {
    if (err) throw err;
    console.log(stats);
});