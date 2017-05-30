import Checkbox from './checkbox'
import Currency from './currency'
import DateRangePicker from './date-range-picker'
import Numeric from './numeric'
import Switch from './switch'

import * as ElControls from 'el-controls'

export default Controls =
  Checkbox:        Checkbox
  Currency:        Currency
  DateRangePicker: DateRangePicker
  Numeric:         Numeric
  Switch:          Switch

  register: ->
    Checkbox.register()
    Currency.register()
    DateRangePicker.register()
    Numeric.register()
    Switch.register()
