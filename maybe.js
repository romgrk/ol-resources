/*
 * maybe.js
 * Copyright (C) 2016 romgrk <romgrk@localhost.localdomain>
 *
 * Distributed under terms of the MIT license.
 */

function Maybe(value) {
  if (value == undefined)
    return Nothing();
  else
    return Just(value);
}
function Nothing() {
  return new Maybe.fn(value)
}
function Just(value) {
  return new Maybe.fn(value)
}

Maybe.fn = function(value) {
  this.value = value;
  this.isJust = value != undefined
}
Maybe.fn.prototype.map = function(f) {
  return this.isJust ? Maybe(f(this.value)) : this
}
Maybe.fn.prototype.orElse = function(value) {
  return this.isJust ? this.value : value
}
