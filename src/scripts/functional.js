/**
* Functional And
* Returns a function that performs an `and` operation the two provided functions
*/
function and(a,b) {
  return function(value, key) {
    return a(value, key) && b(value, key)
  }
}
/**
* Functional Not
* returns a function that returns the opposite (logical not) of the provided function
*/
function not(a) {
  return function(value, key) {
    return ! a(value,key)
  }
}

/**
* Functional existential
* returns a function that checks if a given property exists
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