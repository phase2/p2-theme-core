'use strict';
const exec = require('child_process').exec;
const notifier = require('node-notifier');

function sh(cmd, exitOnError, cb) {
  const child = exec(cmd, {
    encoding: 'utf8',
    timeout: 1000 * 60 * 3, // 3 min; just want to make sure nothing gets detached forever.
  });
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
          process.stdout.write(`Error with code ${code} after running: ${cmd} \n`);
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

/**
 * Flatten Array
 * @param arrayOfArrays {Array[]}
 * @returns {Array}
 */
function flattenArray(arrayOfArrays) {
  return [].concat.apply([], arrayOfArrays);
}

/**
 * Make an array unique by removing duplicate entries.
 * @param item {Array}
 * @returns {Array}
 */
function uniqueArray(item) {
  const u = {};
  const newArray = [];
  for (let i = 0, l = item.length; i < l; ++i) {
    if (!{}.hasOwnProperty.call(u, item[i])) {
      newArray.push(item[i]);
      u[item[i]] = 1;
    }
  }
  return newArray;
}

/**
 * Prepare Error message for `done()` Gulp Task callbacks that do not contain Stack Traces.
 * @param {string} message
 * @returns {Error}
 * @see http://stackoverflow.com/a/39093327/1033782
 */
function error(message) {
  const err = new Error(message);
  err.showStack = false;
  return err;
}

module.exports = {
  sh,
  flattenArray,
  uniqueArray,
  error,
};
