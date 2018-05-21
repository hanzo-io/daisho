import HanzoDynamicTable from './hanzo-dynamic-table'
import html from '../templates/hanzo-static-table'

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

export default class HanzoStaticTable extends HanzoDynamicTable
  tag:  'daisho-hanzo-static-table'
  html: html

  init: ->
    super

  _onheader: ->
    return (e) -> return true

  doLoad: ->
    return true

  getFacetQuery: ->
    return ''

