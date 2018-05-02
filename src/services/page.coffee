  import utils from '../utils'

  # PageService manages the page life cycle (doesn't do rendering)
  class PageService
    cache:        null
    daisho:       null
    debug:        false
    current:      null
    initState:    null
    pushState:    true
    # replaceState overwrites pushstate
    replaceState: false

    # Create the service
    constructor: (@daisho, @debug)->
      # Initialize the page cache
      @cache = {}

    mount:  ->
    update: ->

    has: (id) ->
      return @cache[id]?

    # Register a page and its life cycle callbacks, then store the page in the
    # cache.
    register: (id, enterFn, startFn, stopFn) ->
      if @cache[id]
        console.log '---PAGE SERVICE---\nCollision for ' + id

      if enterFn && startFn && stopFn
        opts =
          enterFn: enterFn
          startFn: startFn
          stopFn:  stopFn
      else if enterFn
        opts = enterFn

      @cache[id] =
        id:    id
        enter: opts.enterFn
        start: opts.startFn
        stop:  opts.stopFn
        root:  null
        opts:  null

      # set the initial state
      if !@initState?
        @initState = @daisho.services.navigation.getState()
        if !@initState?
          [id2, opts] = utils.nav.decode window.location.pathname.substr 1

          id = id2 if id2

          @initState =
            id:   id
            opts: opts
          @replaceState = true
        else
          @pushState = false

    # Show a registered page from the cache
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

      # replace state
      if @replaceState
        # overwrite push state
        @pushState = true
        @replaceState = false

        @daisho.services.navigation.replaceState(id, opts)
      # don't push state
      else if !@pushState
        @pushState = true
        @replaceState = false
      # push state
      else
        @daisho.services.navigation.pushState(id, opts)
      @initState = null

      @daisho.scheduleUpdate()

      @current = page
      @current

    start: ()->
      @daisho.services.navigation.onPopState (state)=>
        @pushState = false
        @initState = state
        @show state.id, state.opts

      @show @initState.id, @initState.opts

  export default PageService
