{
  View
} = require('crowdcontrol').Views

refer = require 'referential'

module.exports = class UserList extends View
  tag: 'user-list'
  html: require './templates/list.html'

  route: ()->

  init: ()->
    @data = refer
      columns:  []
      items:    []
      page:     1
      count:    0
      display:  10
      sort:     '-UpdatedAt'


    @client.user.list(
      page:     @data.get 'page'
      display:  @data.get 'display'
      sort:     @data.get 'sort'
    ).then
