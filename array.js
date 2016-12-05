/*
 * array.js
 * Copyright (C) 2016 romgrk <romgrk@localhost.localdomain>
 *
 * Distributed under terms of the MIT license.
 */



/*
 * Array polyfill
 */

Array.prototype.forEach = function(callback) {
  for (var i = 0; i < this.length; i++)
    callback(this[i], i, this);
}

Array.prototype.map = function(callback) {
  var newArray = []
  for (var i = 0; i < this.length; i++)
    newArray[i] = callback(this[i])
  return newArray;
}

Array.prototype.reduce = function(callback, accumulator) {
  for (var i = 0; i < this.length; i++)
    accumulator = callback(accumulator, this[i])
  return accumulator;
}

Array.prototype.filter = function(predicate) {
  var newArray = []
  for (var i =0; i < this.length; i++) {
    if (predicate(this[i]))
      newArray.push(this[i])
  }
  return newArray;
}

Array.prototype.contains = function(value) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == value)
      return true
  }
  return false
}


