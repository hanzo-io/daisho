{
  Page
  Module
} = require 'daisho-sdk'

{ RiotPage } = require 'daisho-riot'

UserList = require './list'
UserList.register()

class UserLists extends RiotPage
  tag: 'user-list'

  render: ()->
    super

module.exports = class User extends Module
  @name: 'User'

  routes:
    '/':        UserLists
    '/create':  Page
    '/edit':    Page
