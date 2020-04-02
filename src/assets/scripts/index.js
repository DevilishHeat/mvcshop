import 'svgxuse';
import objectFitImages from './polyfills/objectFitImages';

import authorization from './modules/authorization';
import registration from './modules/registration';
import logout from './modules/logout';

objectFitImages();
authorization();
registration();
logout();
