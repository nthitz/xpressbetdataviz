/**
* Functional And
* @param {function} a - the first function to call as part of the and
* @param {function} b - the second function to call..
* @return {function} a function that returns a() && b(). a & b are called with the same arguments as passed to this returned function.
*/
function and(a,b) {
  return function() {
    return a(arguments) && b(arguments)
  }
}

/**
* Functional Or
* @param {function} a - the first function to call as part of the or
* @param {function} b - the second function to call..
* @return {function} a function that returns a() || b(). a & b are called with the same arguments as passed to this returned function.
*/
function and(a,b) {
  return function() {
    return a.apply(this,arguments) || b.apply(this, arguments)
  }
}


/**
* Functional Not
* @param {function} a - function to call as part of the not
* @return {function} a function that returns the logical not of a call to a(). a is called with the same arguments as passed to this returned function.
*/
function not(a) {
  return function() {
    return ! a.apply(this, arguments)
  }
}

/**
* Functional existential
* @param {function} key - the key to check existance for
* @return {function} a function that returns true if the property key exists in it's first argument.
*/
function exists(key) {
  return function(object) {
    return typeof object[key] !== 'undefined'
  }
}


var exports = {
  and: and,
  not: not,
  exists: exists
}
module.exports = exports;