'use strict';
var exec = require('child_process').execSync;

function sh(cmd) {
  console.log(exec(cmd, {encoding: 'utf8'}));
}

module.exports = {
  sh: sh
};
