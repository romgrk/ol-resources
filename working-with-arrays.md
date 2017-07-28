
# Working with Arrays in JavaScript

JavaScript has several very useful methods for working with arrays, e.g. `.forEach`, `.map`, `.filter` and `.reduce`. 
However, the version of JavaScript in the workflow is too old to have them, you must therefore include a polyfill
like [this](https://github.com/romgrk/ol-resources/blob/master/array.js) one.

You can take advantage of function hoisting (which means function are usable, even if their definition is after the code) as such:
```js
extendArray() // => This will add the above mentioned methods on Array objects

/* Your code here */

function extendArray() {
  /* ... */
}
```

In the browser, you have access to this at anytime.

## Basic usage

The reason why one would want to use the above methods instead of for-loops is that it makes your code much more declarative
once you're used to those functions. You can focus on "what to do" instead of "how to do it".
For example:

```js
for (var i = 0; i < array.length; i++) {
  var element = array[i]
  /* do something with element */
}
```
vs.
```js
array.forEach(function(element) {
  /* do something here */
}
```

### Transforming

The various methods also have well-defined purposes, e.g. if you need to apply a transformation function to 
all element in an array, you would use `.map`.
```js
var array = [1, 2, 3]
var newArray = array.map(function(n) { return n * 2 }) // This doubles all elements in the array
// newArray is [2, 4, 6]
```
As you can see, instead of having to worry about having a loop counter `i`, incrementing it, assigning a temporary variable for the current element, etc., you can simply have a function that takes an element as input, and returns the transformed element as output.

### Filtering

Another frequent use-case is filtering data. It is as simple as:
```js
var array = [1, 5, 12, 18]
var newArray = array.filter(function(n) { return n > 10 })
// newArray is [12, 18]
```

### Reducing

The `.reduce(fn, initialValue)` method is also very powerful once you master it. 
It basically takes an array, and turns it into a single element.
Most common use-case is when you need to make the sum of numbers:
```js
var array = [1, 2, 3]

var fn = function(accumulator, currentValue) { return accumulator + currentValue }

var initialValue = 0

var sum = array.reduce(fn, initialValue)
// the `fn` callback will be called for each element 
// the `accumulator` starts as `initialValue`, and then takes each time the value returned by fn()
```

We could also merge an array of key-value pairs into an object as such:
```js
var array = [['firstName', 'John'], ['lastName', 'Smith']]

var initialValue = {}

var person = array.reduce(function(accumulator, current) { 
  accumulator[current[0]] = current[1]; 
  return accumulator 
  }, initialValue)
  
// person is { firstName: 'John', lastName: 'Smith' }
```


### Other useful methods:
```js
// Check if all elements pass a test
var areAllNumbersEven = array.every(function(element) { return element % 2 == 0 })

// Check if certain elements pass a test
var areSomeNumbersOdd = array.some(function(element) { return element % 2 == 1 })

// Find an element that passes a test
var firstNumberBiggerThan4 = array.find(function(element) { return element > 4 })
```

## Combining

The above methods are most useful when combined together, and when all the objects we are working with are 
arrays.

For example, let's say we're working with the MetaData API. The function [here](https://gist.github.com/romgrk/541479a60b82455dba6d3e2fc89c085e) will return an array of MetaData records.
We can them filter them and transform them at will.
```js
// Retrieve some invoices data
var invoices = getMetaDocuments()

// Keep only invoices from this year
var recentInvoices = invoices.filter(function(invoice) { return invoice.Year === '2017' })

// Get the total value of each invoice
var totals = recentInvoices.map(function(invoice) { return invoice.Total })

// And get the average amount of totals
var averageTotal = totals.reduce(function(acc, cur) { return acc + cur }, 0) / (totals.length || 1)
```

Note that the above example could also be written as such:
```js
var averageTotal = 
  getMetaDocuments()
  .filter(function(invoice) { return invoice.Year === '2017' })
  .map(function(invoice) { return invoice.Total })
  .reduce(function(acc, cur) { return acc + cur }, 0) / (totals.length || 1) 
```

This is of course applicable to any other array of objects, for example you could [retrieve your SQL
records into an array](https://gist.github.com/romgrk/fa6eb1418a8cfaabe81efb90445ef194#file-sql-js-L5-L28) 
and perform operations on them, or [read the rows of an excel file](https://gist.github.com/romgrk/767b2a520d7011c5b0534673b39355e7#file-excel-workflow-js-L43-L60), or anything else
that you can imagine.

