/*
 * require.js
 * Copyright (C) 2016 romgrk <romgrk@localhost.localdomain>
 *
 * Distributed under terms of the MIT license.
 */

var get, set, log, err, exp;
try {
  Watch;
  get = function (name) { return Watch.getVariable(name); }
  set = function (name, value) { Watch.setVariable(name, value); }
  log = function (msg) { Watch.log(toString(msg), 2); }
  err = function (msg) { Watch.log(toString(msg), 1); }
  exp = function (string) { return Watch.expandString(string); }
} catch (e) {
  var global = {};
  get = function (name) { return global[name]; }
  set = function (name, value) { global[name] = value; }
  log = function (msg) { WScript.stdout.WriteLine(toString(msg)); }
  err = function (msg) { WScript.stdout.WriteLine(toString(msg)); }
  exp = function (string) { return string; }
}

function toString(value) {
  if (typeof value == 'function')
    return value.toString()
  if (typeof value == 'string')
    return value;
  return JSON.stringify(value)
}
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
  script = 'function (module, exports, require) { ' + script + ' ; log(module.exports); return module.exports }(module, module.exports)'

  log(eval(script))
}

require('c:/users/gregoirr/scripts/path.js')
