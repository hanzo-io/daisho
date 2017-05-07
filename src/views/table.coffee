import El from 'el.js'

import html from '../templates/table'

class Table extends El.View
  tag:  'daisho-table'
  html: html

  # tableColumns: []
  # tableField: undefined

  init: -> super()

export default Table
