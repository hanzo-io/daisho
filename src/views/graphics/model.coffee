module.exports =
  new: ->
    # multi-series model
    return [@newSeries()]
  newSeries: ->
    return {
      series: ''      # name of series
      xs: []          # x values
      ys: []          # y values
      fmt:            # formatting functions
        x: (n)-> return n
        y: (n)-> return n
      axis:           # axis configuration
        x:
          name: ''
          ticks: ->   #return a d3 tick object
            return null
        y:
          name: ''
          ticks: ->   #return a d3 tick object
            return null
    }
