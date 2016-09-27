'use strict';
var exec = require('child_process').exec;
var notifier = require('node-notifier');

function sh(cmd, exitOnError, cb) {
  var child = exec(cmd, {encoding: 'utf8'});
  var stdout = '';
  child.stdout.on ('data', function(data) {
    stdout += data;
    process.stdout.write(data);
  });
  child.stderr.on('data', function(data) {
    process.stdout.write(data);
  });
  child.on('close', function(code) {
    if (code > 0) {
      if (exitOnError){
        if (typeof cb === 'function') {
          cb(new Error('Error with code ' + code + ' after running: ' + cmd));
        } else {
          console.log('Error with code ' + code + ' after running: ' + cmd);
          process.exit(code);
        }
      } else {
        notifier.notify({
          title: cmd,
          message: stdout,
          sound: true
        });
      }
    }
    if (typeof cb === 'function') cb();
  });
}

module.exports = {
  sh: sh
};
