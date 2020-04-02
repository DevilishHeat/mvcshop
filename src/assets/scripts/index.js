import 'svgxuse';
import objectFitImages from './polyfills/objectFitImages';

import authorization from './modules/authorization';
import registration from './modules/registration';
import logout from './modules/logout';
import add_item from './modules/add_item';

objectFitImages();
authorization();
registration();
logout();
add_item();
