/*
 * array.js
 * Copyright (C) 2016 romgrk <romgrk@localhost.localdomain>
 *
 * Distributed under terms of the MIT license.
 */


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

  function findIndex(array, predicate) {
    for (var i = 0; i < array.length; i++) {
      if (predicate(array[i]))
        return i
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
    findIndex: findIndex,
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
