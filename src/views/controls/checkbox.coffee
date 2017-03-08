import Control from './control'

import html from '../../templates/controls/checkbox'

class Checkbox extends Control
  tag:  'checkbox-control'
  html: html

  getValue: (event) ->
    event.target.checked

export default Checkbox
