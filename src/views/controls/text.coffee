import Control from './control'
import html    from '../../templates/controls/text'

class Text extends Control
  tag:          'text-control'
  html:         html
  type:         'text'
  formElement:  'input'
  autoComplete: 'on'

  init: ->
    super

    @on 'updated', =>
      el = @root.getElementsByTagName(@formElement)[0]

export default Text
