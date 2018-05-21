'use strict';

use('sake-bundle');

use('sake-linked');

use('sake-outdated');

use('sake-publish');

use('sake-test');

use('sake-version');

task('clean', 'clean project', function () {
  return exec('rm -rf lib');
});

task('build', 'build project', function () {
  return bundle.write({
    cache: false,
    entry: 'src/index.coffee',
    format: 'es',
    compilers: {
      coffee: {
        version: 1
      }
    }
  });
});

task('watch', 'watch project for changes and rebuild', function () {
  return watch('src/*', function () {
    return invoke('build');
  });
});