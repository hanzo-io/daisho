Control = require './control'

module.exports = class Text extends Control
  tag:          'text-control'
  html:         require '../../templates/controls/text'
  type:         'text'
  formElement:  'input'
  autoComplete: 'on'
  init: ()->
    super

    @on 'updated', =>
      el = @root.getElementsByTagName(@formElement)[0]
