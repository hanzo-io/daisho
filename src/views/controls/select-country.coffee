Select = require './select'
countries = require('../../data/countries')

module.exports = class SelectCountry extends Select
  tag: 'select-country-control'
  options: ->
    return countries.data
  lookup: 'country'

  init: ()->
    super

    @on 'update', ()=>
      country = @input.ref.get @lookup
      if country
        country = country.toLowerCase()
        if country.length == 2
          @input.ref.set @lookup, country
        else
          for k, v of countries.data
            if v.toLowerCase() == country
              @input.ref.set @lookup, k
              return
