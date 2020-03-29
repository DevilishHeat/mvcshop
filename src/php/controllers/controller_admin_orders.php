<?php
class controller_admin_orders extends controller
{
  public function __construct()
  {
    parent::__construct();
    $this->model = new model_admin_orders();
  }

  public function action_index()
  {
    $data = $this->model->get_data();
    $this->view->generate('view_admin_orders.php', 'view_template_admin.php', $data);
  }

  public function action_delete_order()
  {
    $this->model->delete_order();
    header('Location: http://mvcshop.com/admin_orders');
    die();
  }
}