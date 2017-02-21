module.exports = class PageService
  cache: null
  data: null
  daisho: null

  current: null

  constructor: (@daisho, data, @debug)->
    @cache = {}

  mount: ->
  update: ->

  register: (id, enterFn, startFn, stopFn)->
    @cache[id] =
      id:       id
      enter:    enterFn
      start:    startFn
      stop:     stopFn
      root:     null

  show: (id)->
    page = @cache[id]

    if !page?
      console.log '---PAGE SERVICE---\n' + id + ' not registered'

    if @current?
      page.root = @current.stop @

    if !page.root
      page.root = page.enter @
      page.root = page.start @
      if @debug
        console.log '---PAGE SERVICE---\nDone serving page ' + id
    else
      page.root = page.start @
      if @debug
        console.log '---PAGE SERVICE---\nDone serving page ' + id

    @current = page.root
    return @current

