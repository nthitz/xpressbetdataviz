var _ = require('lodash');
var crossfilter = require('crossfilter');

var dccrossfilterviz = require('./dccrossfilterviz')

var functional = require('./functional'),
  and = functional.and,
  not = functional.not,
  exists = functional.exists;

var keys = require('./keys')

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
