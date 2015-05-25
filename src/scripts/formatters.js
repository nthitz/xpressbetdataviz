var d3 = require('d3')

var dollarFormatter = d3.format('$')
var timeFormatter = d3.time.format('%Y-%m-%d %H:%M')
var dayFormatter = d3.time.format('%Y-%m-%d')
var formatters = {
  dollar: {
    parse: function(input) {
      return + input.replace(/\$/g,'')
    },
    format: function(input) {
      dollarFormatter(input)
    }
  },
  time: {
    parse: timeFormatter.parse,
    format: timeFormatter
  },
  day: {
    parse: dayFormatter.parse,
    format: dayFormatter
  }
}

module.exports = formatters;