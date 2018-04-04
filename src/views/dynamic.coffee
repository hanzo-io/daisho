import El     from 'el.js'
import Events from '../events'

# View with built-in caching for optimizing frequently updated data-driven
# views.
class DynamicView extends El.Form
  tag:  'daisho-dynamic'
  html: ''

  # data.get field for caching staleness
  # null means we cache on the entire data object
  _dataStaleField: null

  # last version of data cached for staleness check
  _dataStaleCached: ''

  # refresh lock
  _locked: false

  # should automatically refresh on an update call?
  autoRefresh: true

  # can be before or after
  refreshTiming: 'before'

  _p: false

  # add some helpers to automagically bind refresh function
  init: ->
    # make @_refresh automatically save the stale data
    r = @_refresh
    @_refresh = =>
      if @_locked
        return @locked

      @_locked = true
      p = r.apply @, arguments
      @_locked = p
      if p?.then?
        p.then =>
          try
            @_dataStaleCached = JSON.stringify @data.get @_dataStaleField
          catch e
            console.error 'could not save stale data', e
          @_locked = false
        .catch (e)->
          console.error 'count not save stale data', e
      else
        try
          @_dataStaleCached = JSON.stringify @data.get @_dataStaleField
        catch e
          console.error 'could not save stale data'
        @_locked = false
      return p

    if @autoRefresh
      if @mediator?
        @mediator.on Events.Refresh, =>
          return @refresh.apply @, arguments

      if @refreshTiming == 'before'
        @on 'update', ()=>
          return @refresh.apply @, arguments
      else
        @on 'updated', ()=>
          return @refresh.apply @, arguments

    # this bypasses all the staleness checks
    if @mediator?
      @mediator.on Events.ForceRefresh, =>
        return @_refresh.apply @, arguments

    super()

  # refresh checks if something is stale
  refresh: ->
    # abort if root isn't attached to the dom
    if !$(@root).closest('body')[0]?
      return

    # abort if data isn't stale
    _dataStaleCached = JSON.stringify @data.get @_dataStaleField
    if _dataStaleCached == @_dataStaleCached
      return

    return @_refresh.apply @, arguments

  _refresh: ->

export default DynamicView
