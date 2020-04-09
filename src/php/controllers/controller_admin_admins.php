<?php
class controller_admin_admins extends controller
{
    public function __construct()
    {
        parent::__construct();
        $this->model = new model_admin_admins();
    }

    public function action_index()
    {
        $data = $this->model->get_data();
        $this->view->generate('view_admin_admins.php', 'view_template_admin.php', $data);
    }

    public function action_create_admin()
    {
        if ($_POST['password'] == $_POST['password_repeat'] and $_POST['login'] != '')
        {
            $json = $this->model->create_admin();
            header('Content-Type: application/json');
            echo json_encode($json);
        } else
        {
          $json = array(
            'status'=> 400,
            'message'=> 'Вевведены некорректные данные'
          );
          header('Content-Type: application/json');
          echo json_encode($json);
        }
    }

    public function action_delete_admin()
    {
      $json = $this->model->delete_admin();
      header('Content-Type: application/json');
      echo json_encode($json);
    }

    public function action_change_password()
    {
      if ($this->model->get_password() == $_POST['old_password'])
      {
        if ($_POST['new_password'] == $_POST['repeat_password'])
        {
          $json = $this->model->update_password();
          header('Content-Type: application/json');
          echo json_encode($json);
        } else
        {
          $json = array(
            'status'=> 400,
            'message'=> 'Пароли не совпадают',
          );
          header('Content-Type: application/json');
          echo json_encode($json);
        }
      } else
      {
        $json = array(
          'status'=> 400,
          'message'=> 'Старый пароль не подходит',
        );
        header('Content-Type: application/json');
        echo json_encode($json);
      }
    }
}