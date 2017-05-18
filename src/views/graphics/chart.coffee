import Tween       from 'es-tween'
import randomColor from 'randomcolor'

import Dynamic from '../dynamic'
import d3      from './d3'
import html    from '../../templates/graphics/chart'

# # http://big-elephants.com/2014-06/unrolling-line-charts-d3js/
# getSmoothInterpolation = (lineFn, data) ->
#   (d, i, a) ->
#     interpolate = d3.scalelinear().domain([
#       0
#       1
#     ]).range([
#       1
#       data.length + 1
#     ])
#     (t) ->
#       flooredX = Math.floor(interpolate(t))
#       weight = interpolate(t) - flooredX
#       interpolatedLine = data.slice(0, flooredX)
#       if flooredX > 0 and flooredX < 31
#         weightedLineAverage = data[flooredX].y * weight + data[flooredX - 1].y * (1 - weight)
#         interpolatedLine.push [interpolate(t) - 1, weightedLineAverage]
#       lineFn interpolatedLine

# --Chart--
# A chart supports a model with many series with x/y values.
class Chart extends Dynamic
  tag: 'daisho-graphics-chart'
  html: html

  margin:
    top: 40
    right: 40
    bottom: 50
    left: 90

  width: 0
  height: 400

  yMin: 10

  interpolationTime: 3000
  redrawTime: 300

  # SVG Bits
  svg: null
  chart: null
  xA: null
  yA: null
  xAxis: null
  yAxis: null
  lines: null
  points: null
  notes: null
  legend: null

  lineWidth: 3
  pointRadius: 6

  # Update?
  dataHash: ''

  colorSeed: 10
  colors: null

  # from Dynamic
  refreshTiming: 'after'
  tips: null

  nextColor: ()->
    x = Math.sin(@_colorSeed++) * 10000
    return randomColor(seed: Math.floor((x - Math.floor(x)) * 1000))#.replace new RegExp('-', 'g'), ''

  init: ->
    super()

    @colors = []
    @tips   = []

    @on 'mount', =>
      @svg = svg = d3.select @root
        .select 'svg'

      @parseTime = d3.timeParse '%Y-%m-%dT%H:%M:%S%Z'

      @chart = chart = svg.append 'g'
        .attr 'transform', 'translate(' + @margin.left + ',' + @margin.top + ')'

      @lines = @chart.append 'g'
        .classed 'lines', true

      @points = @chart.append 'g'
        .classed 'points-group', true

      @notes = @chart.append 'g'
        .classed 'notes', true

      @xAxis = chart.append 'g'
        .classed 'axis', true
        .classed 'x-axis', true
      @xAxis.append 'text'

      @yAxis = chart.append 'g'
        .classed 'axis', true
        .classed 'y-axis', true
      @yAxis.append 'text'

      @legend = svg.append("g")
        .classed 'legend', true
        .attr 'transform', 'translate(50,30)'

      @xScale = d3.scaleTime()
      @yScale = d3.scaleLinear()

  _refresh: ->
    width  = @width || $(@root).parent().width()
    height = @height

    if width <= 0 || height <= 0
      return

    @svg
      .attr 'width',  width
      .attr 'height', height

    serieses = @data.get()
    return if !serieses[0]

    @_colorSeed =  @colorSeed
    @colors.length = 0

    width  -= @margin.left + @margin.right
    height -= @margin.top  + @margin.bottom

    xs = []
    ys = []

    xScale = @xScale
    yScale = @yScale

    xScale.rangeRound [0, width]
      .ticks d3.timeDay.every 1
    yScale.rangeRound [height, 0]

    for i, series of serieses
      if series.type == 'line' || series.type == 'bar'
        xs = xs.concat series.xs
        ys = ys.concat series.ys

    ysBuf = ys.map serieses[0].fmt.y
    ysBuf.push @yMin
    xScale.domain d3.extent xs.map(serieses[0].fmt.x), (x)=> return @parseTime x
    yScale.domain d3.extent ysBuf, (y)-> return y

    # redraw/remove
    if @xA && @yA
      @xAxis.transition()
        .duration @redrawTime
        .call @xA.scale(xScale)
      @yAxis.transition()
        .duration @redrawTime
        .call @yA.scale(yScale)
    else
      @xA = d3.axisBottom(xScale).tickFormat serieses[0].axis.x.ticks
      @xAxis.call @xA
        .attr 'transform', 'translate(0,' + height + ')'
        .select 'text'
        .attr 'fill', '#000'
        .attr 'x', width
        .attr 'y', -12
        .attr 'dy', '0.71em'
        .attr 'text-anchor', 'end'
        .text series.axis.x.name

      @yA = d3.axisLeft(yScale).tickFormat serieses[0].axis.y.ticks
      @yAxis.call @yA
        .select 'text'
        .attr 'fill', '#000'
        .attr 'transform', 'rotate(-90)'
        .attr 'y', 6
        .attr 'dy', '0.71em'
        .attr 'text-anchor', 'end'
        .text series.axis.y.name

    @lines.selectAll '*'
      .attr 'opacity', 1
      .transition()
      .duration @redrawTime
      .attr 'opacity', 0
      .attr 'd', lineFn
      .remove()

    @points.selectAll '*'
      .attr 'opacity', 1
      .transition()
      .duration @redrawTime
      .attr 'opacity', 0
      .remove()

    @notes.selectAll '*'
      .attr 'opacity', 1
      .transition()
      .duration @redrawTime
      .attr 'opacity', 0
      .remove()

    notes = []

    do =>
      for tip in @tips
        tip.hide()

      @tips = []

    for i, series of serieses
      if series.xs.length == 0 || series.ys.length == 0
        continue

      # line renderer
      if series.type == 'line'
        xys = series.xs.map (x, j)->
          return [x, series.ys[j]]

        lineFn = d3.line()
          .x (d) => return xScale @parseTime(series.fmt.x(d[0] || 0))
          .y (d) -> return yScale series.fmt.y(d[1] || 0)

        line = @lines.append 'path'
          .classed 'line', true
          .classed 'line-' + series.series, true

        color = @nextColor()
        @colors.push color
        line.datum xys
          .attr 'fill', 'none'
          .attr 'stroke', color
          .attr 'stroke-linejoin', 'round'
          .attr 'stroke-linecap', 'round'
          .attr 'stroke-width', @lineWidth
          .attr 'd', lineFn

        do (series, line, color)=>
          lineLength = line.node().getTotalLength()

          tip = d3.tip()
            .attr 'class', 'tip tip-' + series.series
            .offset [-10, 0]
            .html (d) ->
              return """
                <div class='tip-group'>
                  <span class='tip-label'>#{ series.axis.x.name }:</span>
                  <span class='tip-value' style='color:#{ color }'>#{ series.tip.x(series.fmt.x(d[0] || 0)) }</span>
                </div>
                <div class='tip-group'>
                  <span class='tip-label'>#{ series.axis.y.name }:</span>
                  <pre class='tip-value' style='color:#{ color }'>#{ series.tip.y(series.fmt.y(d[1] || 0)) }</pre>
                </div>
                """

          @tips.push tip

          # line stroke tween
          # http://stackoverflow.com/questions/32789314/unrolling-line-in-d3js-linechart
          point = @points.append 'g'
            .classed 'points', true
            .classed 'points-' + series.series, true

          point.call tip

          line
            .attr 'stroke-dashoffset', lineLength
            .attr 'stroke-dasharray', lineLength + ' ' + lineLength
            .transition()
            .duration @interpolationTime
            .attrTween 'stroke-dashoffset', (ds)=>
              j = 0
              len = ds.length
              lineInterpolator = d3.interpolate lineLength, 0
              return (t)=>
                if t >= j / len && ds[j]
                  show = false
                  p = point.append 'circle'
                    .classed 'point', true
                    .classed 'point-' + series.series, true
                    .datum ds[j]
                    .attr 'stroke', color
                    .attr 'stroke-width', 0
                    .attr 'stroke-opacity', 0
                    .attr 'fill', color
                    .attr 'cx', (d)=> return xScale @parseTime(series.fmt.x(d[0] || 0))
                    .attr 'cy', (d)-> yScale series.fmt.y(d[1] || 0)
                    .on 'mouseover', tip.show
                    .on 'mouseout', (e)->
                      if !show
                        tip.hide(e)
                    .on 'click', (e)->
                      show = !show
                      if show
                        tip.show(e)
                      else
                        tip.hide(e)
                  p
                    .transition()
                    .duration @redrawTime
                    .attrTween 'r', (d)=>
                      return d3.interpolate 0, @pointRadius
                  j++

                return lineInterpolator t

      # line renderer
      # else if series.type == 'bar'
      # else if series.type == 'note'
      #   1 == 1
        # do a thing

    # Aggregate data like legends and notes go after here
    notes = {}
    maxes = []

    for series in serieses
      if series.type == 'notes'
        xs = series.xs
        ys = series.ys
        for i, x of xs
          if notes[x]
            notes[x].push ys[i]
          else
            notes[x] = [ys[i]]
      else
        xs = series.xs
        ys = series.ys
        for i, x of xs
          if !maxes[x]? || maxes[x] < ys[i]
            maxes[x] = ys[i]

    for x, ys of notes
      datum = [x, maxes[x]]

      do (datum, ys)=>
        tip = d3.tip()
          .attr 'class', 'tip tip-notes'
          .offset [-10, 0]
          .html (d) ->
            return """
              <div class='tip-group'>
                <span class='tip-label'>#{ serieses[0].axis.x.name }:</span>
                <span class='tip-value'>#{ serieses[0].tip.x(series.fmt.x(d[0] || 0)) }</span>
              </div>
              <div class='tip-group'>
                <span class='tip-label'>Notes:</span>
                <pre class='tip-value'>#{ ys.join '\n' }</pre>
              </div>
              """

        @tips.push tip

        point = @notes.append 'circle'
          .classed 'point', true
          .classed 'point-notes', true

        point.call tip

        show = false
        point.datum datum
          .attr 'stroke', '#048ba8'
          .attr 'stroke-width', 0
          .attr 'stroke-opacity', 0
          .attr 'fill', '#048ba8'
          .attr 'cx', (d)=> return xScale @parseTime(serieses[0].fmt.x(d[0] || 0))
          .attr 'cy', (d)-> yScale(serieses[0].fmt.y(d[1] || 0)) - 20
          .on 'mouseover', tip.show
          .on 'mouseout', tip.hide
          # .on 'mouseout', (e)->
          #   # if !show
          #   tip.hide(e)
          # .on 'click', (e)->
          #   show = !show
          #   if show
          #     tip.show(e)
          #   else
          #     tip.hide(e)

        point.transition()
          .duration @redrawTime
          .attrTween 'r', (d)=>
            return d3.interpolate 0, @pointRadius * 1.5

    ordinal = d3.scaleOrdinal()
      .domain serieses.map((s)-> return s.series).filter (s)-> return !!s
      .range @colors

    @legend.attr 'transform', 'translate(' + width + ',' + @margin.top + ')'

    legendOrdinal = d3.legendColor()
      .shape 'path', d3.symbol().type(d3.symbolCircle).size(150)()
      .shapePadding 10
      # .cellFilter (d)-> return d.label !== 'e'
      .scale ordinal

    @legend.call legendOrdinal

export default Chart
