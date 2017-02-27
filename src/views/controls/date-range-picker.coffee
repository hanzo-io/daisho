Text = require './text'
$ = require 'jquery'
moment = require 'moment-timezone'
Calendar = require '../../vendor/baremetrics-calendar/calendar'
util = require '../../util'

module.exports = class DateRangePicker extends Text
  tag: 'date-range-picker-control'
  html: require '../../templates/controls/date-range-picker'

  after: '2015-01-01'
  before: moment()

  init: ->
    super

    @on 'updated', =>
      if !@calendar
        filter = @data.get 'filter'
        self = @
        @calendar = new Calendar
          element: $(@root).find('.daterange')
          earliest_date: moment @after
          latest_date: moment @before
          start_date: filter[0]
          end_date: filter[1]
          callback: ->
            start = moment(@start_date).format util.rfc3339
            end = moment(@end_date).format util.rfc3339

            console.log 'Start Date: ' + start + '\nEnd Date: ' + end

            self.data.set 'filter', [start, end]

            self.change()
            self.daisho.update()

  getValue: (e)->
    return @data.get 'filter'
