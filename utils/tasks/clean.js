const { app } = require('../paths'),
      del = require('del');

module.exports = () => {
  return del(app.build);
};
