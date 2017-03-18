require 'shortcake'

use 'cake-bundle'
use 'cake-outdated'
use 'cake-publish'
use 'cake-test'
use 'cake-version'

task 'clean', 'clean project', ->
  exec 'rm -rf lib'

task 'build', 'build project', ->
  bundle.write
    entry:  'src/index.coffee'
    format: 'es'
    compilers:
      coffee:
        version: 2

task 'watch', 'watch project for changes and rebuild', ->
  watch 'src/*', -> invoke 'build'
