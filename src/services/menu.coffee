import isFunction from 'es-is/function'


class MenuService
  menu:   null
  menuHash: null
  initFn: null
  daisho: null
  debug:  false

  constructor: (@daisho, @debug) ->
    @menu = []
    @menuHash = {}

  register: (name, opts) ->
    if @menuHash[name]
      console.log '---MENU SERVICE---\nCollision for ' + name

    action = @run name
    @menuHash[name] =
      name:   name
      action: action
      icon:   opts.icon
      fn:     if isFunction opts then opts else opts.action
    @menu.push @menuHash[name]

  run: (name) ->
    return =>
      data = @menuHash[name]
      if !data.action && @debug
        console.log '---MENU SERVICE---\n' + name + ' not registered'
      data.fn()

export default MenuService
