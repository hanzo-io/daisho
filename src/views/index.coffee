import Controls     from './controls'
import Graphics     from './graphics'

import Table        from './table'
import TableRow     from './table-row'

import CommandBar        from './command-bar'
import Dynamic           from './dynamic'
import DynamicTable      from './dynamic-table'
import HanzoDynamicTable from './hanzo-dynamic-table'
import HanzoStaticTable  from './hanzo-static-table'
import Login             from './login'
import Main              from './main'
import Menu              from './menu'
import Modal             from './modal'

import FilterFacets from './filter-facets'

export default Views =
  Controls:     Controls
  Graphics:     Graphics

  Table:        Table
  TableRow:     TableRow

  CommandBar:        CommandBar
  Dynamic:           Dynamic
  DynamicTable:      DynamicTable
  HanzoDynamicTable: HanzoDynamicTable
  HanzoStaticTable:  HanzoStaticTable
  Login:             Login
  Main:              Main
  Menu:              Menu
  Modal:             Modal

  FilterFacets: FilterFacets

  register: ->
    @Controls.register()
    @Graphics.register()

    @Table.register()
    @TableRow.register()

    @CommandBar.register()
    @Login.register()
    @Main.register()
    @Menu.register()
    @Modal.register()
    @FilterFacets.register()
