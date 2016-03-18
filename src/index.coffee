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

  # List of modules in the order they were specified in load()
  moduleList:  []

  # Element with which to render the dashboard pages into
  renderElement: null

  # Whether or not page.js is initialized
  started: false

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

      @modules      = modules       = {}
      @moduleList   = moduleList    = []

      for moduleRequired in @modulesRequired
        module = @_getModule moduleRequired

        waits++

        do (module, modules, moduleList)=>
          m = {}
          m.definition = module
          moduleList.push m
          modules[module.name] = m

          do (m)=>
            require module.name + '-v' + module.version + '/bundle.js', (js)=>
              m.name  = js.name
              m.js    = js
              m.key   = module.name

              waits--
              clearTimeout timeoutId


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
                      while @renderElement.firstChild?
                        @renderElement.removeChild @renderElement.firstChild

                    @activePageInstance = (new p @renderElement, @activeModuleInstance)
                    @activePageInstance.load()
                    @activePageInstance.render()

              if waits == 0
                resolve { modules: @modules, moduleList: @moduleList }

            m.css = module.name + '-v' + module.version + '/bundle.css'

       if waits == 0
         p.resolve { modules: @modules, moduleList: @moduleList }

  # change page route
  route: (route)->
    if !@started
      @started = true
      page()

    page @basePath + '/' + route

  # _getModule takes
  _getModule: (moduleName)->
    for module in @moduleDefinitions
      if moduleName == module.name
        return module

window.Daisho = exports if window?

module.exports = exports
