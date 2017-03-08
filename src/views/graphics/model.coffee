export default Model =
  new: ->
    # multi-series model
    return [@newSeries()]

  newSeries: ->
    series: ''      # name of series
    type:   'line'  # type of series rendering
    xs:     []      # x values
    ys:     []      # y values

    # formatting functions
    fmt:
      x: (n)-> n
      y: (n)-> n

    tip:
      x: (n)-> n
      y: (n)-> n

    # axis configuration
    axis:
      x:
        name:  ''
        scale: null
        fmt:   (n) -> n
        ticks: (n) ->
          n # return a d3 tick object
      y:
        name:  ''
        scale: null
        fmt:   (n) -> n
        ticks: (n) ->
          n # return a d3 tick object
