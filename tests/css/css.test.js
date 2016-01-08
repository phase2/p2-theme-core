var fs = require('fs');
var assert = require('assert');
var exec = require('child_process').execSync;

function sh(cmd) {
  console.log(exec(cmd, {
    encoding: 'utf8'
  }));
}

describe('CSS Compiling', function() {
  this.timeout(5000);
  before(function() {
    console.log('Compiling CSS with "gulp css"');
    sh('cd ' + __dirname + ' && gulp css');
  });
  it('should compile CSS', function() {
    var expected = fs.readFileSync(__dirname + '/expected/style.css', 'utf8');
    var actual = fs.readFileSync(__dirname + '/dest/style.css', 'utf8');
    assert.equal(expected, actual);
  });
});

