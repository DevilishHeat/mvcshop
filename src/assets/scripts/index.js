import 'svgxuse';
import objectFitImages from './polyfills/objectFitImages';

import * as authorization from './modules/authorization';
import registration from './modules/registration';
import * as cart from './modules/cart';
import * as admin_authorization from './modules/admin_authorization';
import * as admin_orders from './modules/admin_orders';
import * as admin_admins from './modules/admin_admins';

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
admin_orders.delete_order();
admin_admins.create_admin();
admin_admins.change_password();
admin_admins.delete_admin();