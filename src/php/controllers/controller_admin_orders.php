<?php
class controller_admin_orders extends controller
{
  public function __construct()
  {
    parent::__construct();
  }

  public function action_index()
  {
    $this->view->generate('view_admin_orders.php', 'view_template_admin.php');
  }
}