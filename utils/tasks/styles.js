const {src, dest} = require('gulp'),
      {styles} = require('../paths'),
      plumber = require('gulp-plumber'),
      notify = require('gulp-notify'),
      gulpIf = require('gulp-if'),
      sourcemaps = require('gulp-sourcemaps'),
      rename = require('gulp-rename'),
      preprocessor = require('gulp-sass'),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      cssnano = require('gulp-cssnano'),
      objectFit = require('postcss-object-fit-images'),
      // inlineSvg = require('postcss-inline-svg'),
      zIndex = require('postcss-zindex'),
      atImport = require('gulp-sass-glob'),
      groupAtMediaQuaries = require('gulp-group-css-media-queries'),
      argv = require('yargs').argv,
      PRODUCTION = !!argv.production;

module.exports = () => {
  const plugins = [
    // inlineSvg(),
    objectFit(),
    autoprefixer(),
    zIndex()
  ];

  return src(styles.src.main)
    .pipe(plumber({
      errorHandler: notify.onError((error) => {
        console.log(error.message);
      })
    }))
    .pipe(gulpIf(!PRODUCTION, sourcemaps.init()))
    .pipe(atImport())
    .pipe(preprocessor())
    .pipe(postcss(plugins))
    .pipe(groupAtMediaQuaries())
    .pipe(gulpIf(!PRODUCTION, sourcemaps.write()))
    .pipe(gulpIf(PRODUCTION, cssnano()))
    .pipe(rename('main.css'))
    .pipe(dest(styles.build));
};
