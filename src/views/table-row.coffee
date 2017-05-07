import El from 'el.js'

import html from '../templates/table-row'

class TableRow extends El.Form
  tag:  'daisho-table-row'
  html: html
  init: -> super()

export default TableRow
