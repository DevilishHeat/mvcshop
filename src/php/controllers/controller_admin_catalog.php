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

    public function action_update_item()
    {
        $this->model->update_item();
        header('Location: http://mvcshop.com/admin_catalog');
        die();
    }

    public function action_delete_item()
    {
      $this->model->delete_item();
      header('Location: http://mvcshop.com/admin_catalog');
      die();
    }

    public function action_create_item()
    {
      $name = $_FILES['img']['tmp_name'];
      $path = "../src/assets/images/";
      move_uploaded_file($name, $path . $_POST['name'] . '.jpg');
      $this->model->create_item();
      header('Location: http://mvcshop.com/admin_catalog');
      die();
    }
}