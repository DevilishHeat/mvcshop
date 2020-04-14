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
    if (isset($_GET['page_number'])) {
      $data['cur_page'] = $_GET['page_number'];
    } else {
      $data['cur_page'] = 1;
    }
    $this->view->generate('view_catalog.php', 'view_template.php', $data);
  }
}