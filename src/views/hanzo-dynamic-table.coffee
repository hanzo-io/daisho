import Dynamic from './dynamic-table'
import html from '../templates/hanzo-dynamic-table'

# helper for facets
getFacets = (options) ->
  facets =
    string: []
    range: []

  hasFacets = false
  if options && options.string
    for k, v of options.string
      hasFacets = true

      vals = []

      for k2, v2 of v
        if v2
          facets.string.push
            name: k
            value: k2

  if options && options.range
    for k, v of options.range
      hasFacets = true
      facets.range.push
        name: k
        value:
          start: v.from
          end: v.to

  return facets if hasFacets

  return

export default class HanzoDynamicTable extends Dynamic
  tag:  'daisho-hanzo-dynamic-table'
  html: html

  # Name of item in table
  # name: ''

  # filter config
  configs:
    'filter': []

  initialized: false
  loading: false

  # a map of all the range facets that should use currency instead of numeric
  # for example
  # facetCurrency:
  #   price: true
  #   listPrice: true
  #   inventoryCost: true

  facetCurrency: {}

  openFilter: false

  init: ->
    super

  # generate header onclick events
  _onheader: (header, e) ->
    if @data.get('sort') == header.field
      @data.set 'asc', !@data.get('asc')
    else
      @data.set 'asc', true
    @data.set 'sort', header.field
    @_refresh e

  onsearch: (e, facet) ->
    @load true

  # return the query string
  getFacetQuery: ->
    return @data.get 'facets.query'

  # return the facet filter options
  getFacetOptions: ->
    return @data.get 'facets.options'

  # load?
  doLoad: ->
    return true

  # overwrite with search function call and return promise
  # list: (opts) ->

  _refresh: (force, fn) ->
    @load force, fn

  _load: (force, fn) ->
    if @initialized && !force
      return

    if !@doLoad()
      return

    org = @daisho.akasha.get('orgs')[@daisho.akasha.get('activeOrg')]
    @data.set 'facets.currency', org.currency

    @initialized = true

    #default sorting
    if !@data.get('sort')?
      @data.set 'sort', 'UpdatedAt'
      @data.set 'asc', false

    # filter = @data.get 'filter'
    opts =
      sort: if @data.get('asc') then '-' + @data.get('sort') else @data.get('sort')
      display: @page * @display
      page: 1

    q = @getFacetQuery()
    opts.q = q if q

    options = @getFacetOptions()

    if facets = getFacets options
      opts.facets = JSON.stringify facets

    p = @list(opts)

    if p.then
      p.then (res) =>
        if fn? then fn(res) else @onload(res)
    else
      if fn? then fn(p) else @onload(p)

  _loadMore: ->
    org = @daisho.akasha.get('orgs')[@daisho.akasha.get('activeOrg')]
    @data.set 'facets.currency', org.currency

    @initialized = true

    #default sorting
    if !@data.get('sort')?
      @data.set 'sort', 'UpdatedAt'
      @data.set 'asc', false

    # filter = @data.get 'filter'
    opts =
      sort: if @data.get('asc') then '-' + @data.get('sort') else @data.get('sort')
      display: @display
      page: @page

    q = @data.get 'facets.query'
    opts.q = q if q

    options = @data.get 'facets.options'

    if facets = getFacets options
      opts.facets = JSON.stringify facets

    p = @list(opts)

    if p.then
      p.then (res) =>
        if fn? then fn(res) else @onloadMore(res)
    else
      if fn? then fn(p) else @onloadMore(p)

  toggleFilterMenu: ()->
    @openFilter = !@openFilter
