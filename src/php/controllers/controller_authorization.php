<?php
class controller_authorization extends controller
{
    public function __construct()
    {
        parent::__construct();
        $this->model = new model_authorization();
    }

    public function action_index()
    {
      $json = $this->model->authorization();
      header('Content-Type: application/json');
      echo $json;
    }

    public function action_logout()
    {
        $_SESSION['authorization'] = false;
        unset($_SESSION['username']);
        header('Location: http://mvcshop.com' . $_POST['location']);
        die();
    }
}