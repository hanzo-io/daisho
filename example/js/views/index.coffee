module.exports =
  Dashboard:    require './dashboard'
  Login:        require './login'

  OrgSwitcherMenu:  require './org-switcher-menu'

  register: ()->
    @Dashboard.register()
    @Login.register()

    @OrgSwitcherMenu.register()
