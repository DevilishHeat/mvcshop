const APP_NAME = 'mvcshop'

module.exports = {
  app: {
    src: './src',
    build: `./${APP_NAME}`,
  },
  phpCore: {
    src: ['./src/php/**/*.*', './src/php/.*'],
    watch: './src/php/**/*.*',
    dest: `./${APP_NAME}`
  },
  styles: {
    src: {main: './src/assets/styles/main.scss', vendor: './src/assets/styles/vendor.scss'},
    watch: {main: './src/assets/styles/**/*.scss', vendor: './src/assets/styles/vendor.scss'},
    build: `./${APP_NAME}/assets/css`
  },
  scripts: {
    src: './src/assets/scripts/index.js',
    watch: './src/assets/scripts/**/*.js',
    build: `./${APP_NAME}/assets/scripts`
  },
  images: {
    src: './src/assets/images/**/*.*',
    watch: './src/assets/images/**/*.*',
    build: `./${APP_NAME}/assets/images`
  }
}
