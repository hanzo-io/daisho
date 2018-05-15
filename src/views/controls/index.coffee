import Checkbox from './checkbox'
import DateRangePicker from './date-range-picker'
import Numeric from './numeric'
import Switch from './switch'

import * as ElControls from 'el-controls/src'

export default Controls =
  Checkbox:        Checkbox
  DateRangePicker: DateRangePicker
  Numeric:         Numeric
  Switch:          Switch

  register: ->
    Checkbox.register()
    DateRangePicker.register()
    Numeric.register()
    Switch.register()
