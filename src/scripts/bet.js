var _ = require('lodash');

var formatters = require('./formatters')
// map of our data keys, useful names as keys, the verbose actual data keys as the values of the object
var keys = {
  'payout': {
    key: 'Credit',
    formatter: formatters.dollar,
    numeric: true
  },
  'cost': {
    key: 'Debit',
    formatter: formatters.dollar,
    numeric: true
  },
  'winAmount': {
    key: 'winAmount',
    formatter: formatters.dollar,
    calculated: true,
    numeric: true,
    calculate: function(datum) {
      return datum[keys.payout.key] - datum[keys.cost.key]
    }
  },
  'time': {
    key: 'Date/Time(PT)',
    formatter: formatters.time,
    numeric: true
  },

  'betType': 'Pool',
  'raceNumber': 'Race',
  'selection': 'Selection',
  'transactionType': 'TransactionType',
  'id': 'Txn#',
  'track': 'Track',
  'stake': 'Stake'
}

function prepareKeys(keys) {
  return _.mapValues(keys, function(key, keyKey) {
    if( _.isString(key)) {
      return { key: key }
    } else if(_.isPlainObject(key)) {
      return key
    }
  })
}
function preprocessRows(data) {
  // apply a transformation to each row in our dataset
  return _.map(data, function(datum) {
    //apply formatters to relvant keys
    _(keys).filter(function(key) {
      return typeof key.formatter !== 'undefined'
    }).each(function(key, keyKey) {
      //only apply formatters for non calculated columns
      if(typeof key.calculated === 'undefined') {
        datum[key.key] = key.formatter.parse( datum[key.key] )
      }
    }).run()

    //create calculated columns
    _(keys).filter(function(key) {
      return typeof key.calculated !== 'undefined'
    }).each(function(key, keyKey) {
      datum[key.key] = key.calculate(datum)
    }).run()

    return datum
  })
}

/**
* Returns a object with `keys` as keys and an array of unique values for each key as the values
*/
function createDataDictionary(data, keys) {
  return _.mapValues(keys, function(key, keyKey) {
    return _.unique( _.pluck(data, key.key ))
  })
}

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
*/
function not(a) {
  return function(value, key) {
    return ! a(value,key)
  }
}
function init() {
  keys = prepareKeys(keys);
  console.log(keys)
  d3.csv('data/xbstatement.csv', function(err, data) {
    preprocessRows(data)

    //find rows that have bet types of Bet and have a non empty Cost value
    var bets = _.filter(data, and(
        _.matches( { [keys.transactionType.key]: 'Bet' } )
        not(_.matches( { [keys.cost.key]: 0 } ))
      )
    )

    var dd = createDataDictionary(bets, keys);
    console.log(dd)
    console.log(_.filter(bets, function(d) { return d[keys.betType.key] === '' }))

  })
}

init();
