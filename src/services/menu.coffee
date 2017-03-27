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

    @menuHash[name] =
      name: name
      action: fn
    @menu.push @menuHash[name]

    if !@initFn?
      @initFn = history?.state?.fn ? fn

  run: (name) ->
    data = @menu[name]
    if !data.fn && @debug
      console.log '---MENU SERVICE---\n' + name + ' not registered'

    history.pushState data, data.name, data.name.toLowerCase()
    data.fn()

  start: ->
    if !@initFn && @debug
      console.log '---MENU SERVICE---\nnothing registered'
      return
    @initFn()

export default MenuService
