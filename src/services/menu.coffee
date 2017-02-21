module.exports = class MenuService
  menu: null
  initFn: null
  daisho: null
  constructor: (@daisho)->
    @menu = {}

  register: (name, fn)->
    @menu[name] = fn
    if !@initFn?
      @initFn = fn

  run: (name)->
    fn = @menu[name]
    if !fn
      console.log '---MENU SERVICE---\n' + name + ' not registered'
    fn()

  start: ->
    if !@initFn
      console.log '---MENU SERVICE---\nnothing registered'
      return
    @initFn()
