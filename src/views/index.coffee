module.exports =
  Controls: require './controls'
  Graphics: require './graphics'

  List:     require './list'
  ListItem: require './list-item'

  CommandBar:   require './command-bar'
  Dynamic:      require './dynamic'
  Login:        require './login'
  Main:         require './main'
  Menu:         require './menu'

  register: ->
    @Controls.register()
    @Graphics.register()

    @List.register()
    @ListItem.register()

    @CommandBar.register()
    @Login.register()
    @Main.register()
    @Menu.register()

