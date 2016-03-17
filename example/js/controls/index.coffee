module.exports =
  #Generic Control
  Control:          require './control'
  Text:             require './text'

  register: ()->
    @Text.register()
