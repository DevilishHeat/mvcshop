'use strict';

const { watch, series } = require('gulp');
const {phpCore, styles, scripts, images, icons, assets} = require('../paths');

module.exports = () => {
  watch(images.watch, series('images'));
  watch(styles.watch.vendor, series('styles:vendor'));
  watch(scripts.watch, series('scripts'));
  watch(styles.watch.main, series('styles'));
  watch(phpCore.watch, series('phpCore'));
};
