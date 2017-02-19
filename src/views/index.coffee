module.exports =
  Controls: require './controls'

  List: require './list'
  ListItem: require './list-item'
  Login: require './login'

  register: ->
    Controls.register()

    List.register()
    ListItem.register()
    Login.register()

