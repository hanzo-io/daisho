import Controls   from './controls'
import Graphics   from './graphics'

import List       from './list'
import ListItem   from './list-item'

import CommandBar from './command-bar'
import Dynamic    from './dynamic'
import Login      from './login'
import Main       from './main'
import Menu       from './menu'

export default Views =
  Controls:   Controls
  Graphics:   Graphics

  List:       List
  ListItem:   ListItem

  CommandBar: CommandBar
  Dynamic:    Dynamic
  Login:      Login
  Main:       Main
  Menu:       Menu

  register: ->
    @Controls.register()
    @Graphics.register()

    @List.register()
    @ListItem.register()

    @CommandBar.register()
    @Login.register()
    @Main.register()
    @Menu.register()
