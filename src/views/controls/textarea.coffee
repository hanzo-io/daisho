import Text from './text'

import html from '../../templates/controls/textarea'

module.exports = class TextArea extends Text
  tag:  'textarea-control'
  html: html
  formElement: 'textarea'
