Promise     = require 'broken'
Xhr         = require 'xhr-promise-es6'
Xhr.Promise = Promise

page        = require 'page'

require.urlFor = (file)->
  return '/example/fixtures/' + file

exports =
  # basepath is the path of the web page
  basePath: ''

  # Master list of modules
  moduleDefinitions:    []

  # List of modules required by name
  modulesRequired:      []

  # Indexed map of modules required and loaded
  modules:              {}

  # Element with which to render the dashboard pages into
  renderElement: null

  # init sets up the router using basepath and takes the url of the modules.json and downloads it
  init: (@basePath, @modulesUrl)->
    page.base @basePath

    opts =
      url:      @modulesUrl
      method:   'GET'

    (new Xhr).send opts
      .then (res) =>
        @moduleDefinitions =  res.responseText

        return @moduleDefinitions
      .catch (res) ->
        console.log 'ERROR:', res

  # set the element into which dashboard pages render
  setRenderElement: (@renderElement)->

  # load takes an array of module names, looks them up in the saved module.json and requires them in
  load: (@modulesRequired, @defaultModule)->
    return new Promise (resolve, reject)=>
      timeoutId = setTimeout ()->
        reject(new Error "Loading Timed Out")
      , 10000

      waits = 0

      @modules = modules = {}
      for moduleRequired in @modulesRequired
        module = @_getModule moduleRequired

        waits++

        do (module, modules)=>
          m = {}
          m.definition = module
          require module.name + '-v' + module.version + '/bundle.js', (js)->
            m.name  = js.name
            m.js    = js

            waits--
            clearTimeout timeoutId

            modules[module.name] = m

            for r, p of js.prototype.routes
              r = '' if r == '/'
              do (r, p)=>
                page '/' + module.name + r, ()=>
                  moduleInstance = (new js)
                  if @activeModuleInstance != moduleInstance
                    if @activeModuleInstance?.unload
                      @activeModuleInstance.unload()
                    @activeModuleInstance = moduleInstance
                    @activeModuleInstance.load()

                  if @activePageInstance?.unload
                    @activePageInstance.unload()
                  @activePageInstance = (new p @renderElement, @activeModuleInstance)
                  @activePageInstance.load()
                  @activePageInstance.render()

            if waits == 0
              page()
              resolve(modules)

          m.css = module.name + '-v' + module.version + '/bundle.css'

      p.resolve(@modules) if waits == 0

  # change page route
  route: (route)->
    page route

  # _getModule takes
  _getModule: (moduleName)->
    for module in @moduleDefinitions
      if moduleName == module.name
        return module

window.Daisho = exports if window?

module.exports = exports
