<?php
class controller_catalog extends controller
{
  public function __construct()
  {
    parent::__construct();
    $this->model = new model_catalog();
  }
  public function action_index()
  {
    $data = $this->model->get_data();
    $this->view->generate('view_catalog.php', 'view_template.php', $data);
  }
}