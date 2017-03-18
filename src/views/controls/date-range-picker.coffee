import moment from 'moment-timezone'

import Calendar from '../../vendor/baremetrics-calendar/calendar'
import Text     from './text'
import util     from '../../util'

import html from '../../templates/controls/date-range-picker'

export default class DateRangePicker extends Text
  tag:  'date-range-picker-control'
  html: html

  after: '2015-01-01'
  before: moment()

  events:
    updated: ->
      @onUpdated()

    mount: ->
      @onUpdated()

  init: -> super()

  onUpdated: ->
    if !@calendar
      filter = @data.get 'filter'
      self = @
      @calendar = new Calendar
        element:       $(@root).find('.daterange')
        earliest_date: moment @after
        latest_date:   moment @before
        start_date:    filter[0]
        end_date:      filter[1]
        callback: ->
          start = moment(@start_date).format util.rfc3339
          end = moment(@end_date).format util.rfc3339

          console.log 'Start Date: ' + start + '\nEnd Date: ' + end

          val = [start, end]
          self.data.set 'filter', val

          self.change()
          self.changed val

  getValue: (e) -> @data.get 'filter'
