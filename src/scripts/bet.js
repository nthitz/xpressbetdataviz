var _ = require('lodash');
var crossfilter = require('crossfilter');

var SmallViz = require('./SmallViz')
var formatters = require('./formatters')

var functional = require('./functional'),
  and = functional.and,
  not = functional.not,
  exists = functional.exists;

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
    _(keys).filter(exists('formatter'))
      .each(function(key, keyKey) {
        //only apply formatters for non calculated columns
        if(not(exists('calculated'))(key)) {
          datum[key.key] = key.formatter.parse( datum[key.key] )
        }
    }).run()

    //create calculated columns
    _(keys).filter(exists('calculated'))
      .each(function(key, keyKey) {
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
    var keyData = {}
    //store the unique range of values for each key
    keyData.values = _.unique( _.pluck(data, key.key ))
    //for numeric keys, store the min/max values
    if(exists('numeric')(key)) {
      console.log('range')
      keyData.range = d3.extent(keyData.values)
    }

    return keyData
  })

}


function init() {
  keys = prepareKeys(keys);
  console.log(keys)
  d3.csv('data/xbstatement.csv', function(err, data) {
    preprocessRows(data)

    //find rows that have bet types of Bet and have a non empty Cost value
    var bets = _.filter(data, and(
        _.matches( { [keys.transactionType.key]: 'Bet' } ),
        not(_.matches( { [keys.cost.key]: 0 } ))
      )
    )
    console.log("filtered rows: " + bets.length + " of " + data.length)

    var dd = createDataDictionary(bets, keys);
    console.log(dd)
    console.log(_.filter(bets, function(d) { return d[keys.betType.key] === '' }))

  })
}

init();
