import Checkbox        from './checkbox'
import DateRangePicker from './date-range-picker'
import Password        from './password'
import Select          from './select'
import SelectCountry   from './select-country'
import SelectState     from './select-state'
import Text            from './text'
import TextArea        from './textarea'

export default Controls =
  Checkbox:        Checkbox
  DateRangePicker: DateRangePicker
  Password:        Password
  Select:          Select
  SelectCountry:   SelectCountry
  SelectState:     SelectState
  Text:            Text
  TextArea:        TextArea

  register: ->
    @Checkbox.register()
    @DateRangePicker.register()
    @Password.register()
    @Select.register()
    @SelectCountry.register()
    @SelectState.register()
    @Text.register()
    @TextArea.register()
