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
      if ($_POST['password'] == $_POST['password_repeat'])
      {
        if ($this->model->username_available())
        {
          if ($this->model->email_available())
          {
            $json = $this->model->create_user();
            return json_encode($json);
          } else
          {
            $json = [
              'status'=>400,
              'message'=>'Почтовый ящик занят'
            ];
            return json_encode($json);
          }
        } else
        {
          $json = [
            'status'=>400,
            'message'=>'Пользователь с таким именем уже существует'
          ];
          return json_encode($json);
        }
      } else
      {
        $json = [
          'status'=>400,
          'message'=>'Пароли не совпадают'
        ];
        return json_encode($json);
      }
    }
}