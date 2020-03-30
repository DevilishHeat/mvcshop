<?php
class controller_registration extends controller
{
    public function __construct()
    {
        parent::__construct();
        $this->model = new model_registration();
    }

    public function action_index()
    {
      header('Content-Type: application/json');
      if ($_POST['password'] == $_POST['password_repeat'])
      {
        if ($this->model->username_available())
        {
          if ($this->model->email_available())
          {
            $json = $this->model->create_user();
            echo json_encode($json,JSON_UNESCAPED_UNICODE);
          } else
          {
            $json = array(
              'status'=>400,
              'message'=>'Почтовый ящик занят'
            );
            echo json_encode($json,JSON_UNESCAPED_UNICODE);
          }
        } else
        {
          $json = array(
            'status'=>400,
            'message'=>'Пользователь с таким именем уже существует'
          );
          echo json_encode($json,JSON_UNESCAPED_UNICODE);
        }
      } else
      {
        $json = array(
          'status' => 400,
          'message' => 'Пароли не совпадают'
        );
        echo json_encode($json,JSON_UNESCAPED_UNICODE);
      }
    }
}