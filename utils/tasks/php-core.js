'use strict';

const { src, dest } = require('gulp'),
      { phpCore } = require('../paths'),
      plumber = require('gulp-plumber'),
      notify = require('gulp-notify');


module.exports = () => {
return src(phpCore.src)
    .pipe(plumber({
      errorHandler: notify.onError((error) => {
        console.log(error.message);
      })
    }))
    .pipe(dest(phpCore.dest));
};
