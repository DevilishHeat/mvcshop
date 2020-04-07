import 'svgxuse';
import objectFitImages from './polyfills/objectFitImages';

import * as authorization from './modules/authorization';
import registration from './modules/registration';
import * as cart from './modules/cart';
import * as admin_authorization from './modules/admin_authorization';

objectFitImages();
authorization.authorization();
authorization.logout();
registration();
cart.add_item();
cart.delete_item();
cart.create_order();
cart.total_price_calculation();
admin_authorization.authorization();
admin_authorization.logout();
