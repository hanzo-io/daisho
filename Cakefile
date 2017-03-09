require 'shortcake'

use 'cake-test'
use 'cake-publish'
use 'cake-version'

option '-b', '--browser [browser]', 'browser to use for tests'
option '-g', '--grep [filter]',     'test filter'
option '-t', '--test [test]',       'specify test to run'
option '-v', '--verbose',           'enable verbose test logging'

task 'clean', 'clean project', ->
  exec 'rm -rf lib'

task 'build', 'build project', ->
  handroll = require 'handroll'

  yield handroll.write
    entry:    'src/index.coffee'
    format:   'es'
    external: true

task 'watch', 'watch project for changes and rebuild', ->
  watch 'src/*', -> invoke 'build'
