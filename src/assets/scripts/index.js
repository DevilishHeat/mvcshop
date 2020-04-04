import 'svgxuse';
import objectFitImages from './polyfills/objectFitImages';

import * as authorization from './modules/authorization';
import registration from './modules/registration';
import * as cart from './modules/cart';

objectFitImages();
authorization.authorization();
authorization.logout();
registration();
cart.add_item();
cart.delete_item();
