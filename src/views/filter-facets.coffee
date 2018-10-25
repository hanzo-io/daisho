import El from 'el.js'
import html from '../templates/filter-facets'
import Events from '../events'
import utils    from '../utils'

moment = utils.date.moment

yyyymmdd =  utils.date.yyyymmdd

class FilterFacets extends El.Form
  tag: 'daisho-filter-facets'
  html: html

  # Supply an object with the mapping of facet fields to display names
  #
  # facetNames: {
  #   facet: 'name'
  # }
  #
  # facetCurrency: {
  #   facet: true
  # }

  # Facets received from server should be under .results,
  # Facet configuration should be under .options
  # Filter query string should be set to .query
  #
  # data: {
  #   results:
  #     string: ...
  #     range: ...
  #   options: ...
  #   query: 'string query'
  # }

  init: ->
    super

    if !@facetNames
      @facetNames = {}

    @on 'update', =>
      ranges = @data.get 'options.range'
      if ranges?
        for k, range of ranges
          if range.to < range.from
            z = range.from
            @data.set 'options.range.' + k + '.from', range.to
            @data.set 'options.range.' + k + '.to', z
            @scheduleUpdate()

    @data.set 'filter', [moment('2015-01-01').format(yyyymmdd), moment().format(yyyymmdd)]

  loading: false

  # check if we have a facet result with the name
  hasResult: (name)->
    for facet in @data.get 'results'
      if facet[0] && facet[0].Name == name
        if facet[0].Count? && facet[0].Count == 1 && typeof facet[0].Value != 'string'
          return false
        return true
    return false

  # Rewrite name?
  createName: (name)->
     name = name.split(/(?=[A-Z])/).join(' ')
     return name.charAt(0).toUpperCase() + name.slice(1)

  # Get the number of records
  count: ()->
    for facet in @data.get 'facets'
      if facet[0] && facet[0].Name == 'Kind'
        return facet[0].Count
    return 0

  # Is the facet a string checkbox?
  isStringFacet: (facet)->
    return facet && facet[0] && typeof facet[0].Value == 'string' && facet[0].Name != 'Kind'

  # Is the facet a range selector?
  isRangeFacet: (facet)->
    return !@isStringFacet(facet) && facet[0].Name != 'Kind' && facet[0].Count > 1

  reset: (e)->
    # investigate why Events.Change must be called manually
    if @onreset?
      if @onreset(e) != false
        @mediator.trigger Events.Change

        @data.set 'options', undefined
        @data.set 'query', undefined
        @search(e)
    else
      @mediator.trigger Events.Change

      @data.set 'options', undefined
      @data.set 'query', undefined
      @search(e)

  search: (e)->
    p = @onsearch(e, @data.get()) if @onsearch?
    if p? && p.then?
      @loading = true
      p.then =>
        @loading = false
        @scheduleUpdate()
      if p.catch?
        p.catch =>
          @loading = false
          @scheduleUpdate()

      @scheduleUpdate()
    return p


export default FilterFacets
