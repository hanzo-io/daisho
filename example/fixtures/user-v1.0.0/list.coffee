{
  View
} = require('crowdcontrol').Views

module.exports = class UserList extends View
  tag: 'user-list'
  html: require './templates/list.html'

  route: ()->

  init: ()->
    @on 'updated', ()->
