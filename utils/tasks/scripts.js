const { src, dest } = require('gulp'),
      { scripts } = require('../paths'),
      debug = require('gulp-debug'),
      sourcemaps = require('gulp-sourcemaps'),
      rename = require('gulp-rename');
      plumber = require('gulp-plumber'),
      notify = require('gulp-notify'),
      gulpIf = require('gulp-if'),
      rollup = require('gulp-better-rollup'),
      babel = require('rollup-plugin-babel'),
      resolve = require('rollup-plugin-node-resolve'),
      commonjs = require('rollup-plugin-commonjs'),
      terser = require('rollup-plugin-terser'),
      argv = require('yargs').argv,
      PRODUCTION = !!argv.production;

module.exports = () => {
  const options = {
    input: {
      input: scripts.src,
      plugins: [
        babel({
          exclude: 'node_modules/**',
          runtimeHelpers: true
        }),
        resolve(),
        commonjs({
          include: 'node_modules/**'
        }),
      ]
    },
    output: {
      format: 'umd'
    }
  };

  const { input, output } = options;

  return src(scripts.src)
    .pipe(plumber({
      errorHandler: notify.onError((error) => {
        console.log(error.message);
      })
    }))
    .pipe(gulpIf(!PRODUCTION, sourcemaps.init()))
    .pipe(rollup(input, output))
    .pipe(gulpIf(!PRODUCTION, sourcemaps.write()))
    .pipe(rename('bundle.js'))
    .pipe(dest(scripts.build));
}
