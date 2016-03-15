if window?
  Views = require './views'
  window.Dashboard =
    Views: Views

  Views.register()

