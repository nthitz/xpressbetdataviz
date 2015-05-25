var crossfilter = require('crossfilter'),
  dc = require('dc'),
  d3 = require('d3'),
  formatters = require('./formatters'),
  keys = require('./keys')
  ;
var dataArray,
  selector,
  charts = {},
  cf = {};

function viz(_dataArray, dataDictionary, _selector) {
  dataArray = _dataArray;
  selector = _selector;
  cf.data = crossfilter(dataArray)
  cf.all = cf.data.groupAll()
  cf.byDay = cf.data.dimension(function(d) {
    return d3.time.day(d[keys.time.key])
  })
  cf.betVolumneByDayGroup = cf.byDay.group()
  cf.wagerAmountByDayGroup = cf.byDay.group()
    .reduceSum(_.property(keys.cost.key))
  cf.winAmountByDayGroup = cf.byDay.group()
    .reduceSum(_.property(keys.winAmount.key))

  cf.typeOfBet = cf.data.dimension(_.property(keys.betType.key))
  cf.typeOfBetVolumeGroup = cf.typeOfBet.group()
  cf.typeOfBetWinAmountGroup = cf.typeOfBet.group()
    .reduceSum(_.property(keys.winAmount.key))
  cf.typeOfBetWagerAmountGroup = cf.typeOfBet.group()
    .reduceSum(_.property(keys.cost.key))
  cf.typeOfBetCreditAmountGroup = cf.typeOfBet.group()
    .reduceSum(_.property(keys.payout.key))



  window.bv = cf.betVolumneByDayGroup
  window.wv = cf.wagerAmountByDayGroup
  window.byDay = cf.byDay

  d3.select(selector).append('div').attr('class','typeOfBetChart')
  d3.select(selector).append('div').attr('class','typeOfBetChartWinAmount')
  d3.select(selector).append('div').attr('class','typeOfBetChartWagerAmount')
  d3.select(selector).append('div').attr('class','typeOfBetChartCreditAmount')
  d3.select(selector).append('div').attr('class','lineChart')
  d3.select(selector).append('div').attr('class','volumeChart')

  charts.typeOfBetChart = dc.rowChart('.typeOfBetChart')
  charts.typeOfBetChartWinAmount = dc.rowChart('.typeOfBetChartWinAmount')
  charts.typeOfBetChartWagerAmount = dc.rowChart('.typeOfBetChartWagerAmount')
  charts.typeOfBetChartCreditAmount = dc.rowChart('.typeOfBetChartCreditAmount')

  charts.volumeChart = dc.barChart('.volumeChart')
  charts.moneyLineChart =  dc.lineChart('.lineChart')

  charts.typeOfBetChart
    .width(200)
    .height(400)
    .margins({top: 20, left: 10, right: 10, bottom: 20})
    .group(cf.typeOfBetVolumeGroup)
    .dimension(cf.typeOfBet)
    .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
    .label(function (d) {
      return d.key
    })
    .title(function (d) {
      return d.value;
    })
    .elasticX(true)
    .xAxis().ticks(4);

  charts.typeOfBetChartWinAmount
    .width(200)
    .height(400)
    .margins({top: 20, left: 10, right: 10, bottom: 20})
    .group(cf.typeOfBetWinAmountGroup)
    .dimension(cf.typeOfBet)
    .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
    .label(function (d) {
      return d.key
    })
    .title(function (d) {
      return d.value;
    })
    .elasticX(true)
    .xAxis().ticks(4);
  charts.typeOfBetChartWagerAmount
    .width(200)
    .height(400)
    .margins({top: 20, left: 10, right: 10, bottom: 20})
    .group(cf.typeOfBetWagerAmountGroup)
    .dimension(cf.typeOfBet)
    .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
    .label(function (d) {
      return d.key
    })
    .title(function (d) {
      return d.value;
    })
    .elasticX(true)
    .xAxis().ticks(4);

  charts.typeOfBetChartCreditAmount
    .width(200)
    .height(400)
    .margins({top: 20, left: 10, right: 10, bottom: 20})
    .group(cf.typeOfBetCreditAmountGroup)
    .dimension(cf.typeOfBet)
    .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
    .label(function (d) {
      return d.key
    })
    .title(function (d) {
      return d.value;
    })
    .elasticX(true)
    .xAxis().ticks(4);

  charts.moneyLineChart
    .width(990)
    .height(300)
    .transitionDuration(1000)
    .margins({top: 30, right: 50, bottom: 25, left: 40})
    .dimension(cf.byDay)
    .mouseZoomable(true)
    .rangeChart(charts.volumeChart)
    .x(d3.time.scale().domain(dataDictionary.time.range))
    .round(d3.time.day.round)
    .xUnits(d3.time.day)
    .elasticY(true)
    .renderHorizontalGridLines(true)
    .legend(dc.legend().x(100).y(10).itemHeight(13).gap(5))
    .brushOn(false)
    // .group(cf.wagerAmountByDayGroup, 'Wager Amount')
    .group(cf.winAmountByDayGroup, 'Win amount')
    // .stack(cf.wagerAmountByDayGroup, 'wager amount', function (d) {
    //   return d.value;
    // })
    // .title(function (d) {
    //     var value = d.value.avg ? d.value.avg : d.value;
    //     if (isNaN(value)) {
    //         value = 0;
    //     }
    //     return dateFormat(d.key) + '\n' + numberFormat(value);
    // });

  charts.volumeChart.width(990)
    .height(40)
    .margins({top: 0, right: 50, bottom: 20, left: 40})
    .dimension(cf.byDay)
    .group(cf.betVolumneByDayGroup)
    .centerBar(true)
    .gap(1)
    .x(d3.time.scale().domain(dataDictionary.time.range))
    .round(d3.time.day.round)
    .alwaysUseRounding(true)
    .xUnits(d3.time.day);

  dc.renderAll()

}


module.exports = viz