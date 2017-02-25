CrowdControl    = require 'crowdcontrol'
Tween           = require 'tween.js'
d3              = require 'd3'

# --Chart--
# A chart supports a model with many series with x/y values.
module.exports = class Chart extends CrowdControl.Views.View
  tag: 'daisho-graphics-chart'
  html: require '../../templates/graphics/chart'

  margin:
    top: 40
    right: 40
    bottom: 50
    left: 70

  width: 0
  height: 400

  # SVG Bits
  svg: null
  chart: null
  xAxis: null
  yAxis: null
  lines: null
  # D3 Bits

  init: ->
    super

    @on 'mount', =>
      @svg = svg = d3.select @root
        .select 'svg'

      @parseTime = d3.timeParse '%Y-%m-%dT%H:%M:%S%Z'

      @chart = chart = svg.append 'g'
        .attr 'transform', 'translate(' + @margin.left + ',' + @margin.top + ')'

      @lines = []

      @xAxis = chart.append 'g'
        .classed 'axis', true
        .classed 'x-axis', true
      @xAxis.append 'text'
      @yAxis = chart.append 'g'
        .classed 'axis', true
        .classed 'y-axis', true
      @yAxis.append 'text'

      @xScale = d3.scaleTime()
      @yScale = d3.scaleLinear()

    @on 'updated', =>
      serieses = @data.get()
      if !serieses[0]
        return

      width = @width || $(@root).parent().width()
      height = @height

      @svg
        .attr 'width', width
        .attr 'height', height

      width -= @margin.left + @margin.right
      height -= @margin.top + @margin.bottom

      xs = []
      ys = []

      xScale = @xScale
      yScale = @yScale

      xScale.rangeRound [0, width]
        .ticks d3.timeDay.every 1
      yScale.rangeRound [height, 0]

      lines = @lines

      for i, series of serieses
        lines[i].remove() if lines[i]
        xs = xs.concat series.xs
        ys = ys.concat series.ys

      @lines = lines = []

      xScale.domain d3.extent xs.map(series.fmt.x), (x)=> return @parseTime x
      yScale.domain d3.extent ys.map(series.fmt.y), (y)-> return y

      @xAxis.call d3.axisBottom @xScale
        .attr 'transform', 'translate(0,' + height + ')'
        .select 'text'
        .attr 'fill', '#000'
        .attr 'x', width
        .attr 'y', -12
        .attr 'dy', '0.71em'
        .attr 'text-anchor', 'end'
        .text series.axis.x.name

      @yAxis.call d3.axisLeft(@yScale).tickFormat(serieses[0].axis.y.ticks)
        .select 'text'
        .attr 'fill', '#000'
        .attr 'transform', 'rotate(-90)'
        .attr 'y', 6
        .attr 'dy', '0.71em'
        .attr 'text-anchor', 'end'
        .text series.axis.y.name

      for i, series of serieses
        if series.xs.length == 0 || series.ys.length == 0
          return

        xys = series.xs.map (x, j)->
          return [x, series.ys[j]]

        lineFn = d3.line()
          .x (d) => return xScale @parseTime(series.fmt.x(d[0] || 0))
          .y (d) -> return yScale series.fmt.y(d[1] || 0)

        line = @chart.append 'path'
          .classed 'line', true
          .classed 'series', true
          .datum xys
          .attr 'fill', 'none'
          .attr 'stroke', 'steelblue'
          .attr 'stroke-linejoin', 'round'
          .attr 'stroke-linecap', 'round'
          .attr 'stroke-width', 1.5
          .attr 'd', lineFn

        lines.push line

