require 'shortcake'

use 'cake-bundle'
use 'cake-linked'
use 'cake-outdated'
use 'cake-publish'
use 'cake-test'
use 'cake-version'

task 'clean', 'clean project', ->
  exec 'rm -rf lib'

task 'build', 'build project', ->
  bundle.write
    cache:    false
    entry:  'src/index.coffee'
    format: 'es'
    compilers:
      coffee:
        version: 1

task 'watch', 'watch project for changes and rebuild', ->
  watch 'src/*', -> invoke 'build'
