module.exports =
  Controls: require './controls'
  Graphics: require './graphics'

  List:     require './list'
  ListItem: require './list-item'

  Login:    require './login'
  Main:     require './main'
  Menu:     require './menu'

  register: ->
    @Controls.register()
    @Graphics.register()

    @List.register()
    @ListItem.register()

    @Login.register()
    @Main.register()
    @Menu.register()

