require 'shortcake'

use 'cake-test'
use 'cake-publish'
use 'cake-version'

fs        = require 'fs'
pkg       = require './package'
requisite = require 'requisite'

option '-b', '--browser [browser]', 'browser to use for tests'
option '-g', '--grep [filter]',     'test filter'
option '-t', '--test [test]',       'specify test to run'
option '-v', '--verbose',           'enable verbose test logging'

task 'clean', 'clean project', ->
  exec 'rm -rf lib'

task 'build', 'build project', (cb) ->
  opts =
    entry:      'src/index.coffee'
    compilers:
      pug: requisite.compilers.pug
    stripDebug: true

  requisite.bundle opts, (err, bundle) ->
    return cb err if err?
    fs.writeFile pkg.name + '.js', (bundle.toString opts), 'utf8', cb

  return

task 'build:min', 'build project', ['build'], ->
  exec "uglifyjs #{pkg.name}.js --compress --mangle --lint=false > #{pkg.name}.min.js"

task 'watch', 'watch for changes and recompile project', ->
  exec 'coffee -bcmw -o lib/ src/'
