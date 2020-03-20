<?php
class controller_admin_categories extends controller
{
  public function __construct()
  {
    parent::__construct();
    $this->model = new model_admin_categories();
  }

  public function action_index()
  {
    $data = $this->model->get_data();
    $this->view->generate('view_admin_categories.php', 'view_template_admin.php', $data);
  }

  public function action_delete_category()
  {
    $this->model->delete_category();
    header('Location: http://mvcshop.com/admin_categories');
    die();
  }

  public function action_update_category()
  {
    $this->model->update_category();
    header('Location: http://mvcshop.com/admin_categories');
    die();
  }

  public function action_create_category()
  {
    $this->model->create_category();
    header('Location: http://mvcshop.com/admin_categories');
    die();
  }
}