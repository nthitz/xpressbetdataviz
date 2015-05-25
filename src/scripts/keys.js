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
keys = prepareKeys(keys)

module.exports = keys