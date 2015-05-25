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

    doCrossfilter(bets, dd)
  })
}

function doCrossfilter(data, dd) {
  // Create the crossfilter for the relevant dimensions and groups.
  var bets = crossfilter(data),
    all = bets.groupAll(),
    cost = bets.dimension(_.property(keys.cost.key)),
    costs = cost.group(),
    winAmount = bets.dimension(_.property(keys.winAmount.key)),
    winAmounts = winAmount.group(),
    payout = bets.dimension(_.property(keys.payout.key)),
    payouts = payout.group()

    // cost = bets.dimension(_.property(keys.cost.key)),
    // costs = date.group(),
    // hour = bets.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
    // hours = hour.group(Math.floor),
    // delay = bets.dimension(function(d) { return Math.max(-60, Math.min(149, d.delay)); }),
    // delays = delay.group(function(d) { return Math.floor(d / 10) * 10; }),
    // distance = bets.dimension(function(d) { return Math.min(1999, d.distance); }),
    // distances = distance.group(function(d) { return Math.floor(d / 50) * 50; });

  var charts = [
    SmallViz.barChart()
        .dimension(cost)
        .group(costs)
      .x(d3.scale.linear()
        .domain(dd.cost.range)
        .rangeRound([0, 800])),
    SmallViz.barChart()
        .dimension(payout)
        .group(payouts)
      .x(d3.scale.linear()
        .domain(dd.payout.range)
        .rangeRound([0, 800])),
    SmallViz.barChart()
        .dimension(winAmount)
        .group(winAmounts)
      .x(d3.scale.linear()
        .domain(dd.winAmount.range)
        .rangeRound([0, 800])),

    // barChart()
    //     .dimension(delay)
    //     .group(delays)
    //   .x(d3.scale.linear()
    //     .domain([-60, 150])
    //     .rangeRound([0, 10 * 21])),
    // barChart()
    //     .dimension(distance)
    //     .group(distances)
    //   .x(d3.scale.linear()
    //     .domain([0, 2000])
    //     .rangeRound([0, 10 * 40])),
    // barChart()
    //     .dimension(date)
    //     .group(dates)
    //     .round(d3.time.day.round)
    //   .x(d3.time.scale()
    //     .domain([new Date(2001, 0, 1), new Date(2001, 3, 1)])
    //     .rangeRound([0, 10 * 90]))
    //     .filter([new Date(2001, 1, 1), new Date(2001, 2, 1)])
  ];
  // Given our array of charts, which we assume are in the same order as the
  // .chart elements in the DOM, bind the charts to the DOM and render them.
  // We also listen to the chart's brush events to update the display.
  var chart = d3.select('body').selectAll(".chart")
      .data(charts)
      .enter().append('div').attr('class','chart')
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

  // Render the initial lists.
  var list = d3.select('body').append('div').attr('class','list')
      .data([SmallViz.list(data)]);

  renderAll();

  // Renders the specified chart or list.
  function render(method) {
    d3.select(this).call(method);
  }
  // Whenever the brush moves, re-rendering everything.
  function renderAll() {
    chart.each(render);
    list.each(render);
  }

}
init();
