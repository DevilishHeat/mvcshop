const { src, dest, lastRun } = require('gulp'),
      { images } = require('../paths'),
      debug = require('gulp-debug'),
      newer = require('gulp-newer'),
      gulpIf = require('gulp-if'),
      imagemin = require('gulp-imagemin'),
      { optipng, jpegtran, svgo } = require('gulp-imagemin'),
      imageminPngquant = require('imagemin-pngquant'),
      imageminMozjpeg = require('imagemin-mozjpeg'),
      argv = require('yargs').argv,
      PRODUCTION = !!argv.production;

module.exports = () => {
  const plugins = [
    optipng({optimizationLevel: 5}),
    imageminPngquant({
      speed: 1,
      quality: [0.8, 0.9]
    }),
    jpegtran({
      progressive: true
    }),
    imageminMozjpeg({
      quality: 85
    }),
    svgo({
      plugins: [
        {
          removeViewBox: false,
          collapseGroups: true,
          prefixIds: true,
          removeStyleElement: true
        }
      ]
    })
  ];

  return src(images.src, {since: lastRun('images')})
    .pipe(newer(images.build))
    .pipe(gulpIf(PRODUCTION, imagemin(plugins)))
    .pipe(dest(images.build));
};
