import Currency from './currency'
import DateRangePicker from './date-range-picker'
import Numeric from './numeric'
import Switch from './switch'

import * as ElControls from 'el-controls'

export default Controls =
  Currency:        Currency
  DateRangePicker: DateRangePicker
  Numeric:         Numeric
  Switch:          Switch

  register: ->
    Currency.register()
    DateRangePicker.register()
    Numeric.register()
    Switch.register()
