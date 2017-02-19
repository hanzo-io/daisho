module.exports =
  Checkbox: require './checkbox'
  Password: require './password'
  Select: require './select'
  SelectCountry: require './select-country'
  SelectState: require './select-state'
  Text: require './text'
  TextArea: require './textarea'

  register: ->
    @Checkbox.register()
    @Password.register()
    @Select.register()
    @SelectCountry.register()
    @SelectState.register()
    @Text.register()
    @TextArea.register()

