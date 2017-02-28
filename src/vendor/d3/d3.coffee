_d3 = require 'd3'

d3 =
  axisBottom:   _d3.axisBottom
  axisLeft:     _d3.axisLeft

  extent:       _d3.extent

  interpolate:  _d3.interpolate

  line:         _d3.line

  legendColor:  require('d3-svg-legend').legendColor #es6

  select:       _d3.select

  scaleLinear:  _d3.scaleLinear
  scaleOrdinal: _d3.scaleOrdinal
  scaleTime:    _d3.scaleTime

  symbol:       _d3.symbol
  symbolCircle: _d3.symbolCircle

  timeDay:      _d3.timeDay
  timeParse:    _d3.timeParse

  tip:          require 'd3-tip'

module.exports = d3


