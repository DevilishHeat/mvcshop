const { task, series, parallel } = require('gulp');
const tasks = require('./utils/tasks');

task('clean', tasks.clean);
task('phpCore', tasks['php-core']);
task('styles', tasks.styles);
task('styles:vendor', tasks['styles-vendor']);
task('scripts', tasks.scripts);
task('images', tasks.images);
task('watchers', tasks.watchers);
task('server', tasks.server);

task(
  'build',
  series(
    'clean',
    parallel('images', 'scripts', 'styles:vendor', 'styles', 'phpCore'),
  ),
);
task('default', series('build', parallel('watchers', 'server')));
