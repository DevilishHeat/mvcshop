const { src, lastRun, dest } = require('gulp'),
      { app, assets } = require('../paths')
      newer = require('gulp-newer'),
      debug = require('gulp-debug');

module.exports = () => {
  return src(assets.src, {base: 'src/', since: lastRun('copy')})
  .pipe(newer(app.build))
  .pipe(dest(app.build));
};
