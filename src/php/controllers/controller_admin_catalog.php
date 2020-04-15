<?php
class controller_admin_catalog extends controller
{
    public function __construct()
    {
        parent::__construct();
        $this->model = new model_admin_catalog();
    }

    public function action_index()
    {
        $data = $this->model->get_data();
        $this->view->generate('view_admin_catalog.php', 'view_template_admin.php', $data);
    }

    public function action_change_item()
    {
        $json = $this->model->change_item();

        echo json_encode($json);
    }

    public function action_delete_item()
    {
      $json = $this->model->delete_item();
      header('Content-Type: application/json');
      echo json_encode($json);
    }

    public function action_create_item()
    {
      $name = $_FILES['image']['tmp_name'];
      $path = "./assets/images/";
      if (move_uploaded_file($name, $path . $_POST['name'] . '.jpg')) {
        $json = $this->model->create_item();
        header('Content-Type: application/json');
        echo json_encode($json);
      }
      else {
        $json = array(
          'status'=> 400,
          'message'=> 'Наименование товара не должно содержать символы / ? * : ; { } \ ',
        );
        header('Content-Type: application/json');
        echo json_encode($json);
      }
    }
}