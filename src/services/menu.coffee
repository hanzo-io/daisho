class MenuService
  menu:   null
  menuHash: null
  initFn: null
  daisho: null
  debug:  false

  constructor: (@daisho, @debug) ->
    @menu = []
    @menuHash = {}

  register: (name, fn) ->
    if @menuHash[name]
      console.log '---MENU SERVICE---\nCollision for ' + name

    action = @run name
    @menuHash[name] =
      name: name
      action: action
      fn: fn
    @menu.push @menuHash[name]

    if !@initFn?
      json = null
      try
        json = JSON.parse history?.state
      catch e
        console.log '---MENU SERVICE---\nno history state'
      @initFn = if json then @run(json.name) else action

  run: (name) ->
    return =>
      data = @menuHash[name]
      if !data.action && @debug
        console.log '---MENU SERVICE---\n' + name + ' not registered'

      history.pushState JSON.stringify(data), data.name, '/'
      data.fn()

  start: ->
    if !@initFn && @debug
      console.log '---MENU SERVICE---\nnothing registered'
      return
    @initFn()

export default MenuService
