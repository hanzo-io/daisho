module.exports = class MenuService
  menu: null
  initFn: null
  daisho: null
  debug: false

  constructor: (@daisho, @debug)->
    @menu = {}

  register: (name, fn)->
    if @menu[name]
      console.log '---MENU SERVICE---\nCollision for ' + name

    @menu[name] = fn
    if !@initFn?
      @initFn = fn

  run: (name)->
    fn = @menu[name]
    if !fn && @debug
      console.log '---MENU SERVICE---\n' + name + ' not registered'
    fn()

  start: ->
    if !@initFn && @debug
      console.log '---MENU SERVICE---\nnothing registered'
      return
    @initFn()
