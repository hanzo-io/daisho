import Select    from './select'
import countries from '../../data/countries'

class SelectCountry extends Select
  tag:    'select-country-control'
  lookup: 'country'

  options: ->
    countries.data

  init: ->
    super

    @on 'update', =>
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

export default SelectCountry
