module.exports =
  Dashboard:    require './dashboard'
  Login:        require './login'

  register: ()->
    @Dashboard.register()
    @Login.register()
