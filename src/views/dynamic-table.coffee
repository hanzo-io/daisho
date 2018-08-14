import Dynamic from './dynamic'
import html from '../templates/dynamic-table'
import Events from '../events'
import ref from 'referential'

tables = 0

export default class DynamicTable extends Dynamic
  tag:  'daisho-dynamic-table'
  html: html

  # table header data
  headers: []

  # local count
  count: 0

  # amount of results to display
  display: 20

  # starting page
  page: 1

  # set to true when loading
  loading: false

  # count field name
  countField: 'count'

  # results field name
  resultsField: 'results'

  # facet results file name
  facetsResultsField: 'facets.results'

  init: ->
    # generate unique ids for each of the fields
    @countField         += tables
    @resultsField       += tables
    @facetsResultsField += tables

    tables++

    super arguments...

    for header in @headers
      if !header.onclick
        header.onclick = 'onheader'

  onheader: (header) ->
    return (e) => @_onheader header, e

  # overwrite this with sort handlers and things like that
  # _onheader: (header, e) ->

  # check if there's more results
  hasMore: ->
    return @page * @display <= @count

  moreCount: ->
    return Math.min @remaining(), @display

  remaining: ->
    return 0 if !@hasMore()
    return @count - @page * @display

  # trigger load more
  loadMore: ->
    if @loading || !@hasMore()
      return

    @loading = true
    @scheduleUpdate()

    if !@hasMore()
      return false

    @page++

    p = @_loadMore.apply @, arguments

    if p?.finally
      p.finally =>
        @loading = false
        @scheduleUpdate()
    else
      @loading = false
      @scheduleUpdate()

  # overwrite this with sort handlers and things like that
  # return a promise for asynchronous loading
  # _loadMore: ->

  load: ->
    if @loading
      return

    @loading = true
    @scheduleUpdate()

    p = @_load.apply @, arguments

    if p?.finally
      p.finally =>
        @loading = false
        @scheduleUpdate()
    else
      @loading = false
      @scheduleUpdate()

  # overwrite this with custom loading
  # return a promise for asynchronous loading
  # _load: ->

  # call this with client results
  onload: (res) ->
    if Array.isArray res
      models = res
      res =
        models:  models
        count:   models.length
        display: models.length
        page:    1

    # TODO: investigate why Events.Change must be called manually
    @count = res.count
    @data.set @countField, res.count
    @data.set @resultsField, undefined
    @data.set @resultsField, res.models

    @data.set @facetsResultsField, undefined
    @data.set @facetsResultsField, res.facets

    @mediator.trigger Events.Change
    @scheduleUpdate()

  # call this with client results
  onloadMore: (res)->
    if Array.isArray res
      models = res
      res =
        models:  models
        count:   models.length
        display: models.length
        page:    1

    # TODO: investigate why Events.Change must be called manually
    results = @data.get(@resultsField) ? []

    @count = res.count
    @data.set @countField, res.count
    @data.set @resultsField, undefined
    @data.set @resultsField, results.concat res.models

    @data.set @facetsResultsField, undefined
    @data.set @facetsResultsField, res.facets

    @mediator.trigger Events.Change
    @scheduleUpdate()
