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
      if ($json['status'] == 200)
      {
        $_SESSION['username'] = $json['username'];
      }
      header('Content-Type: application/json');
      echo json_encode($json, JSON_UNESCAPED_UNICODE);
    }

    public function action_logout()
    {
      unset($_SESSION['username']);
    }
}