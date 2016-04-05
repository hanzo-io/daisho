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
          tag:  'daisho-static-text'
        }
        {
          id:   'firstName'
          name: 'First Name'
          tag:  'daisho-static-text'
        }
        {
          id:   'lastName'
          name: 'Last Name'
          tag:  'daisho-static-text'
        }
        {
          id:   'createdAt'
          name: 'Created On'
          tag:  'daisho-static-date'
        }
        {
          id:   'updatedAt'
          name: 'Last Updated'
          tag:  'daisho-static-ago'
        }
      ]
      items:    []
      page:     1
      count:    0
      display:  10
      sort:     '-UpdatedAt'
      filter:   ''

    @filterData = refer
      options: [
        {
          name: 'Email'
          id:   'email'
          tag:  'daisho-text-control'
          options:
            placeholder: 'Email'
            lookup: 'email'
        }
      ]

    @configs =
      filter:       null
      email:        null
      firstName:    null
      lastName:     null
      createdAt:    null
      updatedAt:    null

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
