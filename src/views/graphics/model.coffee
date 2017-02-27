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
      tip:
        x: (n)-> return n
        y: (n)-> return n
      axis:           # axis configuration
        x:
          name: ''
          fmt: (n)-> return n
          scale: null
          ticks: (n)->   #return a d3 tick object
            return n
        y:
          name: ''
          fmt: (n)-> return n
          scale: null
          ticks: (n)->   #return a d3 tick object
            return (n)
    }
