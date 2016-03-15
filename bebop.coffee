fs        = require 'fs'
path      = require 'path'
exec      = require('executive').interactive
requisite = require 'requisite'

compileCoffee = (src) ->
  if /^src|src\/index.coffee$/.test src

    requisite.bundle
      entry: 'src/index.coffee'
      globalRequire: true
    , (err, bundle) ->
      return console.error err if err?
      fs.writeFileSync 'daisho.js', bundle.toString(), 'utf8'
      console.log 'compiled daisho.js'

  else if /^example\/js|example\/js\/index.coffee$/.test src

    requisite.bundle
      entry: 'example/js/index.coffee'
      globalRequire: true
    , (err, bundle) ->
      return console.error err if err?
      fs.writeFileSync 'example/js/index.js', bundle.toString(), 'utf8'
      console.log 'compiled example/js/index.js'

  else if /^example\/fixtures/.test src

    requisite.bundle
      entry: 'example/fixtures/user-v1.0.0/main.coffee'
      globalRequire: true
      prelude: false
      async: true
      requireAs: 'user-v1.0.0/bundle.js'
    , (err, bundle) ->
      return console.error err if err?
      fs.writeFileSync 'example/fixtures/user-v1.0.0/bundle.js', bundle.toString(), 'utf8'
      console.log 'compiled example/fixtures/user-v1.0.0/bundle.js'

    requisite.bundle
      entry: 'example/fixtures/home-v1.0.0/main.coffee'
      globalRequire: true
      prelude: false
      async: true
      requireAs: 'home-v1.0.0/bundle.js'
    , (err, bundle) ->
      return console.error err if err?
      fs.writeFileSync 'example/fixtures/home-v1.0.0/bundle.js', bundle.toString(), 'utf8'
      console.log 'compiled example/fixtures/home-v1.0.0/bundle.js'

module.exports =
  port: 4242

  cwd: process.cwd()

  exclude: [
    /lib/
    /node_modules/
    /vendor/
  ]

  compilers:
    css: -> false

    coffee: compileCoffee

    styl: (src, dst) ->
      CleanCSS     = require 'clean-css'
      autoprefixer = require 'autoprefixer'
      comments     = require 'postcss-discard-comments'
      lost         = require 'lost-stylus'
      postcss      = require 'poststylus'
      rupture      = require 'rupture'
      stylus       = require 'stylus'

      src = 'example/css/main.styl'
      dst = 'example/css/main.css'

      style = stylus fs.readFileSync src, 'utf8'
        .set 'filename', src
        .set 'include css', true
        .set 'sourcemap',
          basePath: ''
          sourceRoot: '../'
        .use lost()
        .use rupture()
        .use postcss [
          autoprefixer browsers: '> 1%'
          'lost'
          'rucksack-css'
          'css-mqpacker'
          comments removeAll: true
        ]

      style.render (err, css) ->
        return console.error err if err

        sourceMapURL = (path.basename dst) + '.map'

        unless process.env.PRODUCTION
          css = css + "/*# sourceMappingURL=#{sourceMapURL} */"

          fs.writeFile dst, css, 'utf8'
          fs.writeFile dst + '.map', JSON.stringify style.sourcemap, 'utf8'
          return

        minified = new CleanCSS
          semanticMerging: false
          # sourceMap:       style.sourcemap
        .minify css

        fs.writeFile dst, minified.styles, 'utf8'

        # styles = minified.styles + "/*# sourceMappingURL=#{sourceMapURL} */"
        # fs.writeFileSync dst, styles, 'utf8'
        # fs.writeFileSync dst + '.map', minified.sourceMap, 'utf8'

      true

