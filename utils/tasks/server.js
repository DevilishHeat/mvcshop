const gulp = require('gulp'),
      { app } = require('../paths'),
      bs = require('browser-sync').create();

module.exports = () => {
  bs.init({
    proxy: 'mvcshop.com',
    notify: false,
    ui: false
  });
  bs.watch(app.build).on('change', bs.reload);
};