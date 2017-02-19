Select = require './select'
states = require('../../data/states')

module.exports = class SelectState extends Select
  tag: 'select-state-control'
  html: require '../../templates/controls/state-select'
  options: ->
    return states.data
  countryField: 'country'
  lookup: 'state'

  init: ()->
    super

    @on 'update', ()=>
      if !@input?
        return

      state = @input.ref.get @lookup
      if state
        state = state.toLowerCase()
        if state.length == 2
          @input.ref.set @lookup, state
        else
          for k, v of states.data
            if v.toLowerCase() == state
              @input.ref.set @lookup, k
              return

  onUpdated: ()->
    if !@input?
      return

    if @input.ref.get(@countryField) == 'us'
      $(@root).find('.selectize-control').show()
    else
      $(@root).find('.selectize-control').hide()
      value = @input.ref.get(@input.name)
      @input.ref.set(@input.name, value.toUpperCase()) if value
    super
