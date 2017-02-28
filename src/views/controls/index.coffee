module.exports =
  Checkbox:        require './checkbox'
  DateRangePicker: require './date-range-picker'
  Password:        require './password'
  Select:          require './select'
  SelectCountry:   require './select-country'
  SelectState:     require './select-state'
  Text:            require './text'
  TextArea:        require './textarea'

  register: ->
    @Checkbox.register()
    @DateRangePicker.register()
    @Password.register()
    @Select.register()
    @SelectCountry.register()
    @SelectState.register()
    @Text.register()
    @TextArea.register()
