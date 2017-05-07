class PageService
  cache:   null
  daisho:  null
  debug:   false
  current: null

  constructor: (@daisho, @debug)->
    @cache = {}

  mount:  ->
  update: ->

  register: (id, enterFn, startFn, stopFn) ->
    if @cache[id]
      console.log '---PAGE SERVICE---\nCollision for ' + id

    @cache[id] =
      id:    id
      enter: enterFn
      start: startFn
      stop:  stopFn
      root:  null
      opts:  null

  show: (id, opts = {}) ->
    page = @cache[id]
    page.opts = opts if opts?
    opts = page.opts

    if !page?
      console.log '---PAGE SERVICE---\n' + id + ' not registered'

    if @current?
      page.root = @current.stop @

    if !page.root
      page.root = page.enter @, opts
      page.root = page.start @, opts
      if @debug
        console.log '---PAGE SERVICE---\nDone serving page ' + id
    else
      page.root = page.start @, opts
      if @debug
        console.log '---PAGE SERVICE---\nDone serving page ' + id

    @daisho.scheduleUpdate()

    @current = page
    @current

export default PageService
