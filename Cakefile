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

  bundle = yield handroll.bundle
    entry:    'src/index.coffee'
    commonjs: true

  # CommonJS
  bundle.write
    format:     'cjs'
    sourceMap: false

  # CommonJS
  bundle.write
    format:     'es'
    sourceMap: false
