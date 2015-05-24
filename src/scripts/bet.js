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

function init() {
  keys = prepareKeys(keys);
  console.log(keys)
  d3.csv('data/xbstatement.csv', function(err, data) {
    preprocessRows(data)
    var bets = _.filter(data, _.matches( { [keys.transactionType]: 'Bet' } ))
    var dd = createDataDictionary(data, keys);
    console.log(dd)

  })
}

init();
