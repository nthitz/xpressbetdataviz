var crossfilter = require('crossfilter'),
  dc = require('dc')
  ;
var exports = {}
var dataArray,
  data,
  all

  ;
function init(_dataArray) {
  dataArray = _dataArray;
  data = crossfilter(dataArray)
  all = data.groupAll()


}

exports.init = init
module.exports = exports