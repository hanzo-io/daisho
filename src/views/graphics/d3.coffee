import {axisBottom}   from 'd3-axis'
import {axisLeft}     from 'd3-axis'
import {extent}       from 'd3-array'
import {interpolate}  from 'd3-interpolate'
import {line}         from 'd3-shape'
import {scaleLinear}  from 'd3-scale'
import {scaleOrdinal} from 'd3-scale'
import {scaleTime}    from 'd3-scale'
import {select}       from 'd3-selection'
import {symbolCircle} from 'd3-shape'
import {symbol}       from 'd3-shape'
import {timeDay}      from 'd3-time'
import {timeParse}    from 'd3-time-format'
import {transition}   from 'd3-transition'

import legendColor from 'd3-svg-legend/src/color'
import tip from 'd3-tip'

export default {
  axisBottom:   axisBottom
  axisLeft:     axisLeft
  extent:       extent
  interpolate:  interpolate
  legendColor:  legendColor
  line:         line
  scaleLinear:  scaleLinear
  scaleOrdinal: scaleOrdinal
  scaleTime:    scaleTime
  select:       select
  symbol:       symbol
  symbolCircle: symbolCircle
  timeDay:      timeDay
  timeParse:    timeParse
  tip:          tip
  transition:   transition
}
