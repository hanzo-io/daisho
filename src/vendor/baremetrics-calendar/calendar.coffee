# Design by Chris Meeks
# Code by Tyler van der Hoeven
# https://github.com/Baremetrics/calendar

Calendar = (settings) ->
  self = this
  @settings = settings
  @calIsOpen = false
  @presetIsOpen = false
  @sameDayRange = settings.same_day_range or false
  @element = settings.element or $('.daterange')
  @selected = null
  @type = if @element.hasClass('daterange--single') then 'single' else 'double'
  @required = if settings.required == false then false else true
  @format = settings.format or {}
  @format.input = settings.format and settings.format.input or 'MMMM D, YYYY'
  @format.preset = settings.format and settings.format.preset or 'll'
  @format.jump_month = settings.format and settings.format.jump_month or 'MMMM'
  @format.jump_year = settings.format and settings.format.jump_year or 'YYYY'
  @placeholder = settings.placeholder or @format.input
  @days_array = if settings.days_array and settings.days_array.length == 7 then settings.days_array else moment.weekdaysMin()
  @orig_start_date = null
  @orig_end_date = null
  @orig_current_date = null
  @earliest_date = if settings.earliest_date then moment(settings.earliest_date) else moment('1900-01-01')
  @latest_date = if settings.latest_date then moment(settings.latest_date) else moment('2900-12-31')
  @end_date = if settings.end_date then moment(settings.end_date) else if @type == 'double' then moment() else null
  @start_date = if settings.start_date then moment(settings.start_date) else if @type == 'double' then @end_date.clone().subtract(1, 'month') else null
  @current_date = if settings.current_date then moment(settings.current_date) else if @type == 'single' then moment() else null
  @presets = if settings.presets == false or @type == 'single' then false else true
  @callback = settings.callback or @calendarSetDates
  @calendarHTML @type
  $('.dr-presets', @element).click ->
    self.presetToggle()
    return
  $('.dr-list-item', @element).click ->
    start = $('.dr-item-aside', this).data('start')
    end = $('.dr-item-aside', this).data('end')
    self.start_date = self.calendarCheckDate(start)
    self.end_date = self.calendarCheckDate(end)
    self.calendarSetDates()
    self.presetToggle()
    self.calendarSaveDates()
    return
  $('.dr-date', @element).on
    'click': ->
      self.calendarOpen this
      return
    'keyup': (event) ->
      if event.keyCode == 9 and !self.calIsOpen and !self.start_date and !self.end_date
        self.calendarOpen this
      return
    'keydown': (event) ->
      `var timeframe`
      switch event.keyCode
        when 9
          # Tab
          if $(self.selected).hasClass('dr-date-start')
            event.preventDefault()
            self.calendarCheckDates()
            self.calendarSetDates()
            $('.dr-date-end', self.element).trigger 'click'
          else
            self.calendarCheckDates()
            self.calendarSetDates()
            self.calendarSaveDates()
            self.calendarClose 'force'
        when 13
          # Enter
          event.preventDefault()
          self.calendarCheckDates()
          self.calendarSetDates()
          self.calendarSaveDates()
          self.calendarClose 'force'
        when 27
          # ESC
          self.calendarSetDates()
          self.calendarClose 'force'
        when 38
          # Up
          event.preventDefault()
          timeframe = 'day'
          if event.shiftKey
            timeframe = 'week'
          if event.metaKey
            timeframe = 'month'
          back = moment(self.current_date).subtract(1, timeframe)
          $(this).html back.format(self.format.input)
          self.current_date = back
        when 40
          # Down
          event.preventDefault()
          timeframe = 'day'
          if event.shiftKey
            timeframe = 'week'
          if event.metaKey
            timeframe = 'month'
          forward = moment(self.current_date).add(1, timeframe)
          $(this).html forward.format(self.format.input)
          self.current_date = forward
      return
  $('.dr-month-switcher i', @element).click ->
    m = $('.dr-month-switcher span', self.element).data('month')
    y = $('.dr-year-switcher span', self.element).data('year')
    this_moment = moment([
      y
      m
      1
    ])
    back = this_moment.clone().subtract(1, 'month')
    forward = this_moment.clone().add(1, 'month').startOf('day')
    if $(this).hasClass('dr-left')
      self.calendarOpen self.selected, back
    else if $(this).hasClass('dr-right')
      self.calendarOpen self.selected, forward
    return
  $('.dr-year-switcher i', @element).click ->
    m = $('.dr-month-switcher span', self.element).data('month')
    y = $('.dr-year-switcher span', self.element).data('year')
    this_moment = moment([
      y
      m
      1
    ])
    back = this_moment.clone().subtract(1, 'year')
    forward = this_moment.clone().add(1, 'year').startOf('day')
    if $(this).hasClass('dr-left')
      self.calendarOpen self.selected, back
    else if $(this).hasClass('dr-right')
      self.calendarOpen self.selected, forward
    return
  $('.dr-dates-dash', @element).click ->
    $('.dr-date-start', self.element).trigger 'click'
    return
  # Once you click into a selection.. this lets you click out
  @element.on 'click', ->
    document.addEventListener 'click', (f) ->
      contains = self.element.find(f.path[0])
      if !contains.length
        if self.presetIsOpen
          self.presetToggle()
        if self.calIsOpen
          if $(self.selected).hasClass('dr-date-end')
            self.calendarSaveDates()
          self.calendarSetDates()
          self.calendarClose 'force'
      return
    return
  return

selectOneDate = (other, cal, date) ->
  string = moment(date).format(cal.format.input)
  if other
    $('.dr-date', cal.element).not(cal.selected).html other.format(cal.format.input)
  $(cal.selected).html string
  cal.calendarOpen cal.selected
  if $(cal.selected).hasClass('dr-date-start')
    $('.dr-date-end', cal.element).trigger 'click'
  else
    cal.calendarSaveDates()
    cal.calendarClose 'force'
  return

Calendar::presetToggle = ->
  if @presetIsOpen == false
    @orig_start_date = @start_date
    @orig_end_date = @end_date
    @orig_current_date = @current_date
    @presetIsOpen = true
  else if @presetIsOpen
    @presetIsOpen = false
  if @calIsOpen == true
    @calendarClose()
  $('.dr-preset-list', @element).slideToggle 200
  $('.dr-input', @element).toggleClass 'dr-active'
  $('.dr-presets', @element).toggleClass 'dr-active'
  @element.toggleClass 'dr-active'
  return

Calendar::presetCreate = ->
  self = this
  ul_presets = $('<ul class="dr-preset-list" style="display: none;"></ul>')
  presets = if typeof self.settings.presets == 'object' then self.settings.presets else [
    {
      label: 'Last 30 days'
      start: moment(self.latest_date).subtract(29, 'days')
      end: self.latest_date
    }
    {
      label: 'Last month'
      start: moment(self.latest_date).subtract(1, 'month').startOf('month')
      end: moment(self.latest_date).subtract(1, 'month').endOf('month')
    }
    {
      label: 'Last 3 months'
      start: moment(self.latest_date).subtract(3, 'month').startOf('month')
      end: moment(self.latest_date).subtract(1, 'month').endOf('month')
    }
    {
      label: 'Last 6 months'
      start: moment(self.latest_date).subtract(6, 'month').startOf('month')
      end: moment(self.latest_date).subtract(1, 'month').endOf('month')
    }
    {
      label: 'Last year'
      start: moment(self.latest_date).subtract(12, 'month').startOf('month')
      end: moment(self.latest_date).subtract(1, 'month').endOf('month')
    }
    {
      label: 'All time'
      start: self.earliest_date
      end: self.latest_date
    }
  ]
  if moment(self.latest_date).diff(moment(self.latest_date).startOf('month'), 'days') >= 6 and typeof self.settings.presets != 'object'
    presets.splice 1, 0,
      label: 'This month'
      start: moment(self.latest_date).startOf('month')
      end: self.latest_date
  $.each presets, (i, d) ->
    if moment(d.start).isBefore(self.earliest_date)
      d.start = self.earliest_date
    if moment(d.start).isAfter(self.latest_date)
      d.start = self.latest_date
    if moment(d.end).isBefore(self.earliest_date)
      d.end = self.earliest_date
    if moment(d.end).isAfter(self.latest_date)
      d.end = self.latest_date
    startISO = moment(d.start).toISOString()
    endISO = moment(d.end).toISOString()
    string = moment(d.start).format(self.format.preset) + ' &ndash; ' + moment(d.end).format(self.format.preset)
    if $('.dr-preset-list', self.element).length
      item = $('.dr-preset-list .dr-list-item:nth-of-type(' + i + 1 + ') .dr-item-aside', self.element)
      item.data 'start', startISO
      item.data 'end', endISO
      item.html string
    else
      ul_presets.append '<li class="dr-list-item">' + d.label + '<span class="dr-item-aside" data-start="' + startISO + '" data-end="' + endISO + '">' + string + '</span>' + '</li>'
    return
  ul_presets

Calendar::calendarSetDates = ->
  $('.dr-date-start', @element).html moment(@start_date).format(@format.input)
  $('.dr-date-end', @element).html moment(@end_date).format(@format.input)
  if !@start_date and !@end_date
    old_date = $('.dr-date', @element).html()
    new_date = moment(@current_date).format(@format.input)
    if old_date.length == 0 and !@required
      new_date = ''
    if old_date != new_date
      $('.dr-date', @element).html new_date
  return

Calendar::calendarSaveDates = ->
  if @type == 'double'
    if !moment(@orig_end_date).isSame(@end_date) or !moment(@orig_start_date).isSame(@start_date)
      return @callback()
  else
    if !@required or !moment(@orig_current_date).isSame(@current_date)
      return @callback()
  return

Calendar::calendarCheckDate = (d) ->
  # Today
  if d == 'today' or d == 'now'
    return if moment().isAfter(@latest_date) then @latest_date else if moment().isBefore(@earliest_date) then @earliest_date else moment()
  # Earliest
  if d == 'earliest'
    return @earliest_date
  # Latest
  if d == 'latest'
    return @latest_date
  # Convert string to a date if keyword ago or ahead exists
  if d and (/\bago\b/.test(d) or /\bahead\b/.test(d))
    return @stringToDate(d)
  regex = /(?:\d)((?:st|nd|rd|th)?,?)/
  d_array = if d then d.replace(regex, '').split(' ') else []
  # Add current year if year is not included
  if d_array.length == 2
    d_array.push moment().format(@format.jump_year)
    d = d_array.join(' ')
  # Convert using settings format
  parsed_d = @parseDate(d)
  if !parsed_d.isValid()
    return moment(d)
  # occurs when parsing preset dates
  parsed_d

Calendar::calendarCheckDates = ->
  startTxt = $('.dr-date-start', @element).html()
  endTxt = $('.dr-date-end', @element).html()
  c = @calendarCheckDate($(@selected).html())
  s = undefined
  e = undefined
  # Modify strings via some specific keywords to create valid dates
  # Finally set all strings as dates
  if startTxt == 'ytd' or endTxt == 'ytd'
    # Year to date
    s = moment().startOf('year')
    e = moment().endOf('year')
  else
    s = @calendarCheckDate(startTxt)
    e = @calendarCheckDate(endTxt)
  if c.isBefore(@earliest_date)
    c = @earliest_date
  if s.isBefore(@earliest_date)
    s = @earliest_date
  if e.isBefore(@earliest_date) or e.isBefore(s)
    e = s.clone().add(6, 'day')
  if c.isAfter(@latest_date)
    c = @latest_date
  if e.isAfter(@latest_date)
    e = @latest_date
  if s.isAfter(@latest_date) or s.isAfter(e)
    s = e.clone().subtract(6, 'day')
  # Push and save if it's valid otherwise return to previous state
  if @type == 'double'
    # Is this a valid date?
    if s.isSame(e) and !@sameDayRange
      return @calendarSetDates()
    @start_date = if s.isValid() then s else @start_date
    @end_date = if e.isValid() then e else @end_date
  @current_date = if c.isValid() then c else @current_date
  return

Calendar::stringToDate = (str) ->
  date_arr = str.split(' ')
  if date_arr[2] == 'ago'
    return moment(@current_date).subtract(date_arr[0], date_arr[1])
  else if date_arr[2] == 'ahead'
    return moment(@current_date).add(date_arr[0], date_arr[1])
  @current_date

Calendar::calendarOpen = (selected, switcher) ->
  self = this
  other = undefined
  cal_width = $('.dr-dates', @element).innerWidth() - 8
  @selected = selected or @selected
  if @presetIsOpen == true
    @presetToggle()
  if @calIsOpen == true
    @calendarClose if switcher then 'switcher' else undefined
  else if $(@selected).html().length
    @orig_start_date = @start_date
    @orig_end_date = @end_date
    @orig_current_date = @current_date
  @calendarCheckDates()
  @calendarCreate switcher
  @calendarSetDates()
  next_month = moment(switcher or @current_date).add(1, 'month').startOf('month').startOf('day')
  past_month = moment(switcher or @current_date).subtract(1, 'month').endOf('month')
  next_year = moment(switcher or @current_date).add(1, 'year').startOf('month').startOf('day')
  past_year = moment(switcher or @current_date).subtract(1, 'year').endOf('month')
  this_moment = moment(switcher or @current_date)
  $('.dr-month-switcher span', @element).data('month', this_moment.month()).html this_moment.format(@format.jump_month)
  $('.dr-year-switcher span', @element).data('year', this_moment.year()).html this_moment.format(@format.jump_year)
  $('.dr-switcher i', @element).removeClass 'dr-disabled'
  if next_month.isAfter(@latest_date)
    $('.dr-month-switcher .dr-right', @element).addClass 'dr-disabled'
  if past_month.isBefore(@earliest_date)
    $('.dr-month-switcher .dr-left', @element).addClass 'dr-disabled'
  if next_year.isAfter(@latest_date)
    $('.dr-year-switcher .dr-right', @element).addClass 'dr-disabled'
  if past_year.isBefore(@earliest_date)
    $('.dr-year-switcher .dr-left', @element).addClass 'dr-disabled'
  $('.dr-day', @element).on
    mouseenter: ->
      `var selected`
      selected = $(this)
      start_date = moment(self.start_date)
      end_date = moment(self.end_date)
      current_date = moment(self.current_date)

      setMaybeRange = (type) ->
        other = undefined
        self.range(6 * 7).forEach (i) ->
          next = selected.next().data('date')
          prev = selected.prev().data('date')
          curr = selected.data('date')
          if !curr
            return false
          if !prev
            prev = curr
          if !next
            next = curr
          if type == 'start'
            if moment(next).isSame(self.end_date) or self.sameDayRange and moment(curr).isSame(self.end_date)
              return false
            if moment(curr).isAfter(self.end_date)
              other = other or moment(curr).add(6, 'day').startOf('day')
              if i > 5 or (if next then moment(next).isAfter(self.latest_date) else false)
                $(selected).addClass 'dr-end'
                other = moment(curr)
                return false
            selected = selected.next().addClass('dr-maybe')
          else if type == 'end'
            if moment(prev).isSame(self.start_date) or self.sameDayRange and moment(curr).isSame(self.start_date)
              return false
            if moment(curr).isBefore(self.start_date)
              other = other or moment(curr).subtract(6, 'day')
              if i > 5 or (if prev then moment(prev).isBefore(self.earliest_date) else false)
                $(selected).addClass 'dr-start'
                other = moment(curr)
                return false
            selected = selected.prev().addClass('dr-maybe')
          return
        return

      if $(self.selected).hasClass('dr-date-start')
        selected.addClass 'dr-hover dr-hover-before'
        $('.dr-start', self.element).css
          'border': 'none'
          'padding-left': '0.3125rem'
        setMaybeRange 'start'
      if $(self.selected).hasClass('dr-date-end')
        selected.addClass 'dr-hover dr-hover-after'
        $('.dr-end', self.element).css
          'border': 'none'
          'padding-right': '0.3125rem'
        setMaybeRange 'end'
      if !self.start_date and !self.end_date
        selected.addClass 'dr-maybe'
      $('.dr-selected', self.element).css 'background-color', 'transparent'
      return
    mouseleave: ->
      if $(this).hasClass('dr-hover-before dr-end')
        $(this).removeClass 'dr-end'
      if $(this).hasClass('dr-hover-after dr-start')
        $(this).removeClass 'dr-start'
      $(this).removeClass 'dr-hover dr-hover-before dr-hover-after'
      $('.dr-start, .dr-end', self.element).css
        'border': ''
        'padding': ''
      $('.dr-maybe:not(.dr-current)', self.element).removeClass 'dr-start dr-end'
      $('.dr-day', self.element).removeClass 'dr-maybe'
      $('.dr-selected', self.element).css 'background-color', ''
      return
  if /iPad|iPhone|iPod/.test(navigator.userAgent) and !window.MSStream
    $('.dr-day', @element).on touchstart: ->
      selectOneDate other, self, $(this).data('date')
      return
    $('div[contenteditable]', @element).removeAttr 'contenteditable'
  else
    $('.dr-day', @element).on mousedown: ->
      selectOneDate other, self, $(this).data('date')
      return
  $('.dr-calendar', @element).css('width', cal_width).slideDown 200
  $('.dr-input', @element).addClass 'dr-active'
  $(selected).addClass('dr-active').focus()
  @element.addClass 'dr-active'
  @calIsOpen = true
  return

Calendar::calendarClose = (type) ->
  self = this
  if !@calIsOpen or @presetIsOpen or type == 'force'
    $('.dr-calendar', @element).slideUp 200, ->
      $('.dr-day', self.element).remove()
      return
  else
    $('.dr-day', @element).remove()
  if type == 'switcher'
    return false
  $('.dr-input, .dr-date', @element).removeClass 'dr-active'
  @element.removeClass 'dr-active'
  @calIsOpen = false
  return

Calendar::calendarCreate = (switcher) ->
  self = this
  array = @calendarArray(@start_date, @end_date, @current_date, switcher)
  array.forEach (d, i) ->
    classString = 'dr-day'
    if d.fade
      classString += ' dr-fade'
    if d.start
      classString += ' dr-start'
    if d.end
      classString += ' dr-end'
    if d.current
      classString += ' dr-current'
    if d.selected
      classString += ' dr-selected'
    if d.outside
      classString += ' dr-outside'
    $('.dr-day-list', self.element).append '<li class="' + classString + '" data-date="' + d.date + '">' + d.str + '</li>'
    return
  return

Calendar::calendarArray = (start, end, current, switcher) ->
  self = this
  current = moment(current or start or end).startOf('day')
  reference = switcher or current or start or end
  startRange = moment(reference).startOf('month').startOf('week')
  endRange = moment(startRange).add(6 * 7 - 1, 'days').endOf('day')
  daysInRange = []
  d = moment(startRange)
  while d.isBefore(endRange)
    daysInRange.push
      str: +d.format('D')
      start: start and d.isSame(start, 'day')
      end: end and d.isSame(end, 'day')
      current: current and d.isSame(current, 'day')
      selected: start and end and d.isBetween(start, end)
      date: d.toISOString()
      outside: d.isBefore(self.earliest_date) or d.isAfter(self.latest_date)
      fade: !d.isSame(reference, 'month')
    d.add 1, 'd'
  daysInRange

Calendar::calendarHTML = (type) ->
  ul_days_of_the_week = $('<ul class="dr-days-of-week-list"></ul>')
  days = @days_array.splice(moment.localeData().firstDayOfWeek()).concat(@days_array.splice(0, moment.localeData().firstDayOfWeek()))
  $.each days, (i, elem) ->
    ul_days_of_the_week.append '<li class="dr-day-of-week">' + elem + '</li>'
    return
  if type == 'double'
    return @element.append('<div class="dr-input">' + '<div class="dr-dates">' + '<div class="dr-date dr-date-start" contenteditable>' + moment(@start_date).format(@format.input) + '</div>' + '<span class="dr-dates-dash">&ndash;</span>' + '<div class="dr-date dr-date-end" contenteditable>' + moment(@end_date).format(@format.input) + '</div>' + '</div>' + (if @presets then '<div class="dr-presets">' + '<span class="dr-preset-bar"></span>' + '<span class="dr-preset-bar"></span>' + '<span class="dr-preset-bar"></span>' + '</div>' else '') + '</div>' + '<div class="dr-selections">' + '<div class="dr-calendar" style="display: none;">' + '<div class="dr-range-switcher">' + '<div class="dr-switcher dr-month-switcher">' + '<i class="dr-left"></i>' + '<span>April</span>' + '<i class="dr-right"></i>' + '</div>' + '<div class="dr-switcher dr-year-switcher">' + '<i class="dr-left"></i>' + '<span>2015</span>' + '<i class="dr-right"></i>' + '</div>' + '</div>' + ul_days_of_the_week[0].outerHTML + '<ul class="dr-day-list"></ul>' + '</div>' + (if @presets then @presetCreate()[0].outerHTML else '') + '</div>')
  @element.append '<div class="dr-input">' + '<div class="dr-dates">' + '<div class="dr-date" contenteditable placeholder="' + @placeholder + '">' + (if @settings.current_date then moment(@current_date).format(@format.input) else '') + '</div>' + '</div>' + '</div>' + '<div class="dr-selections">' + '<div class="dr-calendar" style="display: none;">' + '<div class="dr-range-switcher">' + '<div class="dr-switcher dr-month-switcher">' + '<i class="dr-left"></i>' + '<span></span>' + '<i class="dr-right"></i>' + '</div>' + '<div class="dr-switcher dr-year-switcher">' + '<i class="dr-left"></i>' + '<span></span>' + '<i class="dr-right"></i>' + '</div>' + '</div>' + ul_days_of_the_week[0].outerHTML + '<ul class="dr-day-list"></ul>' + '</div>' + '</div>'

Calendar::parseDate = (d) ->
  if moment.defaultZone != null and moment.hasOwnProperty('tz')
    moment.tz d, @format.input, moment.defaultZone.name
  else
    moment d, @format.input

Calendar::range = (length) ->
  range = new Array(length)
  idx = 0
  while idx < length
    range[idx] = idx
    idx++
  range

export default Calendar
