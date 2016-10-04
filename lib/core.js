'use strict';
const exec = require('child_process').exec;
const notifier = require('node-notifier');

function sh(cmd, exitOnError, cb) {
  const child = exec(cmd, { encoding: 'utf8' });
  let stdout = '';
  child.stdout.on('data', (data) => {
    stdout += data;
    process.stdout.write(data);
  });
  child.stderr.on('data', (data) => {
    process.stdout.write(data);
  });
  child.on('close', (code) => {
    if (code > 0) {
      if (exitOnError) {
        if (typeof cb === 'function') {
          cb(new Error(`Error with code ${code} after running: ${cmd}`));
        } else {
          console.log(`'Error with code ${code} after running: ${cmd}`);
          process.exit(code);
        }
      } else {
        notifier.notify({
          title: cmd,
          message: stdout,
          sound: true,
        });
      }
    }
    if (typeof cb === 'function') cb();
  });
}

module.exports = {
  sh,
};
