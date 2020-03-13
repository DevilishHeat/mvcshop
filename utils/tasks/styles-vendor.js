const { src, dest } = require('gulp'),
      { styles } = require('../paths'),
      gulpIf = require('gulp-if'),
      rename = require('gulp-rename'),
      preprocessor = require('gulp-sass'),
      postcss = require('gulp-postcss'),
      cssnano = require('gulp-cssnano'),
      atImport = require('postcss-easy-import'),
      argv = require('yargs').argv,
      PRODUCTION = !!argv.production;

module.exports = () => {
  return src(styles.src.vendor)
  .pipe(preprocessor())
  .pipe(postcss([atImport()]))
  .pipe(gulpIf(PRODUCTION, cssnano()))
  .pipe(rename('vendor.css'))
  .pipe(dest(styles.build));
};
