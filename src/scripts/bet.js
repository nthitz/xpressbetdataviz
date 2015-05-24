var formatters = require('./formatters')
// map of our data keys, useful names as keys, the verbose actual data keys as the values of the object
var keys = {
  'payout': {
    key: 'Credit',
    formatter: formatters.dollar
  },
  'cost': {
    key: 'Debit',
    formatter: formatters.dollar
  },
  'time': {
    key: 'Date/Time(PT)',
    formatter: formatters.time
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
  return _.mapValues(keys, function(dataKey, keyKey) {
    if( _.isString(dataKey)) {
      return { key: dataKey }
    } else if(_.isPlainObject(dataKey)) {
      return dataKey
    }
  })
}

/**
* Returns a object with `keys` as keys and an array of unique values for each key as the values
*/
function createDataDictionary(data, keys) {
  return _.mapValues(keys, function(dataKey, keyKey) {
    return _.unique( _.pluck(data, dataKey))
  })
}

function init() {
  keys = prepareKeys(keys);
  console.log(keys)
  d3.csv('data/xbstatement.csv', function(err, data) {
    var bets = _.filter(data, _.matches( { [keys.transactionType]: 'Bet' } ))
    var dd = createDataDictionary(data, keys);
    console.log(dd)

  })
}

init();
