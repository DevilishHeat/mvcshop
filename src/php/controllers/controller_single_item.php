<?php
class controller_single_item extends controller
{
  public function __construct()
  {
    parent::__construct();
    $this->model = new model_single_item();
  }

  public function action_index()
  {
    $data = $this->model->get_data();
    $this->view->generate('view_single_item.php', 'view_template.php', $data);
  }
}