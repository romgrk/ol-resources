/*
 * cleanup-folder.js
 * */ 'use strict'; extendArray() /*
 */


var MAX_AGE = 30 /* days */

var folders = [
  'c:/users/gregoirr/tmp/tmp'
]


folders.forEach(function(folder) {
  listFiles(folder)
    .filter(function(file) { return olderThan(MAX_AGE, file.dateCreated) })
    .forEach(function(file) {
      file.Delete()
    })
})


function olderThan(days, date) {
  log(date)
  return (new Date().getTime() - new Date(date).getTime()) > (1000 * 3600 * 24 * days)
}



/*
 * File utilities
 */

function listFiles(path) {
  var fs   = new ActiveXObject('Scripting.FileSystemObject');
  var fc   = new Enumerator(fs.GetFolder(path).files);
  var list = [];
  for (; !fc.atEnd(); fc.moveNext()) {
    list.push(fc.item());
  }
  return list;
}

function deleteFile(path, force){
  var fs = new ActiveXObject('Scripting.FileSystemObject');
  fs.deleteFile(path)
}

function join() {
  return Array.prototype.slice.call(arguments, 0).join('\\')
}




/*
 * Workflow
 */

function get(name) { return Watch.getVariable(name); }
function set(name, value) { Watch.setVariable(name, value); }
function log(msg) { try { Watch.log(toString(msg), 2) } catch(e) { WScript.stdout.WriteLine(''+msg) } }
function err(msg) { try { Watch.log(toString(msg), 1) } catch(e) { WScript.stdout.WriteLine(''+msg) } }
function exp(string) { return Watch.expandString(string); }
function xml(string) { return Watch.expandString("xmlget('/request[1]/values[1]/" + string + "[1]',Value,KeepCase,No Trim)"); }
function toString(value) {
  if (typeof value == 'string') return value;
  if (typeof value == 'object') return JSON.stringify(value)
  return ''+value
}



/*
 * Array
 */

function extendArray() {
  Array.from = function(array) {
    try {
      return Array.prototype.slice.call(array, 0)
    } catch(e) {
      return map(array, function(v) { return v })
    }
  }

  function forEach(array, callback) {
    for (var i = 0; i < array.length; i++)
      callback(array[i], i, array);
  }

  function map(array, callback) {
    var newArray = []
    for (var i = 0; i < array.length; i++)
      newArray[i] = callback(array[i], i, array)
    return newArray;
  }

  function reduce(array, callback, accumulator) {
    var i       = accumulator != undefined ? 0 : 1
    accumulator = accumulator != undefined ? accumulator : array[0]
    for (; i < array.length; i++)
      accumulator = callback(accumulator, array[i])
    return accumulator;
  }

  function filter(array, predicate) {
    var newArray = []
    for (var i =0; i < array.length; i++) {
      if (predicate(array[i], i, array))
        newArray.push(array[i])
    }
    return newArray;
  }

  function some(array, predicate) {
    for (var i = 0; i < array.length; i++) {
      if (predicate(array[i], i, array))
        return true
    }
    return false
  }

  function every(array, predicate) {
    for (var i = 0; i < array.length; i++) {
      if (!predicate(array[i], i, array))
        return false
    }
    return true
  }

  function contains(array, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] === value)
        return true
    }
    return false
  }

  function find(array, predicate) {
    for (var i = 0; i < array.length; i++) {
      if (predicate(array[i]))
        return array[i]
    }
  }

  function last(array) {
    return array[array.length - 1]
  }

  function flatten(array) {
    return reduce(array, function(acc, cur){ return acc.concat(cur); }, [])
  }

  function zip(a, b) {
    return map(a, function(e, i) { return [e, b[i]] })
  }

  function append(array, other) {
    Array.prototype.push.apply(array, other)
    return array
  }

  function prepend(array, other) {
    Array.prototype.unshift.apply(array, other)
    return array
  }


  var functions = {
    map: map,
    reduce: reduce,
    filter: filter,
    forEach: forEach,
    some: some,
    every: every,
    flatten: flatten,
    contains: contains,
    find: find,
    append: append,
    prepend: prepend,
    last: last
  }
  for (var n in functions) {
    (function(name, fn) {
      Array.prototype[name] = function() {
        var args = Array.prototype.slice.call(arguments, 0)
        args.unshift(this)
        return fn.apply(this, args)
      }
    }(n, functions[n]))
  }
}
