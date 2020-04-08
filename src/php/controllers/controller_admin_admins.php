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
            $this->model->create_admin();
            header('Location: http://mvcshop.com/admin_admins');
            die();
        } else
        {
            $_SESSION['message'] = 'Введенны недопустимые данные';
            header('Location: http://mvcshop.com/admin_admins');
            die();
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
      $this->view->generate('view_admin_admins_change_password.php', 'view_template_admin.php');
    }

    public function action_update_password()
    {
      if ($this->model->get_password() == $_POST['old_password'])
      {
        if ($_POST['new_password'] == $_POST['password_repeat'])
        {
          $this->model->update_password();
          header('Location: http://mvcshop.com/admin_admins');
          die();
        } else
        {
          $_SESSION['message'] = 'Пароли не совпадают';
          header('Location: http://mvcshop.com/admin_admins/change_password');
          die();
        }
      } else
      {
        $_SESSION['message'] = 'Старый пароль не подходит';
        header('Location: http://mvcshop.com/admin_admins/change_password');
        die();
      }
    }
}