// map of our data keys, useful names as keys, the verbose actual data keys as the values of the object
var keys = {
  'payout': 'Credit',
  'cost': 'Debit',
  'time': 'Date/Time(PT)',
  'betType': 'Pool',
  'raceNumber': 'Race',
  'selection': 'Selection',
  'transactionType': 'TransactionType',
  'id': 'Txn#',
  'track': 'Track',
  'stake': 'Stake'
}

/**
* Returns a object with `keys` as keys and an array of unique values for each key as the values
*/
function createDataDictionary(data, keys) {
  return _.mapValues(keys, function(dataKey, keyKey) {
    return _.unique( _.pluck(data, dataKey))
  })
}

d3.csv('data/xbstatement.csv', function(err, data) {
  var bets = _.filter(data, _.matches( { [key.transactionType]: 'Bet' } ))
  var dd = createDataDictionary(data, keys);
  console.log(dd)

})