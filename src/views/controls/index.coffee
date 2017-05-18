import Currency from './currency'
import DateRangePicker from './date-range-picker'
import * as ElControls from 'el-controls'

export default Controls =
  Currency:        Currency
  DateRangePicker: DateRangePicker

  register: ->
    Currency.register()
    DateRangePicker.register()
