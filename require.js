/*
 * require.js
 * Copyright (C) 2016 romgrk <romgrk@localhost.localdomain>
 *
 * Distributed under terms of the MIT license.
 */

function readFile(path){
  var fs = new ActiveXObject("Scripting.FileSystemObject");
  var file = fs.OpenTextFile(path, 1, true);
  var res = file.ReadAll();
  file.Close();
  return res;
}

function require(path) {
  var module = { exports: {} }
  var script = readFile(path)
  script = '(function (module, exports, require) { ' + script + ' ; log("ok"); return module.exports }(module, module.exports))'
  return eval(script)
}

var module = require('c:/users/gregoirr/scripts/path.js')
log(module)






function get(name) { return global[name]; }
function set(name, value) { global[name] = value; }
function log(msg) { WScript.stdout.WriteLine(toString(msg)); }
function err(msg) { WScript.stdout.WriteLine(toString(msg)); }
function exp(string) { return string; }
function toString(value) {
  return ''+value
}
