var crossfilter = require('crossfilter'),
  dc = require('dc')
  d3 = require('d3')
  ;
var dataArray,
  selector,
  data,
  all

  ;
function viz(_dataArray, _selector) {
  dataArray = _dataArray;
  selector = _selector;
  data = crossfilter(dataArray)
  all = data.groupAll()




}


module.exports = viz