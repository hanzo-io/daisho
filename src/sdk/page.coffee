module.exports = class Page
  # Element that this element renders in
  el: null

  # Module is the module with this page
  module: null

  # Set the element to render into and the module this page is apart of
  constructor: (@el, @module)->

  # Load everything associated with this page
  load: ()->

  # Unload everything associated with this page
  unload: ()->

  annotations: ()->

