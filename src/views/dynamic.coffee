CrowdControl    = require 'crowdcontrol'
Events          = require '../events'
$               = require 'jquery'

module.exports = class DynamicView extends CrowdControl.Views.Form
  tag: 'daisho-dynamic'
  html: ''

  # data.get field for caching staleness
  # null means we cache on the entire date object
  _dataStaleField: null

  # last version of data cached for staleness check
  _dataStaleCached: ''

  autoRefresh: true

  # can be before or after
  refreshTiming: 'before'

  _p: false

  # add some helpers to automagically bind refresh function
  init: ->
    # make @_refresh automatically save the stale data
    r = @_refresh
    @_refresh = =>
      p = r.apply @, arguments
      if p?.then?
        p.then =>
          try
            @_dataStaleCached = JSON.stringify @data.get @_dataStaleField
          catch e
            console.error 'could not save stale data', e
        .catch (e)->
          console.error 'count not save stale data', e
      else
        try
          @_dataStaleCached = JSON.stringify @data.get @_dataStaleField
        catch e
          console.error 'could not save stale data'
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

    super

  # refresh checks if something is stale
  refresh: ->
    # abort if things aren't attached to the dom
    if !$(@root).closest('body')[0]?
      return

    # abort if data isn't stale
    _dataStaleCached = JSON.stringify @data.get @_dataStaleField
    if _dataStaleCached == @_dataStaleCached
      return

    return @_refresh.apply @, arguments

  _refresh: ->
