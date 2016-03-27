{
  View
} = require('crowdcontrol').Views

refer = require 'referential'
riot = require 'riot'

module.exports = class UserList extends View
  tag: 'user-list'
  html: require './templates/list.html'

  route: ()->

  init: ()->
    @data = refer
      columns:  [
        {
          id:   'email'
          name: 'Email'
        }
        {
          id:   'firstName'
          name: 'First Name'
        }
        {
          id:   'lastName'
          name: 'Last Name'
        }
        {
          id:   'createdAt'
          name: 'Created On'
        }
        {
          id:   'updatedAt'
          name: 'Last Updated'
        }
      ]
      items:    []
      page:     1
      count:    0
      display:  10
      sort:     '-UpdatedAt'

    @client.user.list
      page:     @data.get 'page'
      display:  @data.get 'display'
      sort:     @data.get 'sort'
    .then (res)=>
      @data.set 'items', res.models
      @data.set 'count', parseInt res.count, 10
      @data.set 'page', parseInt res.page, 10
      @data.set 'display', parseInt res.display, 10

      riot.update()
